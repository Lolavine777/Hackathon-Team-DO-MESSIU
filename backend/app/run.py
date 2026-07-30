"""Một lượt mở checkpoint (quiz run) và toàn bộ vòng đời của nó."""

import time

from . import content, rules, simulator

DELIVERY_SEC = 1.5  # thời gian ước lượng để mọi client nhận được sự kiện


class QuizRun:
    def __init__(self, run_id: str, checkpoint: dict, kind: str = "primary", parent_id: str | None = None):
        question_id = (
            checkpoint["follow_up_question_id"] if kind == "follow_up" else checkpoint["question_id"]
        )
        self.id = run_id
        self.checkpoint = checkpoint
        self.question = content.question(question_id)
        self.correct_key = content.correct_key(self.question)
        self.kind = kind
        self.parent_id = parent_id

        self.duration_sec = checkpoint["duration_sec"]
        self.extended_sec = 0
        self.opened_at = time.time()
        self.closed_at: float | None = None
        self.status = "running"

        self.responses: dict[str, dict] = {}
        self.client_keys: dict[str, str] = {}  # idempotency_key -> user_id
        self.actions: list[dict] = []
        self.feedback: bool | None = None
        self.schedule = simulator.build_schedule(
            self.question, self.correct_key, self.duration_sec, seed=f"{run_id}:{question_id}"
        )

    # --- thời gian ------------------------------------------------------

    @property
    def window_sec(self) -> int:
        return self.duration_sec + self.extended_sec

    def elapsed(self) -> float:
        return (self.closed_at or time.time()) - self.opened_at

    def remaining_sec(self) -> int:
        if self.status != "running":
            return 0
        return max(0, int(round(self.window_sec - self.elapsed())))

    def expired(self) -> bool:
        return self.status == "running" and self.elapsed() >= self.window_sec

    def received(self) -> int:
        online = content.SESSION["online"]
        return min(online, int(online * min(1.0, self.elapsed() / DELIVERY_SEC)))

    # --- vòng đời -------------------------------------------------------

    def extend(self, seconds: int) -> None:
        if self.status != "running":
            raise ValueError("Checkpoint đã đóng, không thể gia hạn.")
        self.extended_sec += seconds

    def close(self, at: float | None = None) -> None:
        if self.status != "running":
            return
        self.closed_at = at if at is not None else time.time()
        self.status = "closed"

    def cancel(self) -> None:
        self.closed_at = time.time()
        self.status = "cancelled"

    def submit(self, user_id: str, option_key: str, confidence: str, client_key: str | None) -> dict:
        if self.status != "running":
            raise ValueError("Checkpoint đã đóng.")
        if option_key not in {o["key"] for o in self.question["options"]}:
            raise ValueError("Đáp án không hợp lệ.")
        if client_key and client_key in self.client_keys:
            return self.responses[self.client_keys[client_key]]  # at-least-once, không đếm trùng

        entry = {
            "user_id": user_id,
            "option_key": option_key,
            "confidence": confidence,
            "at": round(self.elapsed(), 2),
            "source": "live",
        }
        self.responses[user_id] = entry  # unique (run_id, user_id)
        if client_key:
            self.client_keys[client_key] = user_id
        return entry

    # --- số liệu --------------------------------------------------------

    def collected(self) -> list[dict]:
        cutoff = min(self.elapsed(), self.window_sec)
        simulated = [r for r in self.schedule if r["at"] <= cutoff]
        return simulated + list(self.responses.values())

    def aggregate(self) -> dict:
        audience = content.SESSION["enrolled"]
        return rules.aggregate(self.question, self.collected(), audience)

    def decision(self, agg: dict | None = None) -> dict:
        return rules.evaluate(
            self.question, agg or self.aggregate(), has_follow_up=self.kind == "primary"
        )

    def my_response(self, user_id: str | None) -> dict | None:
        entry = self.responses.get(user_id) if user_id else None
        return {"optionKey": entry["option_key"], "confidence": entry["confidence"]} if entry else None

    # --- payload --------------------------------------------------------

    def _question_payload(self, revealed: bool, for_teacher: bool) -> dict:
        options = [{"key": o["key"], "text": o["text"]} for o in self.question["options"]]
        payload = {"id": self.question["id"], "prompt": self.question["prompt"], "options": options}
        if for_teacher or revealed:
            payload["correct"] = self.correct_key
            payload["explain"] = self.question["explain"]
        return payload

    def public(self, role: str, user_id: str | None) -> dict:
        revealed = self.status == "closed"
        for_teacher = role == "teacher"
        agg = self.aggregate()

        data = {
            "id": self.id,
            "checkpointId": self.checkpoint["id"],
            "kind": self.kind,
            "parentRunId": self.parent_id,
            "order": self.checkpoint["order"],
            "page": self.checkpoint["page"],
            "title": self.checkpoint["title"],
            "learningOutcome": {
                "id": self.checkpoint["learning_outcome"],
                "label": content.LEARNING_OUTCOMES[self.checkpoint["learning_outcome"]],
            },
            "scoringMode": self.checkpoint["scoring_mode"],
            "durationSec": self.duration_sec,
            "extendedSec": self.extended_sec,
            "windowSec": self.window_sec,
            "remainingSec": self.remaining_sec(),
            "status": self.status,
            "revealed": revealed,
            "receivedCount": self.received(),
            "onlineCount": content.SESSION["online"],
            "question": self._question_payload(revealed, for_teacher),
            "myResponse": self.my_response(user_id),
            "actions": self.actions,
            "feedback": self.feedback,
        }

        if for_teacher:
            data["aggregate"] = agg
            data["decision"] = self.decision(agg)
        elif revealed:
            # Sau khi công bố, sinh viên chỉ thấy số liệu tổng hợp — không có decision.
            data["aggregate"] = {
                k: agg[k]
                for k in ("responded", "audience", "participation", "distribution", "correctRate", "correctKey")
            }
        else:
            data["aggregate"] = {
                k: agg[k] for k in ("responded", "audience", "participation")
            }
        return data
