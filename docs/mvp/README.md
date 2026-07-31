# VLearn Lecture Pulse — MVP

Bản chạy được của vòng phản hồi mô tả trong [`docs/docs.md`](../docs.md):

```
Dạy → Kích hoạt checkpoint → Thu tín hiệu → Phân tích
→ Đề xuất can thiệp → Giảng viên hành động → Kiểm tra lại → Kết luận phục hồi
```

Backend là nguồn sự thật: giữ vòng đời checkpoint, nhận phản hồi kèm mức chắc chắn,
tính chỉ số, chạy rule engine và đẩy snapshot realtime qua SSE. Frontend chỉ hiển thị.

## Chạy

**Backend** (FastAPI, in-memory, không cần DB)

```bash
cd backend
python -m venv .venv
.venv/Scripts/python.exe -m pip install -r requirements.txt      # Windows
.venv/Scripts/python.exe -m uvicorn app.main:app --reload        # http://127.0.0.1:8000
```

**Frontend** (Vite + React + Tailwind)

```bash
cd frontend
pnpm install
pnpm dev                                                         # http://localhost:5173
```

**Trợ lý AI** (tuỳ chọn — không cấu hình thì mọi thứ còn lại vẫn chạy)

```bash
cp backend/.env.example backend/.env      # rồi điền OPENAI_KEY và MODEL
```

Vite proxy sẵn `/api` → `127.0.0.1:8000`. Swagger UI: `http://127.0.0.1:8000/docs`.
Khởi động lại backend là reset toàn bộ phiên (trạng thái nằm trong RAM).

## Kịch bản demo (khoảng 4 phút)

Mở hai cửa sổ trình duyệt: một đăng nhập **Giảng viên**, một **Học viên**
(mỗi tab lấy một `user_id` riêng, nên nhiều máy cùng vào sẽ được tính là nhiều sinh viên thật).

1. **Trang 1 — lớp đã hiểu.** Giảng viên bấm *Kích hoạt Checkpoint #1*.
   Học viên thấy câu hỏi + chọn mức chắc chắn. Đóng → Class Pulse trả về
   `Lớp đã sẵn sàng` với đề xuất **Tiếp tục bài**.
2. **Trang 2 — lớp đang nhầm.** Kích hoạt Checkpoint #2. Kết quả ~52% đúng và
   ~30% cùng chọn phương án B → trạng thái `Cần giải thích thêm`, kèm cụm hiểu nhầm
   *Nhầm tính bền vững của job*.
3. **Can thiệp.** Bấm *Gửi hint cho nhóm chọn sai* → chỉ học viên đã chọn B thấy hint
   3 tầng (không có đáp án). Bấm *Mở ví dụ đã duyệt* → ví dụ hiện trên màn hình lớp.
4. **Kiểm tra lại.** Bấm *Chạy câu kiểm tra lại* → hệ thống mở câu follow-up cùng
   learning outcome. Đóng → thẻ **Kết quả phục hồi** so sánh trước/sau và kết luận
   `Đã phục hồi / Phục hồi một phần / Chưa phục hồi`.
5. **Báo cáo.** Tab *Báo cáo* — timeline checkpoint, can thiệp đã chọn và
   **Concept Recovery Rate** của phiên.

Checkpoint đã soạn nằm ở **trang 1, 2, 3** của tài liệu.

## Đã bao phủ những gì của PRD

| Mục P0 | Trạng thái | Nơi cài đặt |
|---|---|---|
| P0.1 Quiz gắn nội dung (LO, đáp án đúng, misconception, follow-up, ungraded) | ✅ | `backend/app/content.py` |
| P0.2 Live activation (1 click, gia hạn, đóng sớm, huỷ, khoá 2 checkpoint song song) | ✅ | `store.py`, `LiveControllerCard.jsx` |
| P0.3 Student response (1 lựa chọn + confidence, idempotency, xác nhận đã ghi nhận) | ✅ | `run.py:submit`, `LiveQuizCard.jsx` |
| P0.4 Realtime class pulse (online, đã nhận, đã trả lời, phân bố, confidence, misconception) | ✅ | `rules.py:aggregate`, SSE `/api/stream` |
| P0.5 Intervention card (4 trạng thái, bằng chứng, ≤3 action, confidence, teacher override) | ✅ | `rules.py:evaluate`, `ClassPulseCard.jsx` |
| P0.6 Follow-up & recovery (so sánh trước/sau, 3 mức kết luận) | ✅ | `rules.py:classify_recovery`, `RecoveryCard.jsx` |
| P0.7 Session report (timeline, can thiệp, recovery, không xếp hạng SV) | ✅ | `store.py:report`, `SessionReportPane.jsx` |
| FR-08 Hint 3 tầng theo misconception (P1) | ✅ (bản rút gọn) | `SEND_HINT_GROUP` → `HintCard.jsx` |
| Trình soạn checkpoint có trợ lý AI (§15.1 human-in-the-loop) | ✅ | `ai.py` → `CheckpointEditorModal.jsx` |

Ngưỡng trong §9.2 nằm ở `backend/app/rules.py:THRESHOLDS` và được API trả về cho UI,
nên đổi ngưỡng không phải sửa frontend.

## Kiến trúc

```
frontend/src/
  lib/api.js               # fetch + SSE (tự rơi về polling nếu SSE bị chặn)
  lib/decision.js          # ánh xạ trạng thái rule engine → màu/nhãn
  lib/icons.js             # Phosphor Icons, đặt tên theo ý nghĩa (IconLaunch, IconStop, ...)
  state/useLectureState.js # bootstrap /api/session + subscribe /api/stream
  state/SessionContext.jsx # state phiên + toàn bộ action gọi API
  state/useAiActions.js    # 3 action của trợ lý (tách ra để SessionContext dưới 200 dòng)
  components/quiz/         # QuizOption, QuizHeader, ConfidencePicker (dùng chung 2 vai trò)
  components/learner/      # LiveQuizCard, HintCard, PulseCard, SelfTestPane, ...
  components/teacher/      # LiveControllerCard, ClassPulseCard, MisconceptionCard,
                           # SuggestedCheckpointsCard, CheckpointEditorModal, ...

backend/app/
  content.py    # nội dung đã duyệt: checkpoint, LO, misconception taxonomy, action catalog
                # + register_drafted_checkpoint() cho checkpoint giảng viên vừa duyệt
  rules.py      # aggregation thuần + rule engine + phân loại phục hồi
  run.py        # vòng đời một lượt checkpoint + payload theo role
  store.py      # phiên giảng in-memory, teacher action, follow-up, báo cáo
  simulator.py  # sinh phản hồi của ~152 sinh viên ảo (bỏ đi khi có lớp thật)
  events.py     # tín hiệu đánh thức các kết nối SSE
  routers.py    # REST + /api/stream
  config.py     # đọc backend/.env (OPENAI_BASE_URL, OPENAI_KEY, MODEL)
  llm.py        # client OpenAI-compatible bằng httpx, tự lùi tham số khi gateway từ chối
  slides.py     # PDF → text bằng pypdf, dựng ngữ cảnh "trang này + các trang trước"
  ai.py         # prompt, kiểm duyệt output của LLM, cache theo trang
```

Mỗi component React giữ dưới 200 dòng và nhận dữ liệu qua props/context.

Toàn bộ icon dùng **Phosphor Icons** (`@phosphor-icons/react`), không dùng ký tự Unicode.
Cỡ và độ dày mặc định đặt một chỗ bằng `IconContext` trong `App.jsx`; alias theo ý nghĩa
nằm trong `lib/icons.js` nên đổi icon chỉ sửa một dòng.

## Trợ lý soạn câu hỏi

Bật bằng `backend/.env` (`OPENAI_BASE_URL`, `OPENAI_KEY`, `MODEL`). Dùng endpoint
`/chat/completions` nên chạy được với OpenAI, OpenRouter, Ollama hay bất kỳ gateway
tương thích nào. Không có khoá thì `/api/session` trả `ai.enabled = false`, các nút AI
hiện lý do và bị khoá — không có đường nào trong luồng cũ đổi hành vi.

Ngữ cảnh lấy từ chính file PDF đang chiếu: `slides.py` trích text bằng `pypdf` (một lần,
trong thread riêng) rồi ghép **toàn bộ trang đang xem + tóm lược các trang trước** trong
ngân sách 6000 ký tự.

| Vai trò | Đường đi | Endpoint |
|---|---|---|
| Học viên | Tab *Tự kiểm tra* → 5 câu trắc nghiệm riêng tư, chọn xong hiện đáp án + giải thích | `POST /api/ai/self-test` |
| Giảng viên | Tab *Checkpoint* → *Gợi ý câu hỏi* → sửa trong trình soạn → **Lưu** → kích hoạt bằng nút Kích hoạt sẵn có | `POST /api/ai/suggest-checkpoints`, `POST /api/checkpoints` |

Ba ràng buộc được cài cứng, không phải quy ước:

- **AI không tự xuất bản.** `suggest-checkpoints` chỉ trả bản nháp; chỉ `POST /api/checkpoints`
  (teacher-only) mới gọi `content.register_drafted_checkpoint()`. Đúng yêu cầu §15.1 của PRD.
- **AI không đụng vào con số.** `rules.py` giữ nguyên; trợ lý chỉ soạn *nội dung câu hỏi*,
  không tính tỷ lệ và không quyết định trạng thái lớp.
- **Không LLM nào nằm trong đường snapshot.** `live.state()` và `live.report()` chạy mỗi giây
  cho mọi client SSE; mọi lời gọi LLM nằm trong handler `POST` riêng, có cache theo trang.
  Đo thực tế: trong lúc LLM chạy 5 giây, `/api/state` vẫn trả trong 3–5 ms.

Output của LLM luôn bị kiểm duyệt trước khi tới UI (`ai._normalize_question`): đánh lại key
A–D, bỏ phương án trùng, cắt còn 4 phương án, **loại thẳng câu không có đúng một đáp án đúng**,
và bù đủ hint 3 tầng cho mỗi phương án sai. Checkpoint do AI soạn vì thế vẫn chạy được toàn bộ
vòng đời cũ — cluster hiểu nhầm, `SEND_HINT_GROUP`, follow-up và recovery.

## Quyết định thiết kế đáng chú ý

- **Rule engine tách khỏi AI.** Mọi con số và trạng thái do `rules.py` quyết định;
  phần diễn giải chỉ là template. Không có LLM trong đường đi của MVP nên không có
  rủi ro bịa số — chỗ cắm LLM là hàm `evaluate()` trả về `decision.source`.
- **Lọc dữ liệu theo role ở server.** Sinh viên không nhận đáp án đúng, phân bố hay
  kết luận khi checkpoint còn mở — được cắt trong `run.public()`, không phải ẩn ở UI.
- **Hint có mục tiêu.** Chỉ sinh viên đã chọn đúng phương án gây hiểu nhầm mới nhận hint,
  mở dần từng tầng và không chứa đáp án.
- **Trang lớp vs trang cá nhân.** Giảng viên đổi trang là đổi trang của lớp; học viên vẫn
  lật xem lại được và bị kéo về khi giảng viên chuyển slide.

## Chưa làm

- Chưa có DB, xác thực thật, RBAC đầy đủ (mới chặn theo header `X-VLearn-Role`).
- Chưa tích hợp LMS VLearn (session, roster, slide thật).
- Checkpoint do trợ lý soạn chỉ sống trong RAM của tiến trình, khởi động lại là mất.
- Trợ lý mới đọc được phần **chữ** của slide; trang toàn hình sẽ báo 422 thay vì đoán bừa.
- Chưa load test 250 client như §18.2.
- Sinh viên trong demo là mô phỏng; số liệu dùng để trình diễn vòng phản hồi, không phải dữ liệu thật.
