"""Trạng thái phiên giảng in-memory (đủ cho MVP, không có DB)."""

import time
import uuid

from . import content, events, rules
from .run import QuizRun


class LectureSession:
    def __init__(self) -> None:
        self.started_at = time.time()
        self.page = 1
        self.revision = 0
        self.last_event = "session.started"

        self.runs: dict[str, QuizRun] = {}
        self.order: list[str] = []
        self.recoveries: dict[str, dict] = {}  # primary_run_id -> recovery result

        self.pulse = dict(content.PULSE)
        self.topics = [dict(t) for t in content.TOPICS]
        self.questions = [dict(q) for q in content.QUESTIONS]
        self.clarifications = [dict(c) for c in content.CLARIFICATIONS]
        self.hints: list[dict] = []  # hint gửi tới nhóm chọn cùng một đáp án sai

    # --- hạ tầng --------------------------------------------------------

    def _emit(self, event: str) -> None:
        self.revision += 1
        self.last_event = event
        events.notify()

    def tick(self) -> None:
        """Đóng checkpoint đã hết giờ (được gọi lazily trước mỗi lần đọc state)."""
        for run in self.runs.values():
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
                self.clarifications.insert(
                    0,
                    {
                        "id": f"cl_{uuid.uuid4().hex[:8]}",
                        "page": run.checkpoint["page"],
                        "title": f"Ví dụ đã duyệt · {example['title']}",
                        "body": example["body"],
                    },
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
        self.pulse = {"understand": 0, "unclear": 0, "stuck": 0}
        self._emit("pulse.reset")
        return self.pulse

    def vote_topic(self, topic_id: str) -> list[dict]:
        for topic in self.topics:
            if topic["id"] == topic_id:
                topic["votes"] += 1
        self._emit("topic.voted")
        return self.topics

    def ask(self, text: str, page: int, scope: str) -> dict:
        item = {
            "id": f"qs_{uuid.uuid4().hex[:8]}",
            "page": page,
            "scope": scope,
            "author": "Riêng tư" if scope == "private" else "Ẩn danh",
            "text": text,
            "echo": 0,
            "status": "pending",
            "time": "Vừa xong",
        }
        self.questions.insert(0, item)
        self._emit("question.asked")
        return item

    def answer_question(self, question_id: str, text: str, share: bool) -> dict:
        for q in self.questions:
            if q["id"] == question_id:
                q.update(status="answered", answer=text, shared=share)
                self._emit("question.answered")
                return q
        raise KeyError(question_id)

    def publish_clarification(self, title: str, body: str, page: int) -> dict:
        item = {"id": f"cl_{uuid.uuid4().hex[:8]}", "page": page, "title": title, "body": body}
        self.clarifications.insert(0, item)
        self._emit("clarification.published")
        return item

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

    def state(self, role: str, user_id: str | None) -> dict:
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
            "activeRun": active.public(role, user_id) if active else None,
            "history": history,
            "recoveries": self.recoveries,
            "hints": self._visible_hints(role, user_id),
            "report": self.report() if role == "teacher" else None,
            "pulse": self.pulse,
            "topics": self.topics,
            "questions": self.questions,
            "clarifications": self.clarifications,
        }


live = LectureSession()
