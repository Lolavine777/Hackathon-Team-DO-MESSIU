"""Nội dung đã được đội ngũ học thuật soạn và duyệt trước.

Trong bản MVP đây là dữ liệu tĩnh; khi tích hợp thật, phần này đến từ
ngân hàng câu hỏi + learning outcome của VLearn.
"""

SESSION = {
    "id": "ses_jtbd_d1",
    "code": "VL-302",
    "course": "PROD3010 · Jobs-To-Be-Done Discovery",
    "title": "Day 01 · JTBD Foundation",
    "instructor": "Giảng viên A",
    "enrolled": 160,
    "online": 147,
}

MATERIAL = {
    "id": "mat_jtbd_playbook",
    "name": "Strategyn_JTBD_Playbook.pdf",
    "url": "/materials/Strategyn_JTBD_Playbook.pdf",
    "pages": 48,
}

ACCOUNTS = {
    "learner": {"role": "learner", "name": "Học viên demo", "email": "learner@vlearn.edu.vn"},
    "teacher": {"role": "teacher", "name": "Giảng viên demo", "email": "teacher@vlearn.edu.vn"},
}

CONFIDENCE_LEVELS = [
    {"value": "sure", "label": "Chắc chắn"},
    {"value": "unsure", "label": "Hơi chắc"},
    {"value": "guess", "label": "Không chắc"},
]

LEARNING_OUTCOMES = {
    "LO-JTBD-01": "Phân biệt job (tiến bộ cần đạt) với sản phẩm/giải pháp",
    "LO-JTBD-02": "Nhận diện solution ẩn trong một job statement",
    "LO-JTBD-03": "Viết outcome statement đúng cấu trúc và trung lập giải pháp",
}

# Taxonomy hiểu nhầm do SME định nghĩa. Hint 3 tầng, không chứa đáp án cuối.
MISCONCEPTIONS = {
    "FEATURE_AS_JOB": {
        "label": "Coi tính năng là job",
        "hints": [
            "Job mô tả tiến bộ người dùng muốn đạt, không mô tả thứ họ bấm vào.",
            "Thử hỏi: nếu tính năng này biến mất, nhu cầu kia còn tồn tại không?",
            "Ví dụ: 'nghe nhạc khi chạy bộ' là job; 'nút shuffle' là tính năng.",
        ],
    },
    "BRAND_AS_JOB": {
        "label": "Coi thương hiệu là lý do mua",
        "hints": [
            "Thương hiệu ảnh hưởng lựa chọn giải pháp, không tạo ra job.",
            "Job có trước khi người dùng biết đến bất kỳ thương hiệu nào.",
            "Ví dụ: job 'đi làm đúng giờ' tồn tại trước cả Grab hay Be.",
        ],
    },
    "PRICE_AS_JOB": {
        "label": "Coi giá là job",
        "hints": [
            "Giá là ràng buộc khi chọn giải pháp, không phải tiến bộ cần đạt.",
            "Thử viết lại câu mà không nhắc tới tiền — job còn lại là gì?",
            "Ví dụ: 'ăn trưa nhanh trong 20 phút' mới là job.",
        ],
    },
    "SOLUTION_EQUALS_JOB": {
        "label": "Nhầm giải pháp hiện tại với job",
        "hints": [
            "Job phải độc lập với công cụ đang được dùng.",
            "Nếu câu mô tả chứa tên công cụ, hãy hỏi 'để làm gì?' thêm một lần.",
            "Ví dụ: 'dùng Trello' → 'chia việc cho nhóm khi bắt đầu sprint'.",
        ],
    },
    "STABILITY_CONFUSION": {
        "label": "Nhầm tính bền vững của job",
        "hints": [
            "Job ổn định theo thời gian; solution thay đổi liên tục.",
            "Câu vẫn đúng sau 10 năm là dấu hiệu tốt, không phải dấu hiệu sai.",
            "Ví dụ: 'ghi lại ý tưởng ngay khi nghĩ ra' đúng cả trước và sau smartphone.",
        ],
    },
    "JOB_NEEDS_TOOL": {
        "label": "Cho rằng job phải gắn với một công cụ",
        "hints": [
            "Job mô tả việc cần hoàn thành, không cần nhắc công cụ nào cả.",
            "Không nhắc tên công nghệ là dấu hiệu tốt của một job statement.",
            "Ví dụ: 'ghi lại chi tiêu ngay sau khi thanh toán' — không cần app nào.",
        ],
    },
    "VERB_FORM_CONFUSION": {
        "label": "Nhầm hình thức câu với bản chất job",
        "hints": [
            "Bắt đầu bằng động từ là quy ước viết, không quyết định job hay solution.",
            "Hãy xét nội dung câu chứ không xét dạng ngữ pháp.",
            "Ví dụ: 'mở app X' cũng bắt đầu bằng động từ nhưng vẫn là solution.",
        ],
    },
    "DIRECTION_MISSING": {
        "label": "Bỏ qua hướng thay đổi",
        "hints": [
            "Outcome cần nói rõ tăng hay giảm điều gì.",
            "Không có hướng thay đổi thì không đo được cải thiện.",
            "Ví dụ: 'giảm thời gian…', 'tăng khả năng…'.",
        ],
    },
    "METRIC_MISSING": {
        "label": "Thiếu đơn vị đo",
        "hints": [
            "Outcome phải đo được: thời gian, số lần, khả năng.",
            "Hỏi: sau một tháng, làm sao biết outcome này tốt lên?",
            "Ví dụ: 'giảm thời gian' đo được, 'tăng hài lòng' thì chưa.",
        ],
    },
    "CONTEXT_MISSING": {
        "label": "Thiếu ngữ cảnh sử dụng",
        "hints": [
            "Outcome cần gắn với thời điểm/hoàn cảnh cụ thể.",
            "Cùng một nhu cầu ở hai ngữ cảnh sẽ cho hai outcome khác nhau.",
            "Ví dụ: '…khi hệ thống báo cảnh báo lúc nửa đêm'.",
        ],
    },
    "SOLUTION_IN_OUTCOME": {
        "label": "Đưa giải pháp vào outcome",
        "hints": [
            "Outcome statement phải trung lập với giải pháp.",
            "Nếu câu đã nêu thứ sẽ xây, đó là mô tả sản phẩm.",
            "Ví dụ: 'xây dashboard' là giải pháp, không phải outcome.",
        ],
    },
}

# Ví dụ đã được SME duyệt, dùng cho action SHOW_APPROVED_EXAMPLE.
APPROVED_EXAMPLES = {
    "JTBD-EX-01": {
        "title": "Milkshake buổi sáng",
        "body": (
            "Khách mua milkshake lúc 7h sáng không vì hương vị mà để 'giết thời gian "
            "và chống đói trên quãng lái xe 40 phút'. Job giữ nguyên; milkshake chỉ là "
            "một trong nhiều giải pháp được thuê (chuối, bánh mì, cà phê)."
        ),
    },
    "JTBD-EX-02": {
        "title": "Từ solution về job",
        "body": (
            "'Nhóm cần dùng Trello' → hỏi 'để làm gì?' → 'để biết ai đang làm việc gì' "
            "→ job: 'nắm được trạng thái công việc của nhóm khi bắt đầu ngày làm việc'."
        ),
    },
    "JTBD-EX-03": {
        "title": "Outcome statement chuẩn",
        "body": (
            "Giảm (hướng) thời gian (đơn vị đo) xác định nguyên nhân lỗi (đối tượng) "
            "khi hệ thống phát cảnh báo lúc nửa đêm (ngữ cảnh)."
        ),
    },
}

# Catalog hành động P0 — AI chỉ được đề xuất trong danh sách này.
ACTION_CATALOG = {
    "CONTINUE": {"label": "Tiếp tục bài", "minutes": 0, "tone": "success"},
    "REINFORCE_1_MIN": {"label": "Chốt lại 1 phút", "minutes": 1, "tone": "warning"},
    "RETEACH_3_MIN": {"label": "Giải thích lại 3 phút", "minutes": 3, "tone": "danger"},
    "SHOW_APPROVED_EXAMPLE": {"label": "Mở ví dụ đã duyệt", "minutes": 2, "tone": "info"},
    "DISCUSS_1_MIN": {"label": "Cho lớp thảo luận 1 phút", "minutes": 1, "tone": "info"},
    "RUN_FOLLOW_UP": {"label": "Chạy câu kiểm tra lại", "minutes": 1, "tone": "info"},
    "SEND_HINT_GROUP": {"label": "Gửi hint cho nhóm chọn sai", "minutes": 0, "tone": "info"},
}

QUESTION_BANK = {
    "q-jtbd-01": {
        "id": "q-jtbd-01",
        "prompt": 'Theo JTBD, khách hàng thực sự "mua" điều gì?',
        "options": [
            {"key": "A", "text": "Tính năng của sản phẩm", "misconception": "FEATURE_AS_JOB"},
            {"key": "B", "text": "Tiến bộ họ muốn đạt được trong một hoàn cảnh cụ thể", "correct": True},
            {"key": "C", "text": "Thương hiệu và uy tín của nhà cung cấp", "misconception": "BRAND_AS_JOB"},
            {"key": "D", "text": "Mức giá thấp nhất trên thị trường", "misconception": "PRICE_AS_JOB"},
        ],
        "explain": (
            "Job là tiến bộ (progress) người dùng muốn đạt trong một hoàn cảnh. "
            'Sản phẩm chỉ là phương tiện được "thuê" để hoàn thành job đó.'
        ),
    },
    "q-jtbd-01b": {
        "id": "q-jtbd-01b",
        "prompt": "Một nhóm chuyển từ Excel sang app quản lý chi tiêu. Job của họ thay đổi thế nào?",
        "options": [
            {"key": "A", "text": "Thay đổi hoàn toàn vì công cụ đã khác", "misconception": "SOLUTION_EQUALS_JOB"},
            {"key": "B", "text": "Không đổi — chỉ giải pháp được thuê là khác", "correct": True},
            {"key": "C", "text": "Chỉ tồn tại khi có app hỗ trợ", "misconception": "FEATURE_AS_JOB"},
            {"key": "D", "text": "Được định nghĩa lại bởi tính năng của app", "misconception": "FEATURE_AS_JOB"},
        ],
        "explain": "Job ổn định theo thời gian. Đổi công cụ chỉ là đổi giải pháp được thuê.",
    },
    "q-jtbd-02": {
        "id": "q-jtbd-02",
        "prompt": "Đâu là dấu hiệu bạn đang mô tả SOLUTION thay vì JOB?",
        "options": [
            {"key": "A", "text": "Câu mô tả không nhắc tên công nghệ hay công cụ nào", "misconception": "JOB_NEEDS_TOOL"},
            {"key": "B", "text": "Câu mô tả vẫn đúng sau 10 năm", "misconception": "STABILITY_CONFUSION"},
            {"key": "C", "text": "Câu mô tả chứa tên một ứng dụng hoặc quy trình cụ thể", "correct": True},
            {"key": "D", "text": "Câu mô tả bắt đầu bằng một động từ", "misconception": "VERB_FORM_CONFUSION"},
        ],
        "explain": (
            "Job phải độc lập với công nghệ. Khi câu mô tả gắn với một công cụ cụ thể, "
            "bạn đang mô tả giải pháp hiện tại."
        ),
    },
    "q-jtbd-02b": {
        "id": "q-jtbd-02b",
        "prompt": "Câu nào là JOB statement hợp lệ?",
        "options": [
            {"key": "A", "text": "Dùng Trello để chia task cho nhóm", "misconception": "SOLUTION_EQUALS_JOB"},
            {"key": "B", "text": "Chia công việc cho nhóm khi bắt đầu một sprint", "correct": True},
            {"key": "C", "text": "Tích hợp API lịch vào ứng dụng nội bộ", "misconception": "SOLUTION_EQUALS_JOB"},
            {"key": "D", "text": "Cải thiện trải nghiệm người dùng của Trello", "misconception": "SOLUTION_EQUALS_JOB"},
        ],
        "explain": "Job statement nêu việc cần hoàn thành trong một ngữ cảnh, không nêu công cụ.",
    },
    "q-jtbd-03": {
        "id": "q-jtbd-03",
        "prompt": "Một outcome statement chuẩn KHÔNG bắt buộc thành phần nào?",
        "options": [
            {"key": "A", "text": "Hướng thay đổi (giảm / tăng)", "misconception": "DIRECTION_MISSING"},
            {"key": "B", "text": "Đơn vị đo (thời gian / khả năng / số lần)", "misconception": "METRIC_MISSING"},
            {"key": "C", "text": "Tên sản phẩm sẽ được xây dựng", "correct": True},
            {"key": "D", "text": "Ngữ cảnh sử dụng", "misconception": "CONTEXT_MISSING"},
        ],
        "explain": "Outcome statement luôn trung lập với giải pháp — không nhắc tên sản phẩm sẽ xây.",
    },
    "q-jtbd-03b": {
        "id": "q-jtbd-03b",
        "prompt": "Câu nào là outcome statement hợp lệ?",
        "options": [
            {"key": "A", "text": "Giảm thời gian xác định nguyên nhân lỗi khi hệ thống báo cảnh báo", "correct": True},
            {"key": "B", "text": "Xây dashboard cảnh báo realtime cho đội vận hành", "misconception": "SOLUTION_IN_OUTCOME"},
            {"key": "C", "text": "Tăng mức độ hài lòng của người dùng", "misconception": "METRIC_MISSING"},
            {"key": "D", "text": "Giảm lỗi", "misconception": "CONTEXT_MISSING"},
        ],
        "explain": "Đủ 4 thành phần: hướng thay đổi, đơn vị đo, đối tượng và ngữ cảnh.",
    },
}

# Checkpoint = câu hỏi đã gắn vào slide + learning outcome + câu follow-up.
CHECKPOINTS = [
    {
        "id": "cp-01",
        "order": 1,
        "page": 1,
        "title": "Job hay sản phẩm?",
        "learning_outcome": "LO-JTBD-01",
        "question_id": "q-jtbd-01",
        "follow_up_question_id": "q-jtbd-01b",
        "example_id": "JTBD-EX-01",
        "duration_sec": 30,
        "scoring_mode": "ungraded",
    },
    {
        "id": "cp-02",
        "order": 2,
        "page": 2,
        "title": "Nhận diện solution ẩn",
        "learning_outcome": "LO-JTBD-02",
        "question_id": "q-jtbd-02",
        "follow_up_question_id": "q-jtbd-02b",
        "example_id": "JTBD-EX-02",
        "duration_sec": 30,
        "scoring_mode": "ungraded",
    },
    {
        "id": "cp-03",
        "order": 3,
        "page": 3,
        "title": "Cấu trúc outcome statement",
        "learning_outcome": "LO-JTBD-03",
        "question_id": "q-jtbd-03",
        "follow_up_question_id": "q-jtbd-03b",
        "example_id": "JTBD-EX-03",
        "duration_sec": 45,
        "scoring_mode": "ungraded",
    },
]

PULSE = {"understand": 86, "unclear": 41, "stuck": 20}

TOPICS = [
    {"id": "c1", "label": "Job Statement", "votes": 24},
    {"id": "c2", "label": "Outcome vs. Feature", "votes": 18},
    {"id": "c3", "label": "Job Map 8 bước", "votes": 11},
    {"id": "c4", "label": "Opportunity Score", "votes": 7},
]

QUESTIONS = [
    {
        "id": "qs1",
        "page": 1,
        "scope": "group",
        "author": "Nhóm 12 câu tương tự",
        "text": "Job statement khác gì với user story ạ?",
        "echo": 12,
        "status": "pending",
        "time": "Vừa xong",
    },
    {
        "id": "qs2",
        "page": 2,
        "scope": "anonymous",
        "author": "Ẩn danh · 5 người đồng ý",
        "text": "Làm sao biết mình đã tách đủ nhỏ một job?",
        "echo": 5,
        "status": "pending",
        "time": "2 phút trước",
    },
    {
        "id": "qs3",
        "page": 3,
        "scope": "private",
        "author": "Riêng tư",
        "text": "Outcome score tính bằng công thức nào ạ?",
        "echo": 0,
        "status": "pending",
        "time": "4 phút trước",
    },
]

CLARIFICATIONS = [
    {
        "id": "cl1",
        "page": 1,
        "title": "Phân biệt Job và Solution",
        "body": (
            "Job là tiến bộ người dùng muốn đạt được; solution là cách hiện tại họ đang dùng "
            "để đạt tiến bộ đó. Job bền vững, solution thay đổi liên tục."
        ),
    }
]


def checkpoint(checkpoint_id: str) -> dict | None:
    return next((c for c in CHECKPOINTS if c["id"] == checkpoint_id), None)


def question(question_id: str) -> dict | None:
    return QUESTION_BANK.get(question_id)


def correct_key(q: dict) -> str:
    return next(o["key"] for o in q["options"] if o.get("correct"))


def misconception_label(code: str) -> str:
    return MISCONCEPTIONS.get(code, {}).get("label", code)


# --- checkpoint do giảng viên duyệt từ bản nháp của trợ lý ----------------

OPTION_KEYS = "ABCDEF"
_drafted = 0


def _register_question(question_id: str, draft, code_prefix: str) -> str:
    """Nạp câu hỏi vào ngân hàng, kèm mã hiểu nhầm + hint 3 tầng cho từng phương án sai."""
    options = []
    for index, option in enumerate(draft.options):
        item = {"key": OPTION_KEYS[index], "text": option.text.strip()}
        if option.correct:
            item["correct"] = True
        else:
            code = f"MC-AI-{code_prefix}-{item['key']}"
            MISCONCEPTIONS[code] = {
                "label": option.misconception_label.strip() or "Lỗi chưa đặt tên",
                "hints": [tier.strip() for tier in option.hints[:3]] or _generic_hints(option),
            }
            item["misconception"] = code
        options.append(item)

    QUESTION_BANK[question_id] = {
        "id": question_id,
        "prompt": draft.prompt.strip(),
        "options": options,
        "explain": draft.explain.strip() or "Giảng viên sẽ giải thích thêm tại lớp.",
    }
    return question_id


def _generic_hints(option) -> list[str]:
    label = option.misconception_label.strip() or "lỗi thường gặp ở phương án này"
    return [
        f"Lựa chọn này rơi vào: {label}.",
        "So sánh kỹ điểm khác biệt then chốt giữa các phương án.",
        "Thử diễn đạt lại khái niệm bằng lời của bạn rồi đối chiếu với slide.",
    ]


def register_drafted_checkpoint(draft) -> dict:
    """Thêm một checkpoint mới vào phiên đang chạy.

    Phải nạp đủ learning outcome, misconception và câu follow-up TRƯỚC khi append:
    `routers._checkpoint_payload`, `run.public` và `store._apply_side_effect` tra cứu
    ba bảng này không có guard, thiếu một mảnh là 500 ngay lúc kích hoạt.
    """
    global _drafted
    _drafted += 1
    suffix = f"{_drafted:02d}"

    outcome_id = f"LO-AI-{suffix}"
    LEARNING_OUTCOMES[outcome_id] = draft.learning_outcome.strip()

    question_id = _register_question(f"q-ai-{suffix}", draft, suffix)
    follow_up_id = (
        _register_question(f"q-ai-{suffix}b", draft.follow_up, f"{suffix}b")
        if draft.follow_up
        else question_id  # không có câu kiểm tra lại thì hỏi lại chính câu này
    )

    example_id = None
    if draft.example and draft.example.body.strip():
        example_id = f"EX-AI-{suffix}"
        APPROVED_EXAMPLES[example_id] = {
            "title": draft.example.title.strip() or "Ví dụ minh hoạ",
            "body": draft.example.body.strip(),
        }

    checkpoint = {
        "id": f"cp-ai-{suffix}",
        "order": max((c["order"] for c in CHECKPOINTS), default=0) + 1,
        "page": draft.page,
        "title": draft.title.strip(),
        "learning_outcome": outcome_id,
        "question_id": question_id,
        "follow_up_question_id": follow_up_id,
        "example_id": example_id,
        "duration_sec": draft.duration_sec,
        "scoring_mode": "ungraded",
        "source": "ai-draft",
    }
    CHECKPOINTS.append(checkpoint)
    return checkpoint
