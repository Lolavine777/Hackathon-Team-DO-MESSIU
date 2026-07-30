"""REST + SSE cho VLearn Lecture Pulse."""

import json
import uuid

from fastapi import APIRouter, Header, HTTPException
from fastapi.responses import StreamingResponse

from . import ai, content, events, llm, rules, slides
from .config import settings
from .models import (
    ActionRequest,
    AnswerQuestionRequest,
    ClarificationRequest,
    DraftCheckpointRequest,
    ExtendRequest,
    FeedbackRequest,
    LoginRequest,
    PulseRequest,
    QuestionRequest,
    ResponseRequest,
    SelfTestRequest,
    SuggestRequest,
)
from .store import live

router = APIRouter(prefix="/api")


def require_teacher(role: str | None) -> None:
    """RBAC tối thiểu cho MVP — mọi thao tác điều khiển lớp là của giảng viên."""
    if role != "teacher":
        raise HTTPException(403, "Chỉ giảng viên mới thực hiện được thao tác này.")


def _run_or_404(run_id: str):
    try:
        return live.get_run(run_id)
    except KeyError:
        raise HTTPException(404, "Không tìm thấy lượt checkpoint.") from None


async def _generate(coro):
    """Đổi lỗi của trợ lý thành HTTP status có nghĩa, giữ nguyên thông điệp tiếng Việt."""
    try:
        return await coro
    except slides.SlideTextError as exc:
        raise HTTPException(422, str(exc)) from None
    except llm.LLMError as exc:
        raise HTTPException(503, str(exc)) from None


# --- phiên & nội dung ----------------------------------------------------


@router.post("/auth/login")
def login(payload: LoginRequest):
    account = content.ACCOUNTS.get(payload.role)
    if account is None:
        raise HTTPException(400, "Vai trò không hợp lệ")
    user_id = payload.user_id or f"{payload.role[:3]}_{uuid.uuid4().hex[:6]}"
    return {**account, "id": user_id}


def _checkpoint_payload(cp: dict, role: str) -> dict:
    question = content.question(cp["question_id"])
    data = {
        "id": cp["id"],
        "order": cp["order"],
        "page": cp["page"],
        "title": cp["title"],
        "durationSec": cp["duration_sec"],
        "scoringMode": cp["scoring_mode"],
        "learningOutcome": {
            "id": cp["learning_outcome"],
            "label": content.LEARNING_OUTCOMES[cp["learning_outcome"]],
        },
        "prompt": question["prompt"],
        "source": cp.get("source", "curated"),
    }
    if role == "teacher":  # sinh viên không được xem trước đáp án
        data["options"] = [
            {
                "key": o["key"],
                "text": o["text"],
                "correct": bool(o.get("correct")),
                "misconception": o.get("misconception"),
                "misconceptionLabel": content.misconception_label(o["misconception"])
                if o.get("misconception")
                else None,
            }
            for o in question["options"]
        ]
        data["followUpPrompt"] = content.question(cp["follow_up_question_id"])["prompt"]
        data["example"] = content.APPROVED_EXAMPLES.get(cp["example_id"])
    return data


@router.get("/session")
def get_session(x_vlearn_role: str | None = Header(default="learner")):
    role = x_vlearn_role or "learner"
    return {
        "session": content.SESSION,
        "material": content.MATERIAL,
        "checkpoints": [_checkpoint_payload(cp, role) for cp in content.CHECKPOINTS],
        "confidenceLevels": content.CONFIDENCE_LEVELS,
        "actionCatalog": content.ACTION_CATALOG,
        "thresholds": rules.THRESHOLDS,
        "ai": settings.public(),
    }


@router.put("/session/page/{page}")
def set_page(page: int, x_vlearn_role: str | None = Header(default=None)):
    require_teacher(x_vlearn_role)
    if page < 1 or page > content.MATERIAL["pages"]:
        raise HTTPException(400, "Trang không hợp lệ")
    return {"page": live.set_page(page)}


@router.get("/state")
def get_state(role: str = "learner", uid: str | None = None):
    return live.state(role, uid)


@router.get("/stream")
async def stream(role: str = "learner", uid: str | None = None):
    """Server-Sent Events: đẩy snapshot mỗi khi có thay đổi, tối đa 1 giây/lần khi quiz đang mở."""

    async def generator():
        while True:
            snapshot = live.state(role, uid)
            yield f"event: state\ndata: {json.dumps(snapshot, ensure_ascii=False)}\n\n"
            active = live.active_run()
            timeout = 1.0 if active and active.status == "running" else 5.0
            await events.wait_for_change(timeout)

    return StreamingResponse(
        generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive", "X-Accel-Buffering": "no"},
    )


# --- trợ lý soạn câu hỏi -------------------------------------------------
#
# Toàn bộ phần này nằm ngoài đường đi của snapshot: `live.state()` và `live.report()`
# chạy mỗi giây cho mọi client SSE, không được có lời gọi LLM nào ở trong đó.


@router.post("/ai/self-test")
async def self_test(payload: SelfTestRequest):
    """Bộ câu hỏi tự kiểm tra của riêng học viên — không đẩy lên lớp, không tính điểm."""
    return await _generate(ai.generate_self_test(payload.page, payload.count, payload.force))


@router.post("/ai/suggest-checkpoints")
async def suggest_checkpoints(payload: SuggestRequest, x_vlearn_role: str | None = Header(default=None)):
    require_teacher(x_vlearn_role)
    return await _generate(ai.suggest_checkpoints(payload.page, payload.count, payload.force))


@router.post("/checkpoints")
def create_checkpoint(payload: DraftCheckpointRequest, x_vlearn_role: str | None = Header(default=None)):
    """Giảng viên duyệt bản nháp thành checkpoint thật. AI không bao giờ tự xuất bản."""
    require_teacher(x_vlearn_role)
    if payload.page > content.MATERIAL["pages"]:
        raise HTTPException(400, "Trang không hợp lệ")

    checkpoint = content.register_drafted_checkpoint(payload)
    live.note_drafted_checkpoint()
    return _checkpoint_payload(checkpoint, "teacher")


# --- vòng đời checkpoint -------------------------------------------------


@router.post("/checkpoints/{checkpoint_id}/launch")
def launch(checkpoint_id: str, x_vlearn_role: str | None = Header(default=None)):
    require_teacher(x_vlearn_role)
    try:
        run = live.launch(checkpoint_id)
    except KeyError:
        raise HTTPException(404, "Không tìm thấy checkpoint") from None
    except ValueError as exc:
        raise HTTPException(409, str(exc)) from None
    return run.public("teacher", None)


@router.post("/runs/{run_id}/extend")
def extend(run_id: str, payload: ExtendRequest, x_vlearn_role: str | None = Header(default=None)):
    require_teacher(x_vlearn_role)
    try:
        return live.extend(run_id, payload.seconds).public("teacher", None)
    except KeyError:
        raise HTTPException(404, "Không tìm thấy lượt checkpoint") from None
    except ValueError as exc:
        raise HTTPException(409, str(exc)) from None


@router.post("/runs/{run_id}/close")
def close(run_id: str, x_vlearn_role: str | None = Header(default=None)):
    require_teacher(x_vlearn_role)
    _run_or_404(run_id)
    return live.close(run_id).public("teacher", None)


@router.post("/runs/{run_id}/cancel")
def cancel(run_id: str, x_vlearn_role: str | None = Header(default=None)):
    require_teacher(x_vlearn_role)
    _run_or_404(run_id)
    return live.cancel(run_id).public("teacher", None)


@router.post("/runs/{run_id}/responses")
def respond(run_id: str, payload: ResponseRequest):
    run = _run_or_404(run_id)
    try:
        live.respond(run_id, payload.user_id, payload.option_key, payload.confidence, payload.client_response_id)
    except ValueError as exc:
        raise HTTPException(409, str(exc)) from None
    return {"ok": True, "run": run.public("learner", payload.user_id)}


@router.get("/runs/{run_id}/pulse")
def pulse_card(run_id: str, x_vlearn_role: str | None = Header(default=None)):
    require_teacher(x_vlearn_role)
    run = _run_or_404(run_id)
    agg = run.aggregate()
    return {"aggregate": agg, "decision": run.decision(agg)}


@router.post("/runs/{run_id}/actions")
def teacher_action(run_id: str, payload: ActionRequest, x_vlearn_role: str | None = Header(default=None)):
    require_teacher(x_vlearn_role)
    _run_or_404(run_id)
    try:
        return live.record_action(run_id, payload.action_code, actor="teacher")
    except ValueError as exc:
        raise HTTPException(400, str(exc)) from None


@router.post("/runs/{run_id}/follow-up")
def follow_up(run_id: str, x_vlearn_role: str | None = Header(default=None)):
    require_teacher(x_vlearn_role)
    _run_or_404(run_id)
    try:
        return live.launch_follow_up(run_id).public("teacher", None)
    except ValueError as exc:
        raise HTTPException(409, str(exc)) from None


@router.get("/runs/{run_id}/recovery")
def recovery(run_id: str):
    _run_or_404(run_id)
    result = live.recoveries.get(run_id)
    if result is None:
        raise HTTPException(404, "Chưa có kết quả follow-up cho checkpoint này.")
    return result


@router.post("/runs/{run_id}/feedback")
def feedback(run_id: str, payload: FeedbackRequest, x_vlearn_role: str | None = Header(default=None)):
    require_teacher(x_vlearn_role)
    _run_or_404(run_id)
    live.record_feedback(run_id, payload.helpful)
    return {"ok": True}


@router.get("/report")
def report(x_vlearn_role: str | None = Header(default=None)):
    require_teacher(x_vlearn_role)
    return live.report()


# --- pulse & hỏi đáp -----------------------------------------------------


@router.get("/pulse")
def get_pulse():
    return {"pulse": live.pulse, "topics": live.topics}


@router.post("/pulse")
def send_pulse(payload: PulseRequest):
    return live.send_pulse(payload.value)


@router.post("/pulse/reset")
def reset_pulse(x_vlearn_role: str | None = Header(default=None)):
    require_teacher(x_vlearn_role)
    return live.reset_pulse()


@router.post("/topics/{topic_id}/vote")
def vote_topic(topic_id: str):
    return live.vote_topic(topic_id)


@router.get("/questions")
def list_questions():
    return live.questions


@router.post("/questions")
def ask_question(payload: QuestionRequest):
    return live.ask(payload.text, payload.page, payload.scope)


@router.post("/questions/{question_id}/answer")
def answer_question(
    question_id: str, payload: AnswerQuestionRequest, x_vlearn_role: str | None = Header(default=None)
):
    require_teacher(x_vlearn_role)
    try:
        return live.answer_question(question_id, payload.text, payload.share_with_class)
    except KeyError:
        raise HTTPException(404, "Không tìm thấy câu hỏi") from None


@router.get("/clarifications")
def list_clarifications():
    return live.clarifications


@router.post("/clarifications")
def publish_clarification(payload: ClarificationRequest, x_vlearn_role: str | None = Header(default=None)):
    require_teacher(x_vlearn_role)
    return live.publish_clarification(payload.title, payload.body, payload.page)
