# VLearn AI Interactive Learning Assistant
## Lean Product Requirements Document (PRD) & Technical Delivery Plan

> **Tên module triển khai:** **VLearn Lecture Pulse**  
> **Phiên bản tài liệu:** 1.0  
> **Ngày:** 30/07/2026  
> **Phạm vi:** MVP cho lớp học trực tiếp/hybrid khoảng 160 sinh viên  
> **Nguồn nghiên cứu:** [Google Sheet “Phản hồi khảo sát VLearn – AI Teaching Assistant”](https://docs.google.com/spreadsheets/d/139-qYT-JIRfX4vuYilSku1ZNVmDf0LPvayUvSRebf7M/edit#gid=1973924481), tab `Form Responses 1`, 36 phản hồi không rỗng.

---

# 1. Executive Summary

## 1.1 Vấn đề cần giải quyết

Trong lớp đông, sinh viên thường **không thể hiện rằng mình chưa hiểu bài** vì ngại phát biểu, sợ câu hỏi đơn giản, không biết diễn tả lỗi hoặc cho rằng giảng viên đang bận. Giảng viên vì vậy chỉ nhận tín hiệu từ một nhóm nhỏ thường xuyên tương tác, rồi phải quyết định tiếp tục hay giảng lại dựa trên cảm tính.

Điểm đau không phải chỉ là “lớp thiếu tương tác”. Điểm đau thật sự là:

> **Sinh viên chưa hiểu nhưng không có một cách kín đáo, nhanh và ít áp lực để báo cho giảng viên trước khi bài giảng chuyển sang nội dung tiếp theo.**

Hậu quả là sinh viên tiếp tục học trên nền kiến thức chưa vững; lỗi chỉ lộ ra khi nộp bài, làm quiz sau buổi hoặc thi.

## 1.2 Giải pháp cô đọng

**VLearn Lecture Pulse** tích hợp trực tiếp vào buổi học trên Web VLearn:

1. Đội ngũ giảng dạy chuẩn bị sẵn quiz và gắn với slide/nội dung.
2. Giảng viên chủ động kích hoạt checkpoint khi đến đúng vị trí.
3. Toàn bộ sinh viên trả lời ngay trong VLearn, không chuyển tab hay nhập mã.
4. Hệ thống tổng hợp realtime: tỷ lệ tham gia, phân bố đáp án, tỷ lệ đúng, mức độ chắc chắn và misconception nổi bật.
5. Rule engine kết luận trạng thái lớp; AI chỉ diễn giải ngắn và đề xuất hành động.
6. Giảng viên quyết định tiếp tục, giải thích lại, đưa ví dụ hoặc gửi hint.
7. Một câu follow-up đo xem can thiệp có giúp lớp hiểu hơn hay không.

## 1.3 Phạm vi MVP

MVP chỉ tập trung vào **một vòng phản hồi trong giờ học**:

```text
Dạy → Kích hoạt checkpoint → Thu tín hiệu → Phân tích
→ Đề xuất can thiệp → Giảng viên hành động → Kiểm tra lại
```

MVP **không** làm chatbot hỏi đáp tổng quát, dự đoán bỏ học, tự động chấm điểm, gamification, leaderboard hoặc tự tạo toàn bộ nội dung.

## 1.4 North Star Metric

> **Concept Recovery Rate:** tỷ lệ checkpoint ban đầu chưa đạt nhưng đạt ngưỡng hiểu bài sau khi giảng viên can thiệp và chạy câu follow-up.

---

# 2. Phân tích dữ liệu khảo sát

## 2.1 Chất lượng và giới hạn mẫu

- Tổng cộng: **36 phản hồi**.
- Người đang học từ năm 1 đến năm 5+: **32/36 (88.9%)**.
- Đã học ít nhất một môn thực hành/lập trình: **34/36 (94.4%)**.
- Mẫu nhỏ, thu thập thuận tiện và tập trung nhiều vào sinh viên năm 4; các tỷ lệ dưới đây dùng để **xác nhận hướng vấn đề**, không đại diện cho toàn bộ người học VLearn.
- Câu hỏi mở có rất ít nội dung sử dụng được, nên insight chủ yếu dựa trên dữ liệu định lượng.

## 2.2 Các tín hiệu đau nhất

| Tín hiệu khảo sát | Kết quả | Ý nghĩa sản phẩm |
|---|---:|---|
| Bị kẹt ở mức 3–5/5 | **28/36 (77.8%)** | Khó khăn xảy ra thường xuyên, không phải trường hợp hiếm |
| Bị kẹt ở mức 4–5/5 | **14/36 (38.9%)** | Một nhóm đáng kể gặp pain mạnh |
| Chờ trên 10 phút hoặc thường không nhận được hỗ trợ | **20/36 (55.6%)** | Feedback trong giờ học đang đến quá chậm |
| Chờ trên 20 phút hoặc không được hỗ trợ | **13/36 (36.1%)** | Nhiều sinh viên gần như phải tự xử lý |
| Đồng ý rằng GV khó biết ai gặp khó khăn trong lớp đông | **21/36 (58.3%)** | Tín hiệu lớp học không đại diện |
| Đồng ý từng có phần chưa hiểu nhưng GV vẫn tiếp tục | **19/36 (52.8%)** | Đây là pain trực tiếp của vòng phản hồi bị thiếu |
| Đồng ý chỉ biết mình sai khi nhận kết quả/chấm bài | **17/36 (47.2%)** | Phản hồi đến sau thời điểm có thể sửa ngay |
| Muốn nhận gợi ý khi mắc lỗi nhiều lần | **23/36 (63.9%)** | Hint có nhu cầu, nhưng phải đúng thời điểm và có kiểm soát |
| Đánh giá phân tích LMS hữu ích ở mức 4–5/5 | **23/36 (63.9%)** | Hướng giải pháp có tín hiệu chấp nhận ban đầu |

## 2.3 Vì sao sinh viên không hỏi giảng viên?

| Rào cản | Số người | Tỷ lệ |
|---|---:|---:|
| Sợ câu hỏi quá đơn giản | 18 | 50.0% |
| Ngại phát biểu trước lớp | 16 | 44.4% |
| Không biết mô tả lỗi | 15 | 41.7% |
| Muốn tự giải quyết trước | 14 | 38.9% |
| Lớp đông nên khó được hỗ trợ | 12 | 33.3% |
| Giảng viên đang bận hỗ trợ người khác | 9 | 25.0% |

**Kết luận:** sản phẩm không nên ép sinh viên “chủ động hỏi nhiều hơn”. Sản phẩm phải tạo một kênh phản hồi **ẩn danh trước lớp, thao tác thấp và không yêu cầu diễn đạt lỗi bằng lời**.

## 2.4 Cách sinh viên đang tự xử lý

| Cách xử lý khi bị kẹt | Số người | Tỷ lệ |
|---|---:|---:|
| Dùng ChatGPT/công cụ AI khác | 32 | 88.9% |
| Tự tìm trên Google | 21 | 58.3% |
| Hỏi bạn bè | 20 | 55.6% |
| Hỏi trực tiếp GV/TA | 19 | 52.8% |
| Xem lại tài liệu/video | 17 | 47.2% |

**Insight:** 32/36 (88.9%) đã dùng AI khi bị kẹt. Đây là workaround nhanh nhưng có ba điểm yếu:

1. Không gắn chắc với nội dung và quy ước môn học.
2. Giảng viên không biết lớp đang cùng vướng ở đâu.
3. AI có thể đưa đáp án hoặc giải thích sai mà không có kiểm soát học thuật.

VLearn nên dùng AI để **biến tín hiệu lớp thành hành động của giảng viên**, không cạnh tranh bằng một chatbot tổng quát khác.

## 2.5 Tính năng được mong muốn

| Tính năng | Số chọn | Tỷ lệ |
|---|---:|---:|
| Quiz/poll ngắn kiểm tra mức độ hiểu | 20 | 55.6% |
| Hint khi mắc cùng lỗi nhiều lần | 18 | 50.0% |
| Quiz thích ứng theo kết quả | 18 | 50.0% |
| Báo GV khi nhiều SV cùng gặp khó khăn | 17 | 47.2% |
| AI chấm sơ bộ | 15 | 41.7% |
| GV/TA duyệt trước khi phản hồi | 11 | 30.6% |

Khi buộc chọn một tính năng quan trọng nhất:

- **Gợi ý cá nhân khi gặp lỗi:** 10/36 (27.8%).
- **Cảnh báo giảng viên khi cả lớp gặp khó khăn:** 9/36 (25.0%).
- **AI chấm sơ bộ, giảng viên duyệt:** 7/36 (19.4%).
- **Quiz/poll nhanh:** 5/36 (13.9%).

Điều này ủng hộ một MVP gồm **Class Pulse cho giảng viên + hint giới hạn cho sinh viên**, nhưng không cần mở rộng sang mọi dạng trợ lý AI.

## 2.6 Mức độ AI được chấp nhận

| Mức hỗ trợ | Số người |
|---|---:|
| AI tự gửi gợi ý khi phát hiện khó khăn | 10 |
| AI hướng dẫn từng bước | 8 |
| AI chỉ phân tích và báo giảng viên | 8 |
| AI đưa gợi ý, sinh viên chủ động mở | 8 |
| Không muốn AI can thiệp | 2 |

Không có một lựa chọn áp đảo. Vì vậy MVP phải áp dụng:

- **Teacher-controlled intervention** cho tác động toàn lớp.
- **Student-requested hint** hoặc giảng viên phê duyệt trước.
- Không tự động gửi giải thích dài hoặc đưa đáp án.

## 2.7 Lo ngại cần biến thành yêu cầu thiết kế

| Lo ngại | Số người | Tỷ lệ | Yêu cầu tương ứng |
|---|---:|---:|---|
| Phụ thuộc quá nhiều vào AI | 18 | 50.0% | Hint theo tầng, bắt sinh viên tự thử lại |
| AI đánh giá sai mức độ hiểu | 16 | 44.4% | Evidence + confidence + teacher override |
| AI đưa gợi ý/đáp án sai | 14 | 38.9% | Chỉ dùng nội dung được duyệt, không sinh đáp án tự do |
| Quyền riêng tư | 13 | 36.1% | Kết quả trước lớp ẩn danh, RBAC, audit log |
| Dữ liệu bị dùng để gây áp lực | 11 | 30.6% | Live checkpoint mặc định không tính điểm |

Mức sẵn sàng thử nghiệm “có thể có” hoặc “chắc chắn có” là **22/36 (61.1%)**; 13/36 còn chưa chắc chắn. Pilot phải chứng minh hệ thống **nhanh, riêng tư, không gây áp lực và không làm gián đoạn buổi học**.

---

# 3. Problem Definition

## 3.1 Primary user và beneficiary

- **Primary user:** giảng viên dạy lớp live/hybrid đông trên VLearn.
- **Primary beneficiary:** sinh viên ít phát biểu, sinh viên chưa chắc chắn hoặc đang hiểu sai.
- **Secondary user:** đội ngũ học thuật chuẩn bị quiz, trợ giảng, quản trị LMS.

## 3.2 Problem statement

> Trong lớp khoảng 160 sinh viên, phần lớn người học không cung cấp tín hiệu khi chưa hiểu bài. Giảng viên chỉ quan sát được 10–15 người thường xuyên tương tác, nên không biết mức độ hiểu của toàn lớp và có thể tiếp tục bài khi nhiều sinh viên đang bị bỏ lại.

## 3.3 Jobs To Be Done

### Sinh viên

> Khi vừa học xong một khái niệm, tôi muốn phản hồi rằng mình hiểu, chưa chắc hoặc đang hiểu sai bằng một thao tác kín đáo, để giảng viên hỗ trợ trước khi chuyển sang phần tiếp theo.

### Giảng viên

> Khi đến một điểm kiến thức quan trọng, tôi muốn kiểm tra nhanh toàn lớp và nhận một kết luận có bằng chứng, để quyết định tiếp tục hay giải thích lại trong vài giây.

### Đội ngũ học thuật

> Khi chuẩn bị bài giảng, tôi muốn gắn câu hỏi với learning outcome và lỗi nhận thức thường gặp, để hệ thống có thể phân tích đúng thay vì chỉ báo phần trăm đúng/sai.

## 3.4 Core insight

> **Live quiz là cảm biến của lớp học, không chỉ là một bài kiểm tra.**

Giá trị không nằm ở số lượt trả lời; giá trị nằm ở khả năng chuyển dữ liệu thành quyết định:

- Lớp đã đủ hiểu để tiếp tục?
- Lớp đang nhầm khái niệm nào?
- Nên can thiệp bằng cách nào?
- Can thiệp vừa rồi có hiệu quả không?

---

# 4. Product Vision và nguyên tắc

## 4.1 Vision

> Biến mọi checkpoint trong VLearn thành một vòng phản hồi realtime, để sự không hiểu bài không còn bị ẩn trong lớp đông.

## 4.2 Value proposition

> **Nhìn thấy toàn lớp – hiểu đúng vấn đề – can thiệp kịp thời.**

## 4.3 Product principles

1. **Zero context switching:** sinh viên và giảng viên không rời VLearn.
2. **Teacher in control:** giảng viên chủ động kích hoạt quiz và quyết định can thiệp.
3. **Anonymous by default:** không hiển thị danh tính/câu sai trước lớp.
4. **Action over dashboard:** mỗi kết quả chỉ đưa tối đa ba hành động cụ thể.
5. **Evidence before AI:** thống kê và rule engine tạo kết luận; LLM chỉ diễn giải.
6. **No direct answer:** hint hỗ trợ suy luận, không giải bài đang đánh giá.
7. **Measure recovery:** luôn có khả năng kiểm tra lại sau can thiệp.
8. **Graceful degradation:** AI lỗi vẫn phải chạy được quiz và analytics cơ bản.

---

# 5. Product Canvas rút gọn

| Thành phần | Nội dung |
|---|---|
| Product | VLearn AI Interactive Learning Assistant |
| MVP module | VLearn Lecture Pulse |
| Bối cảnh | Lớp trực tiếp/hybrid khoảng 160 sinh viên |
| Pain chính | Sinh viên chưa hiểu nhưng không thể hiện; giảng viên thiếu tín hiệu đại diện |
| Current alternatives | Hỏi miệng, chat, Kahoot ngoài LMS, tự dùng Google/ChatGPT |
| Why they fail | Áp lực phát biểu, đổi nền tảng, dữ liệu rời rạc, không tạo quyết định giảng dạy |
| Solution | Quiz gắn slide + realtime class pulse + misconception + can thiệp + follow-up |
| Giá trị khác biệt | Đo được hiệu quả của hành động giảng dạy, không chỉ tỷ lệ đúng |
| North Star | Concept Recovery Rate |
| AI role | Tóm tắt, giải thích, đề xuất từ dữ liệu có cấu trúc |
| Teacher role | Kích hoạt, xác nhận, can thiệp |
| Student role | Trả lời, nêu confidence, mở hint, thử lại |
| Guardrails | Ẩn danh, không tính điểm mặc định, human-in-the-loop |
| Không làm trong MVP | Chatbot tổng quát, gamification, predictive risk, auto grading |

---

# 6. Core Product Loop

```text
1. TEACH
Giảng viên trình bày nội dung.

2. CHECK
Đến slide có checkpoint, giảng viên bấm “Bắt đầu”.

3. SIGNAL
Sinh viên trả lời và chọn mức chắc chắn trong 15–45 giây.

4. UNDERSTAND
Hệ thống tính participation, correctness, confidence và misconception.

5. DECIDE
AI trình bày một Class Pulse Card: trạng thái, bằng chứng, đề xuất.

6. INTERVENE
Giảng viên tiếp tục, giải thích nhanh, mở ví dụ hoặc gửi hint.

7. VERIFY
Giảng viên chạy follow-up question.

8. RECOVER
Hệ thống so sánh trước/sau và kết luận có thể tiếp tục hay chưa.
```

---

# 7. Phạm vi sản phẩm

## 7.1 Must-have – P0 MVP

### P0.1 Quiz gắn với nội dung

- Chọn quiz từ ngân hàng câu hỏi.
- Gắn quiz vào `slide_id` hoặc `lesson_block_id`.
- Khai báo learning outcome.
- Đáp án đúng.
- Misconception code cho từng đáp án sai.
- Câu follow-up tương đương.
- Thời gian trả lời.
- Chế độ mặc định: không tính điểm.

### P0.2 Live activation

- Giảng viên bắt đầu lecture session.
- VLearn nhận biết slide hiện tại.
- Hiển thị nhắc nhẹ khi slide có checkpoint.
- Một click để kích hoạt cho toàn session.
- Cho phép gia hạn, đóng sớm hoặc hủy.

### P0.3 Student response

- Popup ngay trong VLearn.
- Một lựa chọn + confidence: `Chắc chắn / Hơi chắc / Không chắc`.
- Gửi một lần, có thể sửa trước khi hết giờ nếu GV cho phép.
- Trạng thái xác nhận gửi thành công.
- Tự retry khi mất mạng ngắn.

### P0.4 Realtime class pulse

- Số người online.
- Số người đã nhận quiz.
- Số người đã trả lời.
- Tỷ lệ tham gia.
- Phân bố đáp án.
- Tỷ lệ đúng.
- Phân bố confidence.
- Misconception nổi bật.

### P0.5 Intervention card

AI hiển thị:

- Trạng thái: `Ready / Uncertain / Struggling / Insufficient Signal`.
- Một câu tóm tắt.
- 2–4 bằng chứng định lượng.
- Tối đa ba đề xuất.
- Confidence của kết luận.
- Nút `Tiếp tục`, `Giải thích nhanh`, `Mở ví dụ`, `Kiểm tra lại`.

### P0.6 Follow-up và recovery

- Kích hoạt câu follow-up đã chuẩn bị.
- So sánh tỷ lệ đúng, misconception và confidence trước/sau.
- Lưu kết quả can thiệp.
- Kết luận: `Recovered / Partially recovered / Not recovered`.

### P0.7 Session report

- Timeline checkpoint.
- Tỷ lệ tham gia.
- Chủ đề hiểu tốt/chưa tốt.
- Intervention đã chọn.
- Recovery result.
- Không hiển thị ranking sinh viên.

## 7.2 Should-have – P1 sau khi pilot P0 ổn định

- Hint theo misconception, do sinh viên chủ động mở.
- Giảng viên gửi hint tới nhóm chọn một đáp án sai.
- Tài liệu/slide liên quan.
- Một câu luyện tập sau buổi.
- Dashboard theo learning outcome qua nhiều session.
- Teacher feedback: xác nhận insight đúng/sai.

## 7.3 Out of scope

- Chatbot hỏi đáp tự do toàn môn.
- AI tự kích hoạt quiz.
- AI tự tạo và xuất bản quiz không duyệt.
- Camera/voice/emotion tracking.
- Predictive dropout/risk score cá nhân.
- Chấm điểm hoặc thay đổi deadline tự động.
- Leaderboard, badge, gamification.
- Gửi cảnh báo cho phụ huynh/cố vấn.
- Phân tích code realtime trong IDE.
- Mobile app native.

---

# 8. Functional Requirements

## FR-01 – Gắn checkpoint vào slide

**Actor:** đội ngũ học thuật/giảng viên có quyền soạn bài.

**Dữ liệu bắt buộc:**

```yaml
checkpoint_id:
course_id:
lesson_id:
slide_id:
learning_outcome_id:
question_id:
duration_seconds: 30
scoring_mode: ungraded
follow_up_question_id:
```

**Acceptance criteria:**

- Không cho publish nếu thiếu đáp án đúng.
- Mỗi đáp án sai có thể gắn một `misconception_code`.
- Có preview đúng giao diện sinh viên.
- Checkpoint đã publish không được thay đổi nội dung trong lúc session đang chạy.

## FR-02 – Kích hoạt quiz

**Acceptance criteria:**

- Từ lecture view, bắt đầu quiz không quá hai thao tác.
- Toàn bộ người đang ở session nhận sự kiện trong P95 dưới 2 giây.
- Giảng viên nhìn thấy số client đã nhận.
- Không thể chạy hai checkpoint đồng thời trong cùng session.

## FR-03 – Gửi câu trả lời

**Acceptance criteria:**

- Response được xác nhận trong P95 dưới 1 giây khi mạng ổn định.
- Request có `idempotency_key`; gửi lại không tạo bản ghi trùng.
- Không chấp nhận response sau `closed_at`, trừ khi server đã nhận trước thời điểm đóng.
- Trước lớp chỉ hiển thị dữ liệu tổng hợp.

## FR-04 – Phân tích realtime

**Acceptance criteria:**

- Participation cập nhật tối đa mỗi một giây.
- Correctness chỉ hiển thị sau khi giảng viên đóng quiz hoặc bật chế độ xem sớm.
- Hệ thống không kết luận nếu số phản hồi dưới ngưỡng tin cậy.
- Misconception chỉ được gắn khi đáp án đã có mapping học thuật.

## FR-05 – Tạo Class Pulse

**Acceptance criteria:**

- Kết luận có trong vòng 3–5 giây sau khi quiz đóng.
- Mỗi kết luận có bằng chứng định lượng.
- Đề xuất chỉ lấy từ action catalog đã phê duyệt.
- Giảng viên có thể bỏ qua và đánh dấu “không chính xác”.
- Nếu LLM lỗi, hiển thị template từ rule engine.

## FR-06 – Thực hiện can thiệp

Các action code P0:

```text
CONTINUE
REINFORCE_1_MIN
RETEACH_3_MIN
SHOW_APPROVED_EXAMPLE
DISCUSS_1_MIN
RUN_FOLLOW_UP
SEND_HINT_GROUP
```

Mỗi hành động lưu người chọn, thời gian và checkpoint liên quan.

## FR-07 – Follow-up

**Acceptance criteria:**

- Follow-up phải cùng learning outcome.
- Không lặp nguyên văn câu ban đầu.
- Hệ thống so sánh trên nhóm người tham gia cả hai câu và toàn bộ lớp.
- Báo rõ nếu mẫu follow-up quá nhỏ.

## FR-08 – Hint P1

Hint ba tầng:

1. Nhắc khái niệm.
2. Gợi ý hướng suy luận.
3. Ví dụ tương tự.

Không hiển thị đáp án gốc, không sinh code hoàn chỉnh cho bài đang chấm.

## FR-09 – Báo cáo buổi học

- Xuất dữ liệu theo course/session.
- Giảng viên thấy chi tiết lớp mình.
- Sinh viên chỉ thấy lịch sử cá nhân.
- Quản trị xem aggregate; không tự động dùng checkpoint làm điểm đánh giá.

---

# 9. Decision Logic

## 9.1 Tách rule engine và LLM

```text
Raw Responses
      ↓
Deterministic Aggregation
      ↓
Configurable Rule Engine
      ↓
Structured Decision JSON
      ↓
LLM Explanation
      ↓
Teacher UI
```

LLM không tự tính tỷ lệ, không tự suy đoán learning outcome và không tự invent misconception.

## 9.2 Ngưỡng pilot mặc định

Các ngưỡng phải cấu hình được theo course.

### Độ đủ tín hiệu

| Participation | Trạng thái |
|---:|---|
| <60% | Insufficient Signal |
| 60–74% | Weak Signal |
| ≥75% | Adequate Signal |

### Mức độ hiểu

| Điều kiện | Trạng thái | Đề xuất mặc định |
|---|---|---|
| Correct ≥80%, low-confidence ≤20% | Ready | Continue |
| Correct 65–79% | Uncertain | Reinforce |
| Correct <65% | Struggling | Reteach |
| Low-confidence >30% dù correct cao | Uncertain | Example + follow-up |
| Một đáp án sai ≥25% | Misconception cluster | Targeted explanation |

### Recovery

| Kết quả follow-up | Trạng thái |
|---|---|
| Đạt ≥80% hoặc tăng ≥15 điểm % | Recovered |
| Tăng 5–14 điểm % | Partially recovered |
| Tăng <5 điểm % | Not recovered |

## 9.3 Structured AI output

```json
{
  "status": "STRUGGLING",
  "summary": "Lớp chưa nắm chắc điều kiện dừng của đệ quy.",
  "evidence": [
    "132/160 sinh viên tham gia",
    "54% trả lời đúng",
    "29% chọn đáp án B: STOP_CONDITION_CONFUSION"
  ],
  "recommended_actions": [
    "RETEACH_3_MIN",
    "SHOW_APPROVED_EXAMPLE",
    "RUN_FOLLOW_UP"
  ],
  "confidence": 0.91
}
```

---

# 10. UX Specification

## 10.1 Teacher Lecture View

Hiển thị tối thiểu:

- Slide hiện tại.
- Số sinh viên online.
- Checkpoint gắn với slide.
- Nút `Bắt đầu`.
- Không mở dashboard lớn trong lúc đang giảng.

## 10.2 Live Controller

- Countdown.
- `126/160 đã trả lời`.
- Gia hạn 10 giây.
- Đóng quiz.
- Cảnh báo số client chưa nhận do mất kết nối.

## 10.3 Class Pulse Card

```text
CẦN GIẢI THÍCH THÊM

132/160 tham gia (82.5%)
54% trả lời đúng
29% có dấu hiệu nhầm điều kiện dừng

Đề xuất:
[Giải thích 3 phút] [Mở ví dụ] [Kiểm tra lại]
```

Thiết kế theo moodboard:

- Nền trắng/xám rất nhạt.
- Primary blue của VLearn.
- Đỏ chỉ dùng cho cảnh báo rõ ràng.
- Card ngắn, dễ đọc khi đang giảng.
- Không dùng màu để công khai ai trả lời sai.

## 10.4 Student Popup

- Câu hỏi.
- 2–5 đáp án.
- Countdown.
- Confidence.
- Nút gửi.
- Trạng thái “Đã ghi nhận”.
- Không leaderboard.
- Không hiển thị đáp án đúng trước khi GV cho phép.

## 10.5 Follow-up Comparison

```text
TRƯỚC CAN THIỆP     SAU CAN THIỆP
54% đúng             78% đúng
29% misconception    10% misconception
33% không chắc       14% không chắc

Kết luận: Cải thiện rõ, có thể tiếp tục.
```

---

# 11. Data Model

## 11.1 Core entities

| Entity | Trường chính |
|---|---|
| `lecture_session` | id, course_id, started_at, ended_at, status |
| `session_participant` | session_id, user_id, joined_at, connection_status |
| `checkpoint` | id, slide_id, learning_outcome_id, question_id, follow_up_id |
| `quiz_run` | id, checkpoint_id, session_id, opened_at, closed_at |
| `answer_option` | id, question_id, is_correct, misconception_code |
| `student_response` | run_id, user_id, option_id, confidence, submitted_at |
| `class_pulse` | run_id, participation, correctness, status, generated_at |
| `misconception_result` | run_id, code, count, ratio |
| `intervention_suggestion` | run_id, action_code, rationale, confidence |
| `teacher_action` | run_id, actor_id, action_code, created_at |
| `follow_up_link` | original_run_id, follow_up_run_id |
| `recovery_result` | original_run_id, follow_up_run_id, delta, status |
| `student_hint` | user_id, run_id, level, content_id, opened_at |

## 11.2 Privacy rule

- `student_response` cần danh tính để sinh viên xem lại và hệ thống chống gửi trùng.
- Màn hình trình chiếu lớp chỉ gọi aggregate API.
- Log truy cập chi tiết theo giảng viên/course.
- Không dùng dữ liệu live checkpoint làm điểm nếu không có cấu hình và thông báo riêng.

---

# 12. API và Realtime Events

## 12.1 REST endpoints tối thiểu

```http
POST /api/lecture-sessions
POST /api/lecture-sessions/{sessionId}/checkpoints/{checkpointId}/launch
POST /api/quiz-runs/{runId}/responses
POST /api/quiz-runs/{runId}/close
GET  /api/quiz-runs/{runId}/pulse
POST /api/quiz-runs/{runId}/teacher-actions
POST /api/quiz-runs/{runId}/follow-up
GET  /api/lecture-sessions/{sessionId}/report
POST /api/quiz-runs/{runId}/feedback
```

## 12.2 WebSocket/SSE events

```text
checkpoint.launched
checkpoint.extended
response.count.updated
checkpoint.closed
class_pulse.ready
teacher_action.selected
follow_up.launched
recovery.ready
```

## 12.3 Idempotency

- Mỗi response có `client_response_id`.
- Unique constraint `(run_id, user_id)`.
- Update response được phép trước khi đóng nếu quiz config cho phép.
- Event consumer phải xử lý at-least-once mà không tăng count trùng.

---

# 13. Kiến trúc đề xuất

```text
Web VLearn
├── Lecture UI
├── Student Quiz Popup
└── Teacher Pulse Card
          │
          ▼
Lecture/Quiz Orchestrator
├── Session state
├── Checkpoint lifecycle
└── Response validation
          │
          ├──────────► Realtime Gateway (WebSocket/SSE)
          │
          ▼
Response Store / Event Stream
          │
          ▼
Analytics Service
├── Participation
├── Correctness
├── Confidence
└── Misconception mapping
          │
          ▼
Decision Rule Engine
          │
          ▼
AI Explanation Service
├── Structured prompt
├── Approved action catalog
└── Fallback templates
          │
          ▼
Teacher Action + Follow-up
```

## 13.1 Công nghệ phù hợp với Web VLearn

| Thành phần | Gợi ý |
|---|---|
| Frontend | Next.js/React + TypeScript |
| Backend | FastAPI hoặc NestJS |
| Database | PostgreSQL |
| Cache/session | Redis |
| Event/realtime | Redis Streams/RabbitMQ + WebSocket/SSE |
| AI service | LLM API qua structured output |
| Content grounding P1 | pgvector/Qdrant nếu cần RAG |
| Observability | OpenTelemetry, Prometheus, Grafana |
| Deployment | Docker; Kubernetes chỉ khi hạ tầng hiện tại cần |

Không cần vector database trong P0 nếu hint và explanation chỉ lấy từ nội dung cấu trúc đã duyệt.

---

# 14. Non-functional Requirements

| Hạng mục | Mục tiêu MVP |
|---|---|
| Quy mô | 160 người/lớp; kiểm thử ít nhất 250 kết nối đồng thời |
| Quiz delivery | P95 <2 giây |
| Response acknowledgement | P95 <1 giây |
| Pulse generation | <5 giây sau khi đóng |
| Availability trong giờ học | ≥99.5% |
| Data loss | 0 response đã ACK |
| LLM dependency | Không làm hỏng quiz khi LLM unavailable |
| Accessibility | Keyboard navigation, contrast đạt WCAG AA cơ bản |
| Responsive | Laptop và mobile web |
| Auditability | Lưu mọi teacher action và AI output |
| Observability | Metrics theo session/run; correlation ID end-to-end |

---

# 15. Guardrails, privacy và academic integrity

## 15.1 Human-in-the-loop

AI không được:

- Tự quyết định giảng viên phải dừng bài.
- Tự gửi thông báo mang tính đánh giá học thuật.
- Tự thay đổi điểm/deadline.
- Gắn nhãn sinh viên yếu trước lớp.
- Tự tạo đáp án và gửi không duyệt.

## 15.2 Hint policy

- Hint dựa trên misconception đã định nghĩa.
- Không chứa đáp án cuối.
- Không hoàn thành code/bài tập đang chấm.
- Mỗi lần mở tăng dần mức độ, không đưa tất cả ngay.
- Ghi log hint đã mở.

## 15.3 Privacy

- Aggregate trước lớp.
- RBAC theo course.
- Data retention cấu hình theo học kỳ.
- Mã hóa khi truyền và khi lưu.
- Audit log truy cập response cá nhân.
- Thông báo rõ live quiz không dùng cho surveillance.
- Cho phép admin tắt AI theo course.

---

# 16. Metrics

## 16.1 North Star

```text
Concept Recovery Rate =
Số checkpoint chưa đạt nhưng đạt sau can thiệp
──────────────────────────────────────────────
Tổng checkpoint đã can thiệp và có follow-up
```

## 16.2 KPI pilot

| Nhóm | Chỉ số | Target pilot |
|---|---|---:|
| Participation | Tỷ lệ SV trả lời mỗi checkpoint | ≥70% |
| Coverage | SV cung cấp ít nhất một tín hiệu/buổi | ≥80% |
| Speed | Thời gian có insight sau đóng quiz | ≤5 giây |
| Accuracy | Insight được GV xác nhận hợp lý | ≥70% |
| Adoption | Tỷ lệ GV dùng ít nhất một action | ≥60% |
| Recovery | Tăng tỷ lệ đúng sau can thiệp | ≥15 điểm % trung bình |
| Friction | Thao tác bắt đầu checkpoint | ≤2 thao tác |
| Reliability | Client nhận quiz thành công | ≥98% |
| Student trust | Cảm thấy trả lời ít áp lực | ≥75% đồng ý |
| Safety | Hint bị báo đưa đáp án/sai | <5% |

Target là giả thuyết pilot, không phải số liệu hiện có.

## 16.3 Event analytics

```text
lecture_session_started
checkpoint_prompted
checkpoint_launched
quiz_received
quiz_answered
quiz_closed
pulse_viewed
teacher_action_selected
follow_up_answered
hint_opened
insight_marked_incorrect
```

---

# 17. User Stories quan trọng

## US-01 – Sinh viên phản hồi kín đáo

> Là sinh viên, tôi muốn trả lời checkpoint ngay trong VLearn mà không công khai danh tính, để thể hiện mình chưa hiểu mà không ngại phát biểu.

**Done khi:** nhận quiz, gửi được câu trả lời, thấy xác nhận; màn hình lớp không lộ danh tính.

## US-02 – Giảng viên nhìn thấy toàn lớp

> Là giảng viên, tôi muốn thấy tỷ lệ tham gia và phân bố đáp án realtime, để biết kết quả có đủ đại diện hay không.

**Done khi:** có response count, participation và trạng thái signal confidence.

## US-03 – Giảng viên biết lớp đang nhầm gì

> Là giảng viên, tôi muốn hệ thống chỉ ra misconception phổ biến, để giải thích đúng điểm thay vì giảng lại toàn bộ.

**Done khi:** mapping đã được đội học thuật định nghĩa và hiển thị count/ratio.

## US-04 – Giảng viên nhận đề xuất có bằng chứng

> Là giảng viên, tôi muốn nhận tối đa ba hành động kèm lý do, để quyết định trong vài giây.

**Done khi:** insight có evidence, confidence và teacher override.

## US-05 – Đo hiệu quả can thiệp

> Là giảng viên, tôi muốn chạy follow-up và xem mức cải thiện, để biết có thể tiếp tục bài hay chưa.

**Done khi:** hệ thống so sánh trước/sau trên cùng learning outcome.

## US-06 – Sinh viên nhận hint đúng lỗi

> Là sinh viên, tôi muốn mở một hint theo lỗi mình mắc mà không nhận đáp án, để tự sửa cách hiểu.

**P1 Done khi:** hint theo tầng, nguồn đã duyệt, có log và feedback.

---

# 18. Testing Strategy

## 18.1 Functional

- Lifecycle open/extend/close.
- Response trước/sau deadline.
- Duplicate response.
- Reconnect.
- Follow-up linking.
- Permission theo role/course.
- Fallback khi AI lỗi.

## 18.2 Load

Kịch bản tối thiểu:

1. 250 WebSocket clients kết nối.
2. 200 response trong 5 giây cuối.
3. Reconnect 10% client.
4. Đóng quiz đồng thời với response cuối.
5. Analytics và pulse hoàn thành dưới 5 giây.

## 18.3 AI evaluation

Bộ test cố định gồm:

- Ready.
- Low participation.
- Một misconception lớn.
- Phân bố đáp án phân tán.
- Correct cao nhưng confidence thấp.
- Can thiệp không cải thiện.

Tiêu chí:

- Không bịa số.
- Không đưa action ngoài catalog.
- Không kết luận khi thiếu tín hiệu.
- Tóm tắt không quá 60–80 từ.
- Luôn giữ teacher control.

## 18.4 Usability

- GV có kích hoạt quiz khi đang nói mà không mất nhịp?
- Sinh viên mobile có trả lời trong 30 giây?
- Class Pulse có đọc trong dưới 10 giây?
- Cảnh báo có gây áp lực hoặc cảm giác bị theo dõi?

---

# 19. Kế hoạch triển khai 8 tuần

## Tuần 1 – Discovery và contract

- Xác nhận lecture/session flow hiện tại.
- Chốt schema checkpoint, learning outcome, misconception.
- Prototype teacher/student flow.
- Chọn 2–3 course pilot.

## Tuần 2–3 – Live quiz foundation

- Quiz-run lifecycle.
- Realtime delivery.
- Student response.
- Teacher controller.
- Basic aggregate.

## Tuần 4 – Class Pulse

- Participation, correctness, confidence.
- Misconception mapping.
- Rule engine.
- UI result card.

## Tuần 5 – AI explanation

- Structured output.
- Action catalog.
- Fallback template.
- Teacher feedback.

## Tuần 6 – Follow-up/recovery

- Follow-up run.
- Before/after comparison.
- Session report.

## Tuần 7 – Reliability và security

- Load test 250 clients.
- Retry/idempotency.
- RBAC/audit.
- Monitoring.

## Tuần 8 – Pilot

- Onboard giảng viên.
- Chạy 2–4 tuần thực tế.
- Thu metrics và phỏng vấn.
- Quyết định P1 hint.

## Nhân sự tối thiểu

- 1 Product/BA.
- 1 Frontend.
- 1 Backend.
- 1 AI/Data engineer bán thời gian.
- 1 QA.
- 1 giảng viên/SME chịu trách nhiệm misconception và content approval.

---

# 20. Definition of MVP Success

MVP được xem là đáng tiếp tục khi:

1. Ít nhất 70% sinh viên tham gia checkpoint.
2. Giảng viên đọc được insight và chọn hành động trong dưới 30 giây.
3. Insight xuất hiện dưới 5 giây.
4. Ít nhất 70% insight được GV đánh giá đúng/hữu ích.
5. Concept Recovery Rate chứng minh can thiệp tạo cải thiện có ý nghĩa.
6. Sinh viên cảm thấy ít áp lực hơn phát biểu trực tiếp.
7. Không có sự cố lộ danh tính, mất response hoặc AI đưa đáp án nghiêm trọng.
8. Giảng viên cho rằng tính năng không phá vỡ flow giảng dạy.

Nếu participation thấp hoặc giảng viên không dùng follow-up, chưa nên đầu tư vào ML/personalization vì hệ thống chưa tạo được vòng dữ liệu cốt lõi.

---

# 21. Rủi ro và biện pháp

| Rủi ro | Biện pháp |
|---|---|
| Quiz thiết kế kém | Review theo learning outcome; pilot question quality |
| Sinh viên bấm ngẫu nhiên | Confidence + follow-up + response time signal |
| Participation thấp | Không kết luận; nhắc nhẹ; giảm thao tác |
| AI tóm tắt sai | Rule engine quyết định; LLM chỉ diễn giải |
| GV bị phân tâm | Card ngắn, tối đa ba action |
| Sinh viên thấy bị giám sát | Aggregate/anonymous; ungraded by default |
| Mạng yếu | Client retry, server idempotency, SSE fallback |
| 160 response dồn cuối giờ | Queue, load test, atomic close handling |
| Hint gây phụ thuộc | Student-requested, nhiều tầng, yêu cầu thử lại |
| Scope phình thành AI Tutor | Giữ KPI ở feedback loop và recovery |

---

# 22. Backlog ưu tiên

## P0 – Build now

- Lecture session integration.
- Checkpoint linked to slide.
- One-click launch.
- Realtime response.
- Participation/correctness.
- Misconception mapping.
- Rule-based class status.
- AI short explanation.
- Teacher action.
- Follow-up/recovery.
- Session report.
- RBAC/audit/load test.

## P1 – Validate then build

- Student-requested hint.
- Teacher sends hint to misconception group.
- Approved resource recommendation.
- Learning-outcome heatmap.
- Teacher feedback-driven calibration.

## P2 – Không cam kết

- Adaptive quiz sequencing.
- Cross-session personalization.
- Natural-language analytics.
- Predictive risk.
- AI-assisted quiz authoring.

---

# 23. Quyết định sản phẩm cuối cùng

## Xây gì?

> Một lớp **realtime formative assessment** tích hợp vào VLearn, dùng quiz đã chuẩn bị để phát hiện sự không hiểu đang bị ẩn và giúp giảng viên can thiệp ngay.

## Không xây gì?

> Không xây “AI Teaching Assistant làm mọi thứ”, không xây Kahoot clone có leaderboard và không xây chatbot trả lời thay giảng viên.

## Wedge feature

> **Class Pulse sau checkpoint, kèm misconception và một hành động có thể thực hiện ngay.**

## Lý do

- Đánh trực tiếp vào pain đau nhất: sinh viên chưa hiểu nhưng giảng viên không biết.
- Phù hợp dữ liệu khảo sát: quiz nhanh, cảnh báo cả lớp và hint là ba nhu cầu nổi bật.
- Không yêu cầu thay đổi quy trình bài giảng: quiz đã được chuẩn bị và gắn sẵn.
- Có thể triển khai trong phạm vi kỹ thuật rõ ràng.
- Tạo được vòng dữ liệu để phát triển personalization sau này.

---

# 24. Checklist trước khi bắt đầu code

- [ ] Có định nghĩa lecture session và participant hiện tại.
- [ ] Có cách map slide/lesson block với checkpoint.
- [ ] Có ngân hàng quiz hoặc schema quiz ổn định.
- [ ] SME thống nhất learning outcome và misconception taxonomy.
- [ ] Quyết định WebSocket hay SSE theo hạ tầng VLearn.
- [ ] Chốt ngưỡng pilot và cho phép cấu hình.
- [ ] Chốt quiz ungraded mặc định.
- [ ] Chốt policy hiển thị dữ liệu cá nhân.
- [ ] Chọn 2–3 lớp pilot và giảng viên đồng hành.
- [ ] Có kế hoạch load test tối thiểu 250 client.
- [ ] Có event analytics và dashboard vận hành.
- [ ] Có fallback không phụ thuộc LLM.

---

## Phụ lục A – Ví dụ checkpoint

```yaml
checkpoint:
  title: "Điều kiện dừng trong đệ quy"
  slide_id: "slide-18"
  learning_outcome: "LO-REC-02"
  duration_seconds: 30
  scoring_mode: "ungraded"
  question:
    prompt: "Điều kiện nào giúp hàm đệ quy dừng?"
    options:
      - id: A
        misconception: "INPUT_BOUNDARY_CONFUSION"
      - id: B
        misconception: "RECURSIVE_CALL_CONFUSION"
      - id: C
        correct: true
      - id: D
        misconception: "CALL_STACK_CONFUSION"
  follow_up_question_id: "q-rec-02-b"
```

## Phụ lục B – Ví dụ Class Pulse

```text
TRẠNG THÁI: STRUGGLING
Độ tin cậy: Cao

132/160 sinh viên tham gia.
54% trả lời đúng.
29% chọn phương án thể hiện nhầm điều kiện dừng.

Đề xuất:
1. Giải thích lại trong 3 phút bằng ví dụ n = 0.
2. Mở ví dụ đã duyệt REC-EX-03.
3. Chạy câu follow-up q-rec-02-b.
```

## Phụ lục C – Nguồn

- Google Sheet khảo sát: `Phản hồi khảo sát VLearn – AI Teaching Assistant`, tab `Form Responses 1`, 36 phản hồi.
- Moodboard VLearn AI Interactive Learning Assistant do đội dự án cung cấp trong phiên làm việc.
- Các target pilot, threshold và timeline trong tài liệu là giả thuyết triển khai cần hiệu chỉnh sau pilot.