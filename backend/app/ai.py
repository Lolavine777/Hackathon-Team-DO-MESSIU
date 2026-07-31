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


GROUP_SYSTEM = """Bạn là trợ giảng của một lớp học đại học, viết bằng tiếng Việt.
Bạn nhận DANH SÁCH CÂU HỎI mà học viên vừa gửi trong giờ học.

Nhiệm vụ: gom những câu đang hỏi về CÙNG MỘT vướng mắc vào một nhóm, kể cả khi
chúng dùng từ ngữ khác nhau. Câu nào không giống câu nào thì để riêng một nhóm.
Tuyệt đối không bịa thêm câu hỏi và không đổi ý câu hỏi của học viên.

Cấu trúc bắt buộc:
{"groups": [{"topic": "1-4 từ khoá",
  "summary": "một câu hỏi đại diện, viết lại cho rõ ràng",
  "questionIds": ["qs_1", "qs_2"],
  "suggestedAnswer": "2-3 câu trợ giảng có thể dùng để trả lời cả nhóm"}]}

Quy tắc: mỗi id chỉ được xuất hiện ở đúng MỘT nhóm; chỉ dùng đúng các id đã cho;
"summary" phải phản ánh điều cả nhóm đang hỏi, không thêm nội dung mới;
"suggestedAnswer" là bản nháp cho trợ giảng sửa lại, không phải câu trả lời cuối cùng."""


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
_groupings: dict[frozenset, dict] = {}
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


# --- gom câu hỏi tương tự ------------------------------------------------


def _group_payload(questions: list[dict], ids: list[str], raw: dict | None) -> dict:
    by_id = {q["id"]: q for q in questions}
    members = [by_id[qid] for qid in ids]
    first = members[0]
    return {
        "topic": _text((raw or {}).get("topic"))[:48],
        "summary": _text((raw or {}).get("summary")) or first["text"],
        "questionIds": ids,
        "count": len(ids),
        "pages": sorted({q["page"] for q in members}),
        "categories": sorted({q["category"] for q in members if q.get("category")}),
        "suggestedAnswer": _text((raw or {}).get("suggestedAnswer")),
    }


def _normalize_groups(data, questions: list[dict]) -> list[dict]:
    """Chỉ giữ id có thật, mỗi id đúng một nhóm; câu bị bỏ sót thì tự đứng riêng."""
    known = {q["id"] for q in questions}
    taken: set[str] = set()
    groups: list[dict] = []

    for raw in (data or {}).get("groups") or []:
        if not isinstance(raw, dict):
            continue
        ids = []
        for qid in raw.get("questionIds") or []:
            if isinstance(qid, str) and qid in known and qid not in taken:
                taken.add(qid)
                ids.append(qid)
        if ids:
            groups.append(_group_payload(questions, ids, raw))

    # Không bao giờ để rơi câu hỏi của học viên vì trợ lý quên xếp nhóm cho nó.
    for question in questions:
        if question["id"] not in taken:
            groups.append(_group_payload(questions, [question["id"]], None))

    groups.sort(key=lambda g: (-g["count"], g["summary"]))
    return [{**group, "id": f"cl-{index + 1}"} for index, group in enumerate(groups)]


async def _slide_hint(page: int | None) -> str:
    """Ngữ cảnh slide là *tuỳ chọn*: gom câu hỏi vẫn phải chạy khi PDF không đọc được."""
    if not page:
        return ""
    try:
        return f"\n\n=== NỘI DUNG SLIDE ĐANG CHIẾU ===\n{await slides.context_for(page, budget=2000)}"
    except slides.SlideTextError:
        return ""


async def group_questions(questions: list[dict], page: int | None = None, force: bool = False) -> dict:
    """Gom câu hỏi mở thành từng nhóm cùng vấn đề để trợ giảng xử lý một lần."""
    ids = frozenset(q["id"] for q in questions)
    if not ids:
        return {"clusters": [], "questionCount": 0}

    async with _lock_for("group"):
        cached = _groupings.get(ids)
        if cached and not force:
            return cached

        listing = "\n".join(f'{q["id"]} (trang {q["page"]}): {q["text"]}' for q in questions)
        data = await llm.chat_json(
            GROUP_SYSTEM,
            f"Gom {len(questions)} câu hỏi sau thành các nhóm cùng vấn đề."
            f"\n\n=== DANH SÁCH CÂU HỎI ===\n{listing}"[:8000] + await _slide_hint(page),
            max_tokens=2000,
        )

        clusters = _normalize_groups(data, questions)
        result = {"clusters": clusters, "questionCount": len(questions)}
        _groupings[ids] = result
        return result
