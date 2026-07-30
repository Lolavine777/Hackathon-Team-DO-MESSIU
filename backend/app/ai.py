"""Trợ lý soạn câu hỏi: prompt, kiểm duyệt output của LLM và cache theo trang.

Ranh giới cố ý: module này chỉ *soạn thảo*. Nó không tính chỉ số, không kết luận
trạng thái lớp (việc đó thuộc `rules.py`) và không tự xuất bản checkpoint nào —
giảng viên phải bấm lưu thì `content.register_drafted_checkpoint()` mới chạy.
"""

import asyncio

from . import llm, slides

KEYS = "ABCDEF"
MAX_OPTIONS = 4

_BASE_RULES = """Bạn là trợ giảng của một lớp học đại học, viết bằng tiếng Việt.
Chỉ được dựa vào NỘI DUNG SLIDE mà người dùng cung cấp — tuyệt đối không bịa thêm
kiến thức ngoài slide và không nhắc tới việc bạn là AI.
Dùng đúng thuật ngữ đã xuất hiện trong slide, câu ngắn và rõ.
Chỉ trả lời bằng MỘT JSON object hợp lệ, không kèm lời dẫn nào khác."""

SELF_TEST_SYSTEM = (
    _BASE_RULES
    + """

Nhiệm vụ: soạn câu trắc nghiệm để học viên TỰ KIỂM TRA phần vừa học ở trang đang xem.
Các trang trước chỉ là ngữ cảnh — câu hỏi phải kiểm tra nội dung của trang đang xem.

Cấu trúc bắt buộc:
{"questions": [{"prompt": "...", "options": [{"text": "...", "correct": true},
 {"text": "...", "correct": false}], "explain": "..."}]}

Quy tắc: mỗi câu đúng 4 phương án; đúng MỘT phương án có "correct": true;
phương án sai phải là lỗi người học hay mắc, không được sai một cách hiển nhiên;
"explain" tối đa 2 câu, nói rõ vì sao đáp án đúng."""
)

SUGGEST_SYSTEM = (
    _BASE_RULES
    + """

Nhiệm vụ: đề xuất câu hỏi để GIẢNG VIÊN mở poll kiểm tra hiểu bài giữa giờ.
Giảng viên sẽ đọc lại và sửa trước khi dùng, nên hãy soạn bản nháp thật sát slide.

Cấu trúc bắt buộc:
{"suggestions": [{
  "title": "tên ngắn 3-6 từ",
  "prompt": "câu hỏi",
  "learningOutcome": "một câu mô tả điều học viên phải làm được",
  "durationSec": 30,
  "options": [
    {"text": "...", "correct": true},
    {"text": "...", "correct": false, "misconceptionLabel": "tên lỗi nhận thức",
     "hints": ["gợi ý tầng 1", "gợi ý tầng 2", "gợi ý tầng 3"]}
  ],
  "explain": "...",
  "followUp": {"prompt": "...", "options": [...], "explain": "..."},
  "example": {"title": "...", "body": "..."}
}]}

Quy tắc: mỗi câu đúng 4 phương án và đúng MỘT phương án "correct": true;
mỗi phương án sai phải có "misconceptionLabel" đặt tên cho lỗi tư duy đứng sau nó;
"hints" gồm 3 tầng gợi mở dần và TUYỆT ĐỐI KHÔNG chứa đáp án đúng;
"followUp" là câu kiểm tra lại cùng learning outcome nhưng khác cách hỏi;
"example" là ví dụ ngắn giảng viên có thể chiếu lên khi lớp chưa hiểu."""
)


def _text(value) -> str:
    return value.strip() if isinstance(value, str) else ""


def _hints(raw, label: str) -> list[str]:
    """Hint 3 tầng. Thiếu thì bù bằng gợi ý chung, để `SEND_HINT_GROUP` luôn có nội dung."""
    tiers = [_text(item) for item in (raw or []) if _text(item)][:3]
    fallback = (
        f"Lựa chọn này rơi vào lỗi thường gặp: {label}.",
        "So sánh kỹ điểm khác biệt then chốt giữa các phương án.",
        "Thử diễn đạt lại khái niệm bằng lời của bạn rồi đối chiếu với slide.",
    )
    while len(tiers) < 3:
        tiers.append(fallback[len(tiers)])
    return tiers


def _normalize_question(raw, *, with_misconceptions: bool = False) -> dict | None:
    """Chuẩn hoá một câu do LLM sinh ra. Không đạt chuẩn thì trả None để loại bỏ."""
    if not isinstance(raw, dict):
        return None

    options: list[dict] = []
    seen: set[str] = set()
    for item in raw.get("options") or []:
        if not isinstance(item, dict):
            continue
        text = _text(item.get("text"))
        if not text or text.lower() in seen:
            continue
        seen.add(text.lower())

        # Bỏ qua "key" của LLM và tự đánh lại A, B, C… để không bao giờ trùng hay hụt.
        option = {"key": KEYS[len(options)], "text": text, "correct": bool(item.get("correct"))}
        if with_misconceptions and not option["correct"]:
            option["misconceptionLabel"] = _text(item.get("misconceptionLabel")) or "Lỗi chưa đặt tên"
            option["hints"] = _hints(item.get("hints"), option["misconceptionLabel"])
        options.append(option)
        if len(options) == MAX_OPTIONS:
            break

    prompt = _text(raw.get("prompt"))
    if not prompt or len(options) < 2 or sum(o["correct"] for o in options) != 1:
        return None
    return {"prompt": prompt, "options": options, "explain": _text(raw.get("explain"))}


def _normalize_suggestion(raw) -> dict | None:
    main = _normalize_question(raw, with_misconceptions=True)
    if main is None:
        return None

    duration = raw.get("durationSec")
    example = raw.get("example") if isinstance(raw.get("example"), dict) else None
    return {
        **main,
        "title": _text(raw.get("title")) or main["prompt"][:48],
        "learningOutcome": _text(raw.get("learningOutcome")) or "Nắm được nội dung trang đang học",
        "durationSec": duration if isinstance(duration, int) and 10 <= duration <= 180 else 30,
        "followUp": _normalize_question(raw.get("followUp")),
        "example": {"title": _text(example.get("title")), "body": _text(example.get("body"))}
        if example and _text(example.get("body"))
        else None,
    }


# --- sinh nội dung ------------------------------------------------------


_self_tests: dict[int, dict] = {}
_suggestions: dict[int, dict] = {}
_locks: dict[str, asyncio.Lock] = {}


def _lock_for(key: str) -> asyncio.Lock:
    """Hai người cùng xin một trang thì chỉ tốn một lượt gọi LLM."""
    lock = _locks.get(key)
    if lock is None:
        lock = _locks[key] = asyncio.Lock()
    return lock


def _user_message(instruction: str, context: str) -> str:
    return f"{instruction}\n\n=== NỘI DUNG SLIDE ===\n{context}\n=== HẾT NỘI DUNG ==="


async def generate_self_test(page: int, count: int = 5, force: bool = False) -> dict:
    async with _lock_for(f"self:{page}"):
        cached = _self_tests.get(page)
        if cached and not force and len(cached["questions"]) >= count:
            return cached

        context = await slides.context_for(page)
        data = await llm.chat_json(
            SELF_TEST_SYSTEM,
            _user_message(f"Soạn {count} câu trắc nghiệm cho trang {page}.", context),
            max_tokens=2600,
        )

        questions = [
            {"id": f"st-{page}-{index + 1}", **item}
            for index, item in enumerate(
                q for q in (_normalize_question(r) for r in data.get("questions") or []) if q
            )
        ][:count]
        if not questions:
            raise llm.LLMError("Trợ lý chưa soạn được câu hỏi hợp lệ cho trang này — thử tạo lại.")

        result = {"page": page, "questions": questions}
        _self_tests[page] = result
        return result


async def suggest_checkpoints(page: int, count: int = 3, force: bool = False) -> dict:
    async with _lock_for(f"suggest:{page}"):
        cached = _suggestions.get(page)
        if cached and not force:
            return cached

        context = await slides.context_for(page)
        data = await llm.chat_json(
            SUGGEST_SYSTEM,
            _user_message(f"Đề xuất {count} câu hỏi poll cho trang {page}.", context),
            max_tokens=3200,
        )

        suggestions = [
            {"id": f"sg-{page}-{index + 1}", "page": page, **item}
            for index, item in enumerate(
                s for s in (_normalize_suggestion(r) for r in data.get("suggestions") or []) if s
            )
        ][:count]
        if not suggestions:
            raise llm.LLMError("Trợ lý chưa đề xuất được câu hỏi hợp lệ cho trang này — thử tạo lại.")

        result = {"page": page, "suggestions": suggestions}
        _suggestions[page] = result
        return result
