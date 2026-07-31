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

Phiên **bắt đầu rỗng**: không có câu hỏi mẫu, không có sinh viên ảo. Mọi con số trên màn hình
đều đến từ người thật đang mở lớp, nên demo cần **vài tab học viên** (mỗi tab là một `user_id`
riêng, được tính là một sinh viên; tab nào đóng quá 20 giây thì rời khỏi sĩ số).

1. **Trang 1 — lớp đã hiểu.** Giảng viên bấm *Kích hoạt Checkpoint #1*.
   Học viên thấy câu hỏi + chọn mức chắc chắn. Cho phần lớn tab chọn đúng → đóng →
   Class Pulse trả về `Lớp đã sẵn sàng` với đề xuất **Tiếp tục bài**.
2. **Trang 2 — lớp đang nhầm.** Kích hoạt Checkpoint #2, cho quá nửa số tab chọn cùng
   một phương án sai → trạng thái `Cần giải thích thêm`, kèm cụm hiểu nhầm tương ứng.
3. **Can thiệp.** Bấm *Gửi hint cho nhóm chọn sai* → chỉ học viên đã chọn sai đó thấy hint
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
| P0.4 Realtime class pulse (đang trong lớp, đã trả lời, phân bố, confidence, misconception) | ✅ | `rules.py:aggregate`, SSE `/api/stream` |
| P0.5 Intervention card (4 trạng thái, bằng chứng, ≤3 action, confidence, teacher override) | ✅ | `rules.py:evaluate`, `ClassPulseCard.jsx` |
| P0.6 Follow-up & recovery (so sánh trước/sau, 3 mức kết luận) | ✅ | `rules.py:classify_recovery`, `RecoveryCard.jsx` |
| P0.7 Session report (timeline, can thiệp, recovery, không xếp hạng SV) | ✅ | `store.py:report`, `SessionReportPane.jsx` |
| FR-08 Hint 3 tầng theo misconception (P1) | ✅ (bản rút gọn) | `SEND_HINT_GROUP` → `HintCard.jsx` |
| Trình soạn checkpoint có trợ lý AI (§15.1 human-in-the-loop) | ✅ | `ai.py` → `CheckpointEditorModal.jsx` |
| Yêu cầu hỗ trợ 1-1 + gom câu hỏi tương tự bằng AI | ✅ | `store.py` ticket lifecycle → `QuestionClustersCard.jsx` |
| Ghim giải thích / vướng mắc lên đúng slide, có "Tôi cũng gặp" | ✅ | `store.py:pin_question` → `SlidePinLayer.jsx` |

Ngưỡng trong §9.2 nằm ở `backend/app/rules.py:THRESHOLDS` và được API trả về cho UI,
nên đổi ngưỡng không phải sửa frontend.

## Kiến trúc

```
frontend/src/
  lib/api.js               # fetch + SSE (tự rơi về polling nếu SSE bị chặn)
  lib/decision.js          # ánh xạ trạng thái rule engine → màu/nhãn
  lib/icons.js             # Phosphor Icons, đặt tên theo ý nghĩa (IconLaunch, IconStop, ...)
  lib/helpCategories.js    # 3 loại vướng mắc: nhãn/tông màu từ API + icon gắn ở client
  lib/pdf.js               # nạp pdf.js (worker bundle sẵn, không phụ thuộc CDN)
  state/useLectureState.js # bootstrap /api/session + subscribe /api/stream
  state/SessionContext.jsx # state phiên + toàn bộ action gọi API
  state/useAiActions.js    # 3 action của trợ lý (tách ra để SessionContext dưới 200 dòng)
  state/useHelpActions.js  # vòng đời yêu cầu hỗ trợ + gom câu hỏi + broadcast + ghim
  state/usePageScrollSync.js # cuộn ↔ số trang, hai chiều
  components/slide/        # SlideViewer, PdfDocument, PdfPage, SlidePinLayer, SlidePin
  components/quiz/         # QuizOption, QuizHeader, ConfidencePicker (dùng chung 2 vai trò)
  components/learner/      # LiveQuizCard, HintCard, PulseCard, SelfTestPane, ...
  components/teacher/      # LiveControllerCard, ClassPulseCard, MisconceptionCard,
                           # SuggestedCheckpointsCard, CheckpointEditorModal,
                           # QuestionClustersCard, QuestionClusterItem, BroadcastModal, ...

backend/app/
  content.py    # nội dung đã duyệt: checkpoint, LO, misconception taxonomy, action catalog
                # + register_drafted_checkpoint() cho checkpoint giảng viên vừa duyệt
                # + HELP_CATEGORIES: 3 loại vướng mắc học viên tự chọn
  rules.py      # aggregation thuần + rule engine + phân loại phục hồi
  run.py        # vòng đời một lượt checkpoint + payload theo role
  store.py      # phiên giảng in-memory, teacher action, follow-up, báo cáo
                # + đếm sĩ số thật từ số máy học viên đang mở lớp (PRESENCE_TTL_SEC)
  events.py     # tín hiệu đánh thức các kết nối SSE
  routers.py    # REST + /api/stream
  config.py     # đọc backend/.env (OPENAI_BASE_URL, OPENAI_KEY, MODEL)
  llm.py        # client OpenAI-compatible bằng httpx, tự lùi tham số khi gateway từ chối
  slides.py     # PDF → text bằng pypdf, dựng ngữ cảnh "trang này + các trang trước"
  ai.py         # prompt, kiểm duyệt output của LLM, cache theo trang
                # + group_questions(): gom câu hỏi tương tự
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

## Yêu cầu hỗ trợ & gom câu hỏi tương tự

Vòng đời một yêu cầu, tất cả nằm trên cùng một thực thể `question` (không có hàng đợi thứ hai):

```
Học viên bấm "Cần hỗ trợ" → nhập mô tả ngắn + chọn loại vấn đề
  → ticket hiện realtime ở tab Hỗ trợ của trợ giảng   (pending)
  → trợ giảng bấm "Nhận hỗ trợ"                        (claimed)
  → trợ giảng trả lời                                  (answered)
  → học viên bấm "Đã hiểu"  → đóng                     (resolved)
              hoặc "Vẫn kẹt" → lên đầu hàng đợi        (escalated)
```

Ba loại vấn đề (`content.HELP_CATEGORIES`): **Lỗi code · Không hiểu khái niệm · Không biết bắt đầu**.
Trợ giảng lọc được ngay từ hàng đợi mà không phải đọc hết nội dung.

**Gom câu hỏi tương tự** — `POST /api/ai/group-questions` (teacher-only) đưa toàn bộ câu đang mở
cho LLM và nhận về các nhóm cùng vấn đề. Trong `QuestionClustersCard`, mỗi nhóm hiện *một dòng
tóm tắt*; **bấm vào tóm tắt sẽ bung ra đúng những câu gốc học viên đã gửi**. Từ đó trợ giảng chọn
*Trả lời riêng bạn này* hoặc *Giải thích chung cho N bạn* (broadcast: đăng lên màn hình lớp và
đóng mọi câu trong nhóm cùng lúc).

Bốn ràng buộc được cài cứng:

- **Không bao giờ làm rơi câu hỏi của học viên.** `ai._normalize_groups()` bỏ id lạ, bỏ id trùng,
  và câu nào LLM quên xếp nhóm thì tự đứng thành nhóm một câu. LLM trả về rác thì kết quả là
  *mọi câu đứng riêng lẻ*, không phải danh sách rỗng.
- **AI không tự trả lời ai.** `suggestedAnswer` chỉ là bản nháp điền sẵn vào `BroadcastModal`;
  trợ giảng phải đọc, sửa và bấm gửi.
- **Câu hỏi riêng không rời khỏi server.** `store._visible_questions()` cắt theo role: học viên chỉ
  nhận câu ẩn danh và câu của chính mình. Nhóm câu hỏi cũng chỉ gửi cho trợ giảng.
- **Không LLM nào nằm trong đường snapshot.** Gom câu hỏi chạy theo yêu cầu, cache theo đúng *tập
  id* đang mở; có câu mới thì `clustersStale = true` và UI mời bấm gom lại — so sánh tập id là
  phép tính thuần, không gọi LLM.

## Kéo slide và ghim lên slide

**Khung PDF do app tự vẽ.** Trước đây slide là `<object>` nhúng trình xem PDF của trình duyệt —
một hộp đen: người dùng kéo tới trang 7 nhưng app vẫn tưởng đang ở trang 1, nên checkpoint, pulse
và câu hỏi đều gắn nhầm trang. Nay `PdfDocument.jsx` vẽ từng trang bằng pdf.js trong vùng cuộn của
chính app, `usePageScrollSync` nối hai chiều:

- kéo slide → trang nào nằm giữa khung thì trang đó là trang hiện tại (chỉ chốt sau khi tay dừng
  ~160ms, nên cuộn từ trang 1 tới 20 là **một** lần đổi trang, không phải 20 lần);
- đổi số trang (nút, ô nhập, hoặc giảng viên lật slide) → nhảy tới đúng trang đó.

Chỉ 5 trang quanh trang đang xem được vẽ thật; số còn lại là khung trống đúng chiều cao (lấy tỉ lệ
trang 1 — cả bộ slide cùng khổ giấy) để thanh cuộn không nhảy. `setPage` cập nhật tại chỗ trước rồi
mới PUT lên server, nếu không giá trị cũ từ snapshot sẽ kéo ngược khung slide về trang trước.
pdf.js được `lazy()` nên không nằm trong bundle đầu tiên.

**Ghim lên slide** (`store.pins`, tối đa 3 ghim mỗi trang, chỉ hiện ở đúng trang của nó):

- *Giải thích của trợ giảng*: `publish_clarification` — kể cả bản broadcast cho cả nhóm câu hỏi —
  **tự ghim luôn**. Trước đây clarification chỉ nằm trong danh sách bên phải và học viên phải tự
  tìm; giải thích chỉ có tác dụng khi nó nằm ngay trên slide đang chiếu.
- *Vướng mắc của một bạn*: trợ giảng bấm **Ghim lên slide** ở hàng đợi hỗ trợ. Cả lớp đọc được và
  bấm **Tôi cũng gặp** — mỗi người một lần, cộng dồn vào `question.echo`, để trợ giảng biết đây là
  vấn đề của một người hay của cả lớp.

Ghim một câu **riêng tư** là công khai nội dung câu đó, nên thao tác này có hộp xác nhận nói rõ
điều đó (tên người hỏi vẫn được giấu — ghim chỉ mang nội dung, nhãn là "Một bạn trong lớp").

## Không có dữ liệu giả

Mọi con số về sinh viên trên màn hình đều là hành vi thật của người đang mở lớp:

| Chỗ hiển thị | Nguồn |
|---|---|
| Số học viên đang trong lớp | `store.online()` — số `user_id` học viên còn gọi API trong `PRESENCE_TTL_SEC` (20s) |
| Mẫu số của % tham gia | `run.audience` — mức cao nhất của sĩ số quan sát được trong lúc checkpoint mở |
| Phân bố đáp án, tỷ lệ đúng, mức chắc chắn | chỉ từ `run.responses`, tức lượt bấm thật |
| Pulse, câu hỏi, giải thích, ghim, "Tôi cũng gặp" | rỗng khi khởi động, chỉ lớn lên khi có người gửi |
| Điểm khó đang nổi lên | nhóm câu hỏi do trợ lý gom + số "Tôi cũng gặp", không còn danh sách chủ đề viết cứng |

Đăng nhập cũng không có tài khoản dựng sẵn: người dùng chọn vai trò và tự nhập tên hiển thị
(bỏ trống thì lấy nhãn vai trò). Tên chỉ hiện cho chính họ — câu hỏi gửi lên lớp vẫn ẩn danh.

`content.py` chỉ còn **nội dung bài học** đã được duyệt (checkpoint, learning outcome, taxonomy
hiểu nhầm, ví dụ mẫu, catalog hành động). Đây là giáo án, không phải hoạt động của lớp.

## Quyết định thiết kế đáng chú ý

- **Sĩ số đếm được, không khai báo.** Trước đây tỷ lệ tham gia chia cho một con số cố định
  (160) và lớp có ~152 sinh viên ảo trả lời sẵn — nhìn thì đẹp nhưng mọi kết luận đều vô nghĩa.
  Giờ mẫu số là số máy thật, nên `Chưa đủ tín hiệu` là một trạng thái xảy ra thật.
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
- Chưa tách vai **trợ giảng** khỏi **giảng viên**: cả hai dùng chung header `teacher`, nên
  "chuyển lên giảng viên" hiện mới là đưa câu hỏi lên đầu hàng đợi, chưa đổi người nhận.
- Gom câu hỏi phải bấm tay; chưa tự chạy lại khi có câu mới (cố ý — mỗi lần gom là một lượt LLM).
- Trợ lý mới đọc được phần **chữ** của slide; trang toàn hình sẽ báo 422 thay vì đoán bừa.
- Ghim là công cụ của trợ giảng: học viên chưa tự đề xuất ghim câu hỏi của mình.
- Khung trống của các trang chưa vẽ đều lấy tỉ lệ trang 1; tài liệu trộn nhiều khổ giấy sẽ lệch
  chiều cao khung trước khi trang được vẽ ra.
- Chưa load test 250 client như §18.2.
- Sĩ số đếm theo **máy đang mở lớp**, không theo roster: một người mở hai tab được tính là hai.
  Khi tích hợp LMS thì mẫu số phải lấy từ danh sách lớp thật.
