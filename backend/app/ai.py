"""Trợ lý soạn câu hỏi: prompt, kiểm duyệt output của LLM và cache theo trang.

Ranh giới cố ý: module này chỉ *soạn thảo*. Nó không tính chỉ số, không kết luận
trạng thái lớp (việc đó thuộc `rules.py`) và không tự xuất bản checkpoint nào —
giảng viên phải bấm lưu thì `content.register_drafted_checkpoint()` mới chạy.
"""

import asyncio
import json
import re
import unicodedata

from . import llm, slides

KEYS = "ABCDEF"
MAX_OPTIONS = 4

# Tỉ lệ từ nội dung của đáp án bị lặp lại thì coi như hint đã nói ra đáp án.
LEAK_RATIO = 0.6
# Follow-up nhắc lại gần nguyên văn một phương án của câu chính thì không còn hỏi lại được gì.
DUPLICATE_RATIO = 0.7
ANSWER_ECHO_RATIO = 0.9  # đáp án của hai câu được phép cùng nói về một khái niệm
# Dưới ngưỡng này thì tỉ lệ trùng từ không nói lên gì: hai phương án ngắn cùng chủ đề
# ("Một mức giá bán" / "Mức giá của công cụ") luôn trùng gần hết.
MIN_COMPARE_WORDS = 3

# Từ chức năng — bỏ đi để so sánh phần nội dung thật sự của hai câu.
_STOPWORDS = frozenset(
    """la va cua cac mot nhung cho khi voi duoc de trong co khong thi ma nay do hay hoac
    o tu theo ve nhu nen can phai se dang bi vi neu con cung da ra vao len nao gi ai
    hon rat nhat ho them tren duoi sau truoc boi bang
    a an and are as at be by for from in is it of on or that the this to with"""
    .split()
)
_WORDS = re.compile(r"\w+", re.UNICODE)

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

NGUỒN DUY NHẤT
Chỉ được dùng chữ có trong NỘI DUNG SLIDE bên dưới, kể cả ở "explain" và "example".
Không thêm ví dụ, con số, tên thương hiệu, tên công ty, tên người hay nhận định
không xuất hiện trong đoạn đó — kể cả khi bạn biết chúng là đúng.
Không nhắc tới trang khác, chương khác hay mục không nằm trong đoạn được cấp.
Trang chỉ có tiêu đề hoặc lời mời hành động thì hỏi đúng nội dung trang đó nói,
không mượn kiến thức của bài học để hỏi rộng ra.

MỘT LEARNING OUTCOME
Mỗi đề xuất chỉ đo đúng một khái niệm. "learningOutcome", "prompt", đáp án đúng,
"explain" và "followUp" phải cùng nói về khái niệm đó, không trượt sang khái niệm
bên cạnh dù cùng nằm trên trang.

PHƯƠNG ÁN
Đúng 4 phương án khác nhau và đúng MỘT phương án "correct": true.
Mỗi phương án sai là một hiểu nhầm học viên thật sự hay mắc — không dùng câu phủ
định hay đảo ngược của đáp án, không dùng phương án sai một cách hiển nhiên.
"misconceptionLabel" gọi tên chính hiểu nhầm mà phương án đó thể hiện.

HINTS
3 tầng, chỉ nói về hiểu nhầm của phương án sai đang chọn:
tầng 1 gọi tên giả định sai; tầng 2 là một câu hỏi để học viên tự kiểm tra giả định
đó; tầng 3 chỉ chỗ cần đọc lại trên trang (từ khoá có thật trên slide).
Không tầng nào được nêu, dịch, tóm tắt hay diễn giải đáp án đúng, và không được
loại trừ các phương án còn lại. Đọc hết 3 tầng thì học viên vẫn phải tự chọn lại.

FOLLOW-UP
Bắt buộc có, đúng 4 phương án và đúng MỘT đáp án đúng.
Đo lại đúng learning outcome đó bằng một cách hỏi khác, không đổi sang khái niệm khác.
Không dùng lại nguyên văn hay gần nguyên văn phương án nào của câu chính, và không
lấy phương án sai của câu chính làm đáp án đúng.

EXAMPLE
"example" chỉ được diễn đạt lại một minh hoạ đã có sẵn trên trang.
Trang không có minh hoạ nào thì viết lại chính câu của slide giải thích đáp án bằng
lời ngắn gọn, không thêm bối cảnh mới.
Cấm ví dụ tự nghĩ ra (máy khoan, thương hiệu, phần mềm, số liệu…) dù chúng quen thuộc."""
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


def _fold(text: str) -> str:
    """Bỏ dấu và hạ chữ thường để so hai đoạn tiếng Việt viết khác nhau chút ít."""
    stripped = unicodedata.normalize("NFD", text.lower().replace("đ", "d"))
    return "".join(ch for ch in stripped if not unicodedata.combining(ch))


def _content_words(text: str) -> set[str]:
    return {word for word in _WORDS.findall(_fold(text)) if len(word) > 1 and word not in _STOPWORDS}


def _echoes(source: str, text: str, ratio: float) -> bool:
    """`text` có nhắc lại phần lớn nội dung của `source` không?"""
    if _fold(source) in _fold(text):
        return True
    words = _content_words(source)
    if len(words) < MIN_COMPARE_WORDS:
        return False
    return len(words & _content_words(text)) / len(words) >= ratio


def _near_duplicate(first: str, second: str, ratio: float) -> bool:
    """Hai phương án nói cùng một điều.

    So theo phần chung trên câu ngắn hơn: câu chính thường dài hơn follow-up, đo
    một chiều thì một phương án bị viết gọn lại vẫn lọt (`run-01` R04).
    """
    left, right = _content_words(first), _content_words(second)
    shortest = min(len(left), len(right))
    if shortest < MIN_COMPARE_WORDS:
        return _fold(first) == _fold(second)
    return len(left & right) / shortest >= ratio


def _fallback_hints(label: str) -> tuple[str, str, str]:
    return (
        f"Lựa chọn này rơi vào lỗi thường gặp: {label}.",
        "So sánh kỹ điểm khác biệt then chốt giữa các phương án.",
        "Thử diễn đạt lại khái niệm bằng lời của bạn rồi đối chiếu với slide.",
    )


def _hints(raw, label: str) -> list[str]:
    """Hint 3 tầng. Thiếu thì bù bằng gợi ý chung, để `SEND_HINT_GROUP` luôn có nội dung."""
    tiers = [_text(item) for item in (raw or []) if _text(item)][:3]
    fallback = _fallback_hints(label)
    while len(tiers) < 3:
        tiers.append(fallback[len(tiers)])
    return tiers


def _redact_leaky_hints(question: dict, where: str) -> list[str]:
    """Hint nói ra đáp án thì thay bằng gợi ý chung — người học phải tự chọn lại.

    Structural scorer của eval chỉ bắt được trường hợp chép nguyên văn đáp án, còn
    review `run-01` hỏng chủ yếu vì hint *diễn giải* đáp án, nên ở đây so theo tỉ lệ
    từ nội dung trùng nhau.
    """
    answer = next((option["text"] for option in question["options"] if option["correct"]), "")
    issues: list[str] = []
    for option in question["options"]:
        hints = option.get("hints")
        if not answer or not hints:
            continue
        fallback = _fallback_hints(option.get("misconceptionLabel", ""))
        for tier, hint in enumerate(hints):
            if _echoes(answer, hint, LEAK_RATIO):
                hints[tier] = fallback[tier]
                issues.append(f"{where}: hint của phương án \"{option['text'][:40]}\" nói ra đáp án.")
    return issues


def _clean_options(raw_options, *, with_misconceptions: bool) -> list[dict]:
    options: list[dict] = []
    seen: set[str] = set()
    for item in raw_options or []:
        if not isinstance(item, dict):
            continue
        text = _text(item.get("text"))
        if not text or text.lower() in seen:
            continue
        seen.add(text.lower())

        option = {"text": text, "correct": bool(item.get("correct"))}
        if with_misconceptions and not option["correct"]:
            option["misconceptionLabel"] = _text(item.get("misconceptionLabel")) or "Lỗi chưa đặt tên"
            option["hints"] = _hints(item.get("hints"), option["misconceptionLabel"])
        options.append(option)
    return options


def _select_options(cleaned: list[dict]) -> list[dict] | None:
    """Đúng 4 phương án với đúng một đáp án đúng, giữ thứ tự model đã đưa ra.

    Cắt thẳng 4 phương án đầu có thể cắt mất chính đáp án đúng, nên chọn theo vai trò.
    """
    correct = [option for option in cleaned if option["correct"]]
    wrong = [option for option in cleaned if not option["correct"]]
    if len(correct) != 1 or len(wrong) < MAX_OPTIONS - 1:
        return None

    kept = {id(correct[0]), *(id(option) for option in wrong[: MAX_OPTIONS - 1])}
    chosen = [option for option in cleaned if id(option) in kept]
    # Bỏ "key" của LLM và tự đánh lại A, B, C… để không bao giờ trùng hay hụt.
    return [{"key": KEYS[index], **option} for index, option in enumerate(chosen)]


def _repeated_option(option: dict, previous: list[dict]) -> str | None:
    """Follow-up chỉ hỏi lại được nếu phương án của nó không phải bản chép câu chính."""
    for other in previous:
        limit = ANSWER_ECHO_RATIO if option["correct"] and other["correct"] else DUPLICATE_RATIO
        if _near_duplicate(other["text"], option["text"], limit):
            return other["text"]
    return None


def _normalize_question(
    raw, *, with_misconceptions: bool = False, avoid: list[dict] | None = None, where: str = "Câu chính"
) -> tuple[dict | None, list[str]]:
    """Chuẩn hoá một câu do LLM sinh ra, kèm danh sách lỗi để yêu cầu model sửa lại."""
    if not isinstance(raw, dict):
        return None, [f"{where}: thiếu hoặc không phải một object JSON."]

    prompt = _text(raw.get("prompt"))
    issues = [] if prompt else [f"{where}: thiếu \"prompt\"."]

    cleaned = _clean_options(raw.get("options"), with_misconceptions=with_misconceptions)
    options = _select_options(cleaned)
    if options is None:
        issues.append(
            f"{where}: cần đúng {MAX_OPTIONS} phương án khác nhau và đúng MỘT phương án "
            f'"correct": true (đang có {len(cleaned)} phương án, '
            f"{sum(option['correct'] for option in cleaned)} đáp án đúng)."
        )
    elif avoid:
        repeated = [
            (option["text"], other) for option in options if (other := _repeated_option(option, avoid))
        ]
        if repeated:
            issues.append(
                f"{where}: các phương án sau chép lại câu chính, phải hỏi bằng cách khác — "
                + "; ".join(f'"{text[:40]}" ≈ "{other[:40]}"' for text, other in repeated)
            )
            options = None

    if not prompt or options is None:
        return None, issues

    question = {"prompt": prompt, "options": options, "explain": _text(raw.get("explain"))}
    issues += _redact_leaky_hints(question, where)
    return question, issues


def _normalize_suggestion(raw) -> tuple[dict | None, list[str]]:
    if not isinstance(raw, dict):
        return None, ["Một đề xuất không phải object JSON."]

    main, issues = _normalize_question(raw, with_misconceptions=True)
    if main is None:
        return None, issues

    # Follow-up hỏng thì vẫn trả bản nháp (giảng viên tự thêm được), nhưng ghi lỗi lại
    # để vòng sửa lấy đủ 4 phương án — `run-01` có ca chỉ 2-3 phương án hoặc không có.
    follow_up, follow_up_issues = _normalize_question(
        raw.get("followUp"), avoid=main["options"], where="Follow-up"
    )
    issues += follow_up_issues

    duration = raw.get("durationSec")
    example = raw.get("example") if isinstance(raw.get("example"), dict) else None
    if not (example and _text(example.get("body"))):
        issues.append('Thiếu "example" dùng được (cần "body" bám nội dung trang).')
    if not _text(raw.get("learningOutcome")):
        issues.append('Thiếu "learningOutcome".')

    return {
        **main,
        "title": _text(raw.get("title")) or main["prompt"][:48],
        "learningOutcome": _text(raw.get("learningOutcome")) or "Nắm được nội dung trang đang học",
        "durationSec": duration if isinstance(duration, int) and 10 <= duration <= 180 else 30,
        "followUp": follow_up,
        "example": {"title": _text(example.get("title")), "body": _text(example.get("body"))}
        if example and _text(example.get("body"))
        else None,
    }, issues


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


def _repair_message(message: str, previous: dict, issues: list[str]) -> str:
    """Trả lại đúng chỗ hỏng thay vì xin sinh mới — giữ phần đã bám slide."""
    listed = "\n".join(f"- {issue}" for issue in dict.fromkeys(issues))
    draft = json.dumps(previous, ensure_ascii=False)[:6000]
    return (
        f"{message}\n\n=== BẢN NHÁP TRƯỚC CHƯA ĐẠT ===\n{draft}\n\n"
        f"=== LỖI PHẢI SỬA ===\n{listed}\n\n"
        "Sửa đúng những lỗi trên, giữ nguyên phần đã đạt và vẫn chỉ dùng nội dung slide ở trên. "
        "Trả lại toàn bộ JSON theo đúng cấu trúc bắt buộc."
    )


def _build_suggestions(data, page: int, count: int) -> tuple[list[dict], list[str]]:
    suggestions: list[dict] = []
    issues: list[str] = []
    for raw in (data or {}).get("suggestions") or []:
        item, item_issues = _normalize_suggestion(raw)
        issues += item_issues
        if item is not None:
            suggestions.append(item)
        if len(suggestions) == count:
            break
    if len(suggestions) < count:
        issues.append(f"Cần {count} đề xuất hợp lệ, mới có {len(suggestions)}.")
    return [
        {"id": f"sg-{page}-{index + 1}", "page": page, **item} for index, item in enumerate(suggestions)
    ], issues


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
                q for q, _ in (_normalize_question(r) for r in data.get("questions") or []) if q
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

        # Chỉ trang đang xem: checkpoint phải truy được về đúng trang giảng viên đang chiếu.
        context = await slides.context_for(page, include_previous=False)
        message = _user_message(
            f"Đề xuất {count} câu hỏi poll cho trang {page}."
            " Chỉ dùng nội dung của trang này làm nguồn.",
            context,
        )
        data = await llm.chat_json(SUGGEST_SYSTEM, message, max_tokens=3200, temperature=0.2)
        suggestions, issues = _build_suggestions(data, page, count)

        if issues:
            # Một vòng sửa có phản hồi cụ thể rẻ hơn nhiều so với việc giảng viên
            # nhận bản nháp thiếu follow-up hay hint đã lộ đáp án.
            try:
                retry = await llm.chat_json(
                    SUGGEST_SYSTEM,
                    _repair_message(message, data, issues),
                    max_tokens=3200,
                    temperature=0.2,
                )
            except llm.LLMError:
                retry = None
            if retry is not None:
                repaired, remaining = _build_suggestions(retry, page, count)
                if repaired and (not suggestions or len(remaining) < len(issues)):
                    suggestions, issues = repaired, remaining

        if not suggestions:
            raise llm.LLMError("Trợ lý chưa đề xuất được câu hỏi hợp lệ cho trang này — thử tạo lại.")

        result = {"page": page, "suggestions": suggestions}
        if issues:
            # Ghi thẳng vào response để trace của lần chạy sau tự nói ra chỗ còn hỏng.
            result["warnings"] = list(dict.fromkeys(issues))
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
