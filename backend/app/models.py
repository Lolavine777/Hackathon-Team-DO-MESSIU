"""Pydantic schema cho request body."""

from typing import Literal

from pydantic import BaseModel, Field, field_validator

Role = Literal["learner", "teacher"]
Confidence = Literal["sure", "unsure", "guess"]
PulseValue = Literal["understand", "unclear", "stuck"]


class LoginRequest(BaseModel):
    role: Role
    email: str | None = None
    user_id: str | None = None


class ResponseRequest(BaseModel):
    option_key: str
    confidence: Confidence = "unsure"
    user_id: str
    client_response_id: str | None = None  # idempotency key


class ExtendRequest(BaseModel):
    seconds: int = Field(default=10, ge=5, le=120)


class ActionRequest(BaseModel):
    action_code: str


class FeedbackRequest(BaseModel):
    helpful: bool


class PulseRequest(BaseModel):
    value: PulseValue


class QuestionRequest(BaseModel):
    text: str
    page: int
    scope: Literal["private", "anonymous"] = "private"


class AnswerQuestionRequest(BaseModel):
    text: str
    share_with_class: bool = False


class ClarificationRequest(BaseModel):
    title: str
    body: str
    page: int


# --- trợ lý AI -----------------------------------------------------------


class SelfTestRequest(BaseModel):
    page: int = Field(ge=1)
    count: int = Field(default=5, ge=1, le=8)
    force: bool = False


class SuggestRequest(BaseModel):
    page: int = Field(ge=1)
    count: int = Field(default=3, ge=1, le=5)
    force: bool = False


class DraftOption(BaseModel):
    """Một phương án trong bản nháp. `key` do server đánh lại theo thứ tự, client gửi cũng bỏ qua."""

    text: str = Field(min_length=1, max_length=400)
    correct: bool = False
    misconception_label: str = ""
    hints: list[str] = Field(default_factory=list)


class DraftQuestion(BaseModel):
    prompt: str = Field(min_length=1, max_length=800)
    explain: str = ""
    options: list[DraftOption] = Field(min_length=2, max_length=6)

    @field_validator("options")
    @classmethod
    def _exactly_one_correct(cls, options: list[DraftOption]) -> list[DraftOption]:
        if sum(option.correct for option in options) != 1:
            raise ValueError("Câu hỏi phải có đúng một phương án đúng.")
        if len({option.text.strip().lower() for option in options}) != len(options):
            raise ValueError("Các phương án không được trùng nội dung.")
        return options


class DraftExample(BaseModel):
    title: str = ""
    body: str = ""


class DraftCheckpointRequest(DraftQuestion):
    """Checkpoint giảng viên đã đọc và duyệt — đây là bước 'human-in-the-loop' bắt buộc."""

    page: int = Field(ge=1)
    title: str = Field(min_length=1, max_length=160)
    learning_outcome: str = Field(min_length=1, max_length=400)
    duration_sec: int = Field(default=30, ge=10, le=180)
    follow_up: DraftQuestion | None = None
    example: DraftExample | None = None
