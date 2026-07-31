"""Trạng thái phiên giảng in-memory (đủ cho MVP, không có DB)."""

import time
import uuid

from . import content, events, rules
from .run import QuizRun

# Slide là chỗ để nhìn nội dung bài học, không phải bảng tin: mỗi trang chỉ giữ vài ghim.
MAX_PINS_PER_PAGE = 3

# Client SSE đọc lại snapshot ít nhất 5 giây một lần; quá ngưỡng này mà không thấy
# tăm hơi thì coi như máy đó đã rời lớp.
PRESENCE_TTL_SEC = 20

EMPTY_PULSE = {"understand": 0, "unclear": 0, "stuck": 0}


class LectureSession:
    """Phiên bắt đầu rỗng: mọi con số dưới đây chỉ lớn lên khi có người thật tương tác."""

    def __init__(self) -> None:
        self.started_at = time.time()
        self.page = 1
        self.revision = 0
        self.last_event = "session.started"

        self.runs: dict[str, QuizRun] = {}
        self.order: list[str] = []
        self.recoveries: dict[str, dict] = {}  # primary_run_id -> recovery result

        self.seen: dict[str, float] = {}  # user_id học viên -> lần cuối máy còn nói chuyện
        self.pulse = dict(EMPTY_PULSE)
        self.questions: list[dict] = []
        self.clarifications: list[dict] = []
        self.hints: list[dict] = []  # hint gửi tới nhóm chọn cùng một đáp án sai

        # Những mục đang dán trực tiếp lên slide: giải thích của trợ giảng và
        # vướng mắc của một bạn được đưa lên cho cả lớp cùng soi.
        self.pins: list[dict] = []
        self.echoes: dict[str, set[str]] = {}  # question_id -> ai đã bấm "tôi cũng gặp"

        # Nhóm câu hỏi do trợ lý gom lại. `cluster_source_ids` ghi nhớ đúng tập câu hỏi
        # đã dùng để gom, nhờ đó biết được kết quả có còn khớp hiện tại hay không.
        self.clusters: list[dict] = []
        self.cluster_source_ids: set[str] = set()

    # --- hạ tầng --------------------------------------------------------

    def _emit(self, event: str) -> None:
        self.revision += 1
        self.last_event = event
        events.notify()

    # --- ai đang thực sự ở trong lớp -------------------------------------

    def touch(self, role: str, user_id: str | None) -> None:
        """Ghi nhận một học viên còn đang mở lớp. Giảng viên không tính vào sĩ số."""
        if role == "learner" and user_id:
            self.seen[user_id] = time.time()

    def online(self) -> int:
        cutoff = time.time() - PRESENCE_TTL_SEC
        self.seen = {uid: at for uid, at in self.seen.items() if at >= cutoff}
        return len(self.seen)

    def tick(self) -> None:
        """Đóng checkpoint đã hết giờ (được gọi lazily trước mỗi lần đọc state)."""
        present = self.online()
        for run in self.runs.values():
            if run.status == "running":
                run.note_audience(present)
            if run.expired():
                run.close(at=run.opened_at + run.window_sec)
                self._finalize(run)
                self._emit("checkpoint.closed")

    def _finalize(self, run: QuizRun) -> None:
        """Sau khi đóng: nếu là follow-up thì chốt kết quả phục hồi."""
        if run.kind != "follow_up" or not run.parent_id:
            return
        parent = self.runs.get(run.parent_id)
        if parent:
            self.recoveries[parent.id] = rules.classify_recovery(parent.aggregate(), run.aggregate())

    def active_run(self) -> QuizRun | None:
        for run_id in reversed(self.order):
            run = self.runs[run_id]
            if run.status != "cancelled":
                return run
        return None

    def get_run(self, run_id: str) -> QuizRun:
        run = self.runs.get(run_id)
        if run is None:
            raise KeyError(run_id)
        return run

    # --- vòng đời checkpoint --------------------------------------------

    def launch(self, checkpoint_id: str, kind: str = "primary", parent_id: str | None = None) -> QuizRun:
        checkpoint = content.checkpoint(checkpoint_id)
        if checkpoint is None:
            raise KeyError(checkpoint_id)
        running = self.active_run()
        if running and running.status == "running":
            raise ValueError("Đang có checkpoint mở — hãy đóng trước khi mở checkpoint mới.")

        run = QuizRun(f"run_{uuid.uuid4().hex[:8]}", checkpoint, kind=kind, parent_id=parent_id)
        run.note_audience(self.online())  # chốt sĩ số ngay, phòng khi đề đóng trước tick kế tiếp
        self.runs[run.id] = run
        self.order.append(run.id)
        self.page = checkpoint["page"]
        self._emit("follow_up.launched" if kind == "follow_up" else "checkpoint.launched")
        return run

    def launch_follow_up(self, run_id: str) -> QuizRun:
        parent = self.get_run(run_id)
        if parent.kind != "primary":
            raise ValueError("Chỉ chạy follow-up cho checkpoint gốc.")
        if parent.status == "running":
            raise ValueError("Hãy đóng checkpoint gốc trước.")
        return self.launch(parent.checkpoint["id"], kind="follow_up", parent_id=parent.id)

    def extend(self, run_id: str, seconds: int) -> QuizRun:
        run = self.get_run(run_id)
        run.extend(seconds)
        self._emit("checkpoint.extended")
        return run

    def close(self, run_id: str) -> QuizRun:
        run = self.get_run(run_id)
        run.close()
        self._finalize(run)
        self._emit("class_pulse.ready")
        return run

    def cancel(self, run_id: str) -> QuizRun:
        run = self.get_run(run_id)
        run.cancel()
        self._emit("checkpoint.cancelled")
        return run

    def respond(self, run_id: str, user_id: str, option_key: str, confidence: str, client_key: str | None) -> dict:
        run = self.get_run(run_id)
        entry = run.submit(user_id, option_key, confidence, client_key)
        # Người vừa trả lời chắc chắn đang trong lớp, kể cả khi snapshot chưa kịp ghi nhận.
        self.touch("learner", user_id)
        run.note_audience(self.online())
        self._emit("response.count.updated")
        return entry

    def record_action(self, run_id: str, action_code: str, actor: str) -> dict:
        run = self.get_run(run_id)
        if action_code not in content.ACTION_CATALOG:
            raise ValueError("Hành động không nằm trong catalog đã duyệt.")
        item = {
            "code": action_code,
            "label": content.ACTION_CATALOG[action_code]["label"],
            "actor": actor,
            "at": round(time.time() - self.started_at),
        }
        run.actions.append(item)
        self._apply_side_effect(run, action_code)
        self._emit("teacher_action.selected")
        return item

    def _apply_side_effect(self, run: QuizRun, action_code: str) -> None:
        """Vài action có tác động nhìn thấy được ngay trên màn hình sinh viên."""
        if action_code == "SHOW_APPROVED_EXAMPLE":
            example = content.APPROVED_EXAMPLES.get(run.checkpoint["example_id"])
            if example:
                self.publish_clarification(
                    f"Ví dụ đã duyệt · {example['title']}", example["body"], run.checkpoint["page"]
                )
        elif action_code == "SEND_HINT_GROUP":
            cluster = run.decision()["cluster"]
            if not cluster:
                return
            tiers = content.MISCONCEPTIONS[cluster["code"]]["hints"]
            self.hints.insert(
                0,
                {
                    "id": f"hint_{uuid.uuid4().hex[:8]}",
                    "runId": run.id,
                    "code": cluster["code"],
                    "label": cluster["label"],
                    "optionKey": cluster["optionKey"],
                    "tiers": tiers,
                },
            )

    def record_feedback(self, run_id: str, helpful: bool) -> None:
        self.get_run(run_id).feedback = helpful
        self._emit("insight.feedback")

    def note_drafted_checkpoint(self) -> None:
        """Có checkpoint mới được duyệt — bump revision để client tải lại danh sách."""
        self._emit("checkpoint.drafted")

    def set_page(self, page: int) -> int:
        self.page = page
        self._emit("slide.changed")
        return self.page

    # --- pulse & hỏi đáp -------------------------------------------------

    def send_pulse(self, value: str) -> dict:
        self.pulse[value] = self.pulse.get(value, 0) + 1
        self._emit("pulse.updated")
        return self.pulse

    def reset_pulse(self) -> dict:
        self.pulse = dict(EMPTY_PULSE)
        self._emit("pulse.reset")
        return self.pulse

    def ask(
        self,
        text: str,
        page: int,
        scope: str,
        category: str | None = None,
        user_id: str | None = None,
    ) -> dict:
        item = {
            "id": f"qs_{uuid.uuid4().hex[:8]}",
            "page": page,
            "scope": scope,
            "category": category,
            "author": "Riêng tư" if scope == "private" else "Ẩn danh",
            "authorId": user_id,
            "text": text,
            "echo": 0,
            "status": "pending",
            "time": "Vừa xong",
        }
        self.questions.insert(0, item)
        self._emit("question.asked")
        return item

    def _question(self, question_id: str) -> dict:
        for q in self.questions:
            if q["id"] == question_id:
                return q
        raise KeyError(question_id)

    def claim_question(self, question_id: str, actor: str = "teacher") -> dict:
        """Trợ giảng nhận hỗ trợ — để hai người không cùng trả lời một câu."""
        question = self._question(question_id)
        if question["status"] in ("answered", "resolved"):
            raise ValueError("Câu hỏi này đã được xử lý xong.")
        question.update(status="claimed", claimedBy=actor)
        self._emit("question.claimed")
        return question

    def answer_question(self, question_id: str, text: str, share: bool) -> dict:
        question = self._question(question_id)
        question.update(status="answered", answer=text, shared=share)
        self._emit("question.answered")
        return question

    def resolve_question(self, question_id: str, understood: bool, user_id: str | None = None) -> dict:
        """Người hỏi tự chốt: đã hiểu thì đóng, vẫn kẹt thì đẩy lên giảng viên."""
        question = self._question(question_id)
        owner = question.get("authorId")
        if owner and user_id and owner != user_id:
            raise PermissionError("Chỉ người đã hỏi mới đóng được câu hỏi này.")
        if understood:
            question.update(status="resolved", escalated=False)
        else:
            question.update(status="escalated", escalated=True)
        self._emit("question.resolved" if understood else "question.escalated")
        return question

    # --- gom câu hỏi tương tự ---------------------------------------------

    def open_question_ids(self) -> set[str]:
        """Các câu còn cần xử lý — đúng tập mà trợ lý được phép đem đi gom."""
        return {q["id"] for q in self.questions if q["status"] in ("pending", "claimed", "escalated")}

    def set_clusters(self, clusters: list[dict], source_ids: set[str]) -> list[dict]:
        self.clusters = clusters
        self.cluster_source_ids = set(source_ids)
        self._emit("questions.grouped")
        return clusters

    def clusters_stale(self) -> bool:
        """Có câu hỏi mới (hoặc vừa xử lý xong) kể từ lần gom gần nhất."""
        return bool(self.clusters) and self.open_question_ids() != self.cluster_source_ids

    def broadcast_cluster(self, cluster_id: str, title: str, body: str, page: int) -> dict:
        """Trả lời một lần cho cả nhóm: đăng lên màn hình lớp và đóng mọi câu trong nhóm."""
        cluster = next((c for c in self.clusters if c["id"] == cluster_id), None)
        if cluster is None:
            raise KeyError(cluster_id)

        clarification = self.publish_clarification(title, body, page)
        for question_id in cluster["questionIds"]:
            try:
                self._question(question_id).update(status="answered", answer=body, shared=True)
            except KeyError:
                continue  # câu hỏi đã bị xử lý ở đường khác — bỏ qua, không làm hỏng broadcast
        cluster["answered"] = True
        self._emit("cluster.broadcast")
        return {"cluster": cluster, "clarification": clarification}

    def publish_clarification(self, title: str, body: str, page: int) -> dict:
        item = {"id": f"cl_{uuid.uuid4().hex[:8]}", "page": page, "title": title, "body": body}
        self.clarifications.insert(0, item)
        # Giải thích chỉ có tác dụng khi học viên nhìn thấy ngay trên slide đang chiếu,
        # nên đăng là ghim luôn — không bắt học viên đi tìm trong danh sách bên phải.
        item["pinId"] = self._pin("clarification", page, title, body, item["id"])["id"]
        self._emit("clarification.published")
        return item

    # --- ghim lên slide ---------------------------------------------------

    def _pin(self, kind: str, page: int, title: str, body: str, ref_id: str | None = None) -> dict:
        item = {
            "id": f"pin_{uuid.uuid4().hex[:8]}",
            "kind": kind,
            "page": page,
            "title": title,
            "body": body,
            "refId": ref_id,
            "time": "Vừa xong",
        }
        self.pins.insert(0, item)
        keep = [p["id"] for p in self.pins if p["page"] == page][:MAX_PINS_PER_PAGE]
        self.pins = [p for p in self.pins if p["page"] != page or p["id"] in keep]
        return item

    def pin_question(self, question_id: str) -> dict:
        """Đưa vướng mắc của một bạn lên slide để cả lớp soi xem mình có gặp giống không."""
        question = self._question(question_id)
        if any(p["refId"] == question_id for p in self.pins):
            raise ValueError("Câu hỏi này đang được ghim rồi.")
        question["pinned"] = True
        item = self._pin(
            "question", question["page"], "Vướng mắc của một bạn trong lớp", question["text"], question_id
        )
        self._emit("question.pinned")
        return item

    def unpin(self, pin_id: str) -> dict:
        pin = next((p for p in self.pins if p["id"] == pin_id), None)
        if pin is None:
            raise KeyError(pin_id)
        self.pins = [p for p in self.pins if p["id"] != pin_id]
        if pin["kind"] == "question":
            try:
                self._question(pin["refId"])["pinned"] = False
            except KeyError:
                pass  # câu hỏi đã biến mất — gỡ ghim vẫn phải thành công
        self._emit("pin.removed")
        return pin

    def echo_question(self, question_id: str, user_id: str | None = None) -> dict:
        """Học viên bấm 'Tôi cũng gặp' — mỗi người chỉ được tính một lần cho mỗi câu."""
        question = self._question(question_id)
        voted = self.echoes.setdefault(question_id, set())
        voter = user_id or "anon"
        if voter in voted:
            raise ValueError("Bạn đã đánh dấu câu này rồi.")
        voted.add(voter)
        question["echo"] = question.get("echo", 0) + 1
        self._emit("question.echoed")
        return question

    def pinned(self) -> list[dict]:
        """Ghim câu hỏi kèm số 'tôi cũng gặp' mới nhất, đọc thẳng từ câu hỏi gốc."""
        out = []
        for pin in self.pins:
            if pin["kind"] != "question":
                out.append(pin)
                continue
            try:
                out.append({**pin, "echo": self._question(pin["refId"])["echo"]})
            except KeyError:
                out.append({**pin, "echo": 0})
        return out

    # --- báo cáo ---------------------------------------------------------

    def report(self) -> dict:
        timeline, participations = [], []
        intervened = recovered = 0

        for run_id in self.order:
            run = self.runs[run_id]
            if run.status == "cancelled" or run.kind != "primary":
                continue
            agg = run.aggregate()
            recovery = self.recoveries.get(run.id)
            participations.append(agg["participation"])
            if run.actions:
                intervened += 1
            if recovery and recovery["status"] == "RECOVERED":
                recovered += 1
            timeline.append(
                {
                    "runId": run.id,
                    "order": run.checkpoint["order"],
                    "page": run.checkpoint["page"],
                    "title": run.checkpoint["title"],
                    "learningOutcome": content.LEARNING_OUTCOMES[run.checkpoint["learning_outcome"]],
                    "status": run.status,
                    "participation": agg["participation"],
                    "correctRate": agg["correctRate"],
                    "lowConfidenceRate": agg["lowConfidenceRate"],
                    "topMisconception": agg["misconceptions"][0] if agg["misconceptions"] else None,
                    "decisionStatus": run.decision(agg)["status"],
                    "actions": run.actions,
                    "recovery": recovery,
                }
            )

        follow_ups = [r for r in self.recoveries.values()]
        return {
            "sessionMinutes": round((time.time() - self.started_at) / 60, 1),
            "checkpointCount": len(timeline),
            "avgParticipation": round(sum(participations) / len(participations), 1) if participations else 0.0,
            "interventionCount": intervened,
            "followUpCount": len(follow_ups),
            "conceptRecoveryRate": round(recovered / len(follow_ups) * 100, 1) if follow_ups else None,
            "timeline": timeline,
            "weakest": sorted(timeline, key=lambda t: t["correctRate"])[:3],
        }

    # --- snapshot cho client ---------------------------------------------

    def _visible_hints(self, role: str, user_id: str | None) -> list[dict]:
        """Sinh viên chỉ nhận hint của đúng lỗi mình mắc; giảng viên thấy tất cả."""
        if role == "teacher":
            return self.hints
        visible = []
        for hint in self.hints:
            run = self.runs.get(hint["runId"])
            mine = run.responses.get(user_id) if run and user_id else None
            if mine and mine["option_key"] == hint["optionKey"]:
                visible.append(hint)
        return visible

    def _visible_questions(self, role: str, user_id: str | None) -> list[dict]:
        """Yêu cầu riêng chỉ người gửi và trợ giảng đọc được — cắt ở server, không ẩn ở UI."""
        if role == "teacher":
            return self.questions
        return [
            q
            for q in self.questions
            if q["scope"] != "private" or (user_id and q.get("authorId") == user_id)
        ]

    def state(self, role: str, user_id: str | None) -> dict:
        self.touch(role, user_id)  # mỗi lần đọc snapshot là một nhịp "tôi còn ở đây"
        self.tick()
        active = self.active_run()
        history = [
            self.runs[rid].public(role, user_id)
            for rid in reversed(self.order)
            if self.runs[rid].status == "closed"
        ]
        return {
            "revision": self.revision,
            "lastEvent": self.last_event,
            "page": self.page,
            # Sĩ số thật: số máy học viên còn đang mở lớp trong PRESENCE_TTL_SEC vừa rồi.
            "online": self.online(),
            "activeRun": active.public(role, user_id) if active else None,
            "history": history,
            "recoveries": self.recoveries,
            "hints": self._visible_hints(role, user_id),
            "report": self.report() if role == "teacher" else None,
            "pulse": self.pulse,
            "questions": self._visible_questions(role, user_id),
            # Nhóm câu hỏi là công cụ của trợ giảng; không đẩy sang máy học viên.
            "clusters": self.clusters if role == "teacher" else [],
            "clustersStale": self.clusters_stale() if role == "teacher" else False,
            "clarifications": self.clarifications,
            # Ghim nằm ngay trên slide nên cả lớp đều thấy, kể cả câu hỏi vốn riêng tư.
            "pins": self.pinned(),
        }


live = LectureSession()
