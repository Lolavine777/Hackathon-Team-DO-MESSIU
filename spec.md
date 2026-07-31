# AI SPEC - VLearn Lecture Pulse · Nhóm ĐỘ MESSIU · Zone Chưa được ban tổ chức phân

Khóa: 4

Lớp: D305

Hướng: [x] A - VLearn  [ ] B - Trợ lý Học viên  [ ] C - Làn mở

Loại: [ ] Tối ưu tính năng có sẵn  [x] Tính năng mới

## §1. User & Job

- Job executor + workflow: Giảng viên đang dạy một phiên lecture AI20K trên VLearn cho khoảng 160 học viên, trình bày nội dung, kích hoạt checkpoint, xem tín hiệu toàn lớp, can thiệp và kiểm tra lại.
- Core JTBD: Khi vừa trình bày xong một khái niệm quan trọng, giảng viên muốn kiểm tra nhanh mức độ hiểu của cả lớp để biết nên tiếp tục hay giải thích lại.
- Problem statement: Trong lớp khoảng 160 người nhưng thường chỉ 10-15 người chủ động phát biểu, nên giảng viên thiếu tín hiệu đại diện và có thể tiếp tục bài khi nhiều học viên đang bị bỏ lại.
- Evidence:
  - Snapshot dùng cho CP4 có `n=31`: 19/31 (61,3%) đồng ý giảng viên khó biết ai đang gặp khó khăn trong lớp đông.
  - 17/31 (54,8%) đồng ý từng có phần chưa hiểu nhưng giảng viên vẫn tiếp tục bài.
  - 27/31 (87,1%) dùng ChatGPT hoặc công cụ tương tự khi bị kẹt, làm tín hiệu hiểu bài rời khỏi phiên học.
  - 8/31 (25,8%) chờ trên 20 phút hoặc thường không nhận được hỗ trợ.
  - Chatlog thật có 1.261 lượt hỏi đáp, nhưng trường `misconceptions` không được dùng lần nào và tutor chỉ hỏi kiểm tra lại ở 3/2.515 message.
- Quote hoặc ví dụ nguyên văn:
  - R1, Q5: `"Bỏ qua và chuyển sang phần khác, Không làm tiếp"`.
  - R1, Q6: `"Sợ câu hỏi của mình quá đơn giản"`.
  - R10, Q6: `"Sợ câu hỏi của mình quá đơn giản"`.
  - T0649/M1149: `"tóm tắt nội dung chính trong slide này"`.
  - T1201/M2413: `"tóm tắt"`.
  - T0058/M2247: `"xem bài tập thực hành lab day 2 chiều nay ở đaau"`.
- Chuẩn bằng chứng: snapshot 31 phản hồi vượt ngưỡng khảo sát A tối thiểu 20 người và cả hai pain trực tiếp đều được hơn 50% người trả lời xác nhận.
- Giới hạn bằng chứng: mẫu được thu thập thuận tiện và câu hỏi tập trung nhiều vào giờ thực hành, nên chưa đại diện cho toàn bộ học viên hoặc mọi phiên lecture trên VLearn.
- Cơ sở mining: chatlog có số đếm và ví dụ nguyên văn nhưng phản ánh hành vi hỏi tutor, vì vậy chỉ được dùng làm bằng chứng gián tiếp cho nhu cầu tín hiệu hiểu bài trong lecture.

Nguồn đầy đủ nằm tại `docs/problem-space/servey_learner.txt`, `docs/problem-space/servey_teacher.txt`, `docs/problem-space/lms-du-lieu-khong-hanh-dong.md` và `data/vlearn-pack/chatlog/DATA_DICTIONARY.md`.

## §2. Impact & quyết định chọn

| Ứng viên | Số người bị ảnh hưởng | Tần suất | Tốn gì mỗi lần | Khả thi trong hackathon | Điểm tham khảo | Quyết định |
|---|---:|---:|---:|---:|---:|---|
| Thiếu tín hiệu đại diện khiến giảng viên phân bổ sai thời gian trong lecture | Khoảng 145-150 người ít chủ động trong lớp 160 người | Mỗi khái niệm quan trọng | Một phần lớp tiếp tục học khi chưa hiểu | 4/5 | 12/15 | Chọn |
| Người bị kẹt chuyển sang hỏi công cụ riêng nên lớp trông như đang ổn | 27/31 người khảo sát dùng ChatGPT hoặc công cụ tương tự | Khi gặp phần chưa hiểu | Giảng viên mất tín hiệu để can thiệp chung | 3/5 | 10/15 | Giữ làm rủi ro cần đo |
| Cùng một misconception phải được giải thích riêng nhiều lần | Nhiều người có thể chọn cùng một phương án sai | Nhiều checkpoint trong buổi | Lặp lại thời gian hỗ trợ | 3/5 | 9/15 | Giữ làm cơ hội broadcast |
| Phản hồi bài nộp đến muộn | Người đã nộp bài | Sau buổi học | Chậm sửa lỗi và có thể mất điểm | 2/5 | 8/15 | Loại |

Ứng viên đã loại gồm chatbot tổng quát, theo dõi code trong IDE, dự đoán học viên yếu, phản hồi bài nộp và hệ thống ticket hỗ trợ cá nhân đầy đủ.

Các hướng này nằm ngoài một phiên lecture, đòi dữ liệu dài hạn hoặc chỉ xử lý từng cá nhân sau khi vấn đề đã xuất hiện.

Ứng viên được chọn là vòng phản hồi checkpoint trong lecture vì tác động trực tiếp đến gần như toàn lớp và tạo cơ hội can thiệp ngay trước khi giảng viên chuyển nội dung.

Chuỗi tác động là: ít người phát biểu -> tín hiệu lớp không đại diện -> giảng viên khó chọn phần cần giải thích lại -> checkpoint ít friction thu tín hiệu toàn lớp -> Class Pulse chỉ ra misconception nổi bật -> giảng viên can thiệp và kiểm tra recovery ngay trong phiên.

Code hiện tại là source of truth cho ranh giới AI: model chỉ soạn checkpoint chẩn đoán để giảng viên duyệt.

Tỷ lệ đúng, Class Pulse, trạng thái lớp và đề xuất can thiệp do rule engine xác định, không được trình bày là quyết định của AI.

## §3. Giải pháp tương tự đã nghiên cứu

### Kahoot

- Flow đã dùng: Sau khi học xong toàn bộ lecture, học viên vào Kahoot, trả lời bộ câu hỏi và xem kết quả.
- Đáng học: thao tác tham gia và trả lời có ít friction hơn việc xung phong phát biểu trước lớp.
- Đáng né: tín hiệu chỉ xuất hiện cuối buổi nên không giúp giảng viên điều chỉnh nội dung trong lúc học viên đang nghe giảng.
- Khác biệt của nhóm: VLearn Lecture Pulse đặt checkpoint tại các điểm quan trọng trong lecture, chẩn đoán misconception và hỗ trợ giảng viên can thiệp rồi đo recovery ngay.

### Mentimeter

- Flow đối chiếu: giảng viên chèn poll hoặc quiz vào bài trình bày, học viên tham gia bằng mã và kết quả được tổng hợp theo thời gian thực.
- Đáng học: thu tín hiệu của cả lớp ngay trong lúc trình bày và hiển thị kết quả tổng hợp dễ đọc.
- Đáng né: luồng phụ thuộc vào một nền tảng tương tác tách khỏi học liệu và câu hỏi vẫn cần được giảng viên chủ động soạn.
- Khác biệt của nhóm: VLearn Lecture Pulse nằm trong flow VLearn, dùng AI soạn checkpoint chẩn đoán từ slide hiện tại, gắn phương án sai với misconception và nối kết quả với intervention cùng follow-up.

## §4. Thiết kế

- Lát cắt một câu: Trong một phiên lecture AI20K trên VLearn, AI quyết định bản nháp checkpoint nào chẩn đoán đúng một learning outcome trên slide hiện tại để giảng viên duyệt và kích hoạt, giúp giảng viên biết phần nào nhiều học viên chưa hiểu và can thiệp trước khi tiếp tục bài.
- Non-goals:
  - Không xây chatbot trả lời mọi câu hỏi.
  - Không để AI tự xuất bản checkpoint hoặc tự dừng bài giảng.
  - Không dùng kết quả checkpoint để chấm điểm hay xếp hạng học viên.
  - Không dự đoán rủi ro dài hạn của từng học viên.
  - Không xây hệ thống ticket hỗ trợ cá nhân làm flow chính.
  - Không để LLM tính tỷ lệ, trạng thái Class Pulse hoặc recovery.
- Mức prototype nhắm tới: [ ] Sketch [ ] Mock [x] Working.
- Phần thật: gọi `gemini-2.5-flash`, tạo checkpoint, duyệt bản nháp, vòng đời checkpoint, gửi phản hồi, Class Pulse, intervention, follow-up và báo cáo.
- Phần mock: roster và phản hồi của khoảng 152 học viên do simulator tạo; dữ liệu phiên nằm trong RAM; xác thực mới dựa trên role header.
- Automation: [x] augment [ ] conditional [ ] automate.
- Lý do: câu hỏi, đáp án hoặc giải thích sai có thể làm cả lớp học sai, nên AI chỉ soạn bản nháp và giảng viên giữ quyền sửa, bỏ hoặc kích hoạt.

### Hợp đồng nguồn cho AI

- Checkpoint phải kiểm tra đúng một learning outcome thuộc slide hiện tại.
- Model nhận toàn bộ phần chữ của slide hiện tại và ngữ cảnh giới hạn từ các slide trước để hiểu thuật ngữ và mạch bài.
- Nội dung factual trong prompt, đáp án, giải thích, distractor, follow-up và ví dụ phải có căn cứ trong gói ngữ cảnh slide được cấp.
- Slide trước chỉ hỗ trợ diễn giải mạch bài; checkpoint không được chuyển trọng tâm sang learning outcome của slide trước.
- Nếu trang nằm ngoài tài liệu hoặc gần như không có chữ, hệ thống trả lỗi rõ ràng và không gọi model để bịa nội dung.

### §4b. Nguyên tắc đã áp dụng

| Nguyên tắc | Áp cụ thể vào đâu trong prototype |
|---|---|
| Giải thích AI có thể làm gì | UI báo trạng thái AI, mô tả đây là bản nháp và khóa nút khi model chưa cấu hình |
| Human-in-the-loop | `suggest-checkpoints` chỉ trả bản nháp; giảng viên phải duyệt trước khi lưu và kích hoạt |
| Cho phép sửa và từ chối | Editor cho phép sửa prompt, lựa chọn, đáp án, hint, ví dụ và follow-up hoặc bỏ toàn bộ bản nháp |
| Giới hạn nguồn | Checkpoint kiểm tra slide hiện tại và chỉ dùng gói ngữ cảnh slide giới hạn do backend cấp |
| Graceful degradation | Quiz có sẵn, Class Pulse và rule engine vẫn chạy khi AI không khả dụng |
| Hiển thị bằng chứng | Class Pulse hiển thị participation, tỷ lệ đúng, phân bố lựa chọn và misconception |
| Tránh tác động không mong muốn | Kết quả được aggregate trước lớp và checkpoint mặc định không tính điểm |

## §5. Kiểu lỗi - 4 lớp chỗ khó và kịch bản

| Tình huống cụ thể | Lớp | Hành vi mong muốn | Case |
|---|---|---|---|
| Page bằng 0 | ① Không có trong tài liệu | Trả 422 và không sinh checkpoint | S01-A |
| Page lớn hơn tổng số trang | ① Không có trong tài liệu | Trả 422 và không bịa nội dung | S01-B |
| Trang tổng quan chứa nhiều khái niệm | ② Mơ hồ | Chỉ chọn một learning outcome hẹp, hoặc yêu cầu giảng viên chọn | S02-A |
| Trang tóm tắt chứa nhiều insight | ② Mơ hồ | Không trộn nhiều learning outcome vào một câu | S02-B |
| Học viên gọi chức năng soạn checkpoint | ③ Ngoài phạm vi | Trả 403 và không lộ nội dung teacher-only | S03-A |
| AI trả bản nháp nhưng chưa được giảng viên duyệt | ③ Ngoài phạm vi | Không tự publish hoặc tăng số checkpoint | S03-B |
| AI chuyển trọng tâm sang learning outcome của slide trước | ④ Hậu quả domain | Đánh fail và không cho checkpoint đạt quality bar | S04-A |
| Checkpoint có nhiều đáp án hợp lý hoặc hint lộ đáp án | ④ Hậu quả domain | Đánh fail và yêu cầu giảng viên sửa hoặc tạo lại | S04-B |
| Ví dụ chứa factual claim không có trong gói ngữ cảnh hoặc mâu thuẫn slide | ④ Hậu quả domain | Đánh fail groundedness | S04-C |

Các case thường, hiếm và mapping chi tiết nằm trong `eval/golden-set.jsonl`.

## §6. Bốn đường đi của trải nghiệm

- Happy path: Giảng viên mở slide, yêu cầu gợi ý, AI soạn bản nháp, giảng viên duyệt và chỉnh sửa, lưu, kích hoạt, nhận Class Pulse, can thiệp và chạy follow-up.
- Low-confidence: Nếu slide có nhiều learning outcome, AI tạo bản nháp tập trung vào một outcome hẹp để giảng viên kiểm tra, chỉnh sửa hoặc tạo lại.
- Failure hoặc không căn cứ: Page ngoài tài liệu, slide quá ít chữ hoặc output không đạt cấu trúc trả lỗi rõ ràng và không tạo checkpoint.
- Correction: Giảng viên sửa checkpoint trong editor, tạo lại hoặc bỏ bản nháp trước khi lưu.
- Ngoài phạm vi: Role học viên không được gọi endpoint soạn checkpoint và AI không được tự publish.
- Case đặc thù domain: Checkpoint có factual claim ngoài gói ngữ cảnh, chuyển trọng tâm khỏi slide hiện tại, có nhiều đáp án đúng, hint lộ đáp án hoặc follow-up đổi learning outcome bị đánh fail trong eval.
- Tín hiệu lớp chưa đủ: Nếu participation chưa đủ, rule engine đề xuất chờ, gia hạn hoặc chạy lại thay vì kết luận lớp đã hiểu hay chưa hiểu.

## §7. Kiểm thử

- Grounded factual claims: mọi phát biểu kiến thức trong prompt, đáp án, giải thích, distractor, follow-up và ví dụ phải được đối chiếu với gói ngữ cảnh slide được backend cấp.
- Current-slide focus: prompt và follow-up phải kiểm tra learning outcome của slide hiện tại; ngữ cảnh slide trước không được trở thành nội dung kiểm tra chính.
- Diagnostic: mỗi phương án sai phải đại diện cho một misconception phân biệt được; follow-up kiểm tra lại đúng learning outcome bằng cách hỏi khác.
- Safe: checkpoint có đúng một đáp án đúng, hint không chứa hoặc diễn đạt lại trực tiếp đáp án và bản nháp không tự kích hoạt.
- Structural: output có prompt, bốn lựa chọn phân biệt được, misconception label cho từng lựa chọn sai, ba tầng hint, follow-up và ví dụ sử dụng được.
- Golden set: 20 case trong `eval/golden-set.jsonl`.
- Cơ cấu: 8 case thường, 4 case hiếm và ít nhất 2 case cho mỗi lớp chỗ khó.
- Nguồn thực tế: 10 case phát triển từ chatlog thật và 10 case từ tự dùng thử prototype.
- Quality bar đã chốt: "Đạt khi ít nhất 80% câu thử đạt và AI không được bịa kiến thức ngoài nội dung slide dù chỉ một lần."
- Điều kiện an toàn bổ sung: mỗi checkpoint có đúng một đáp án đúng và hint không tiết lộ đáp án.

| Lượt chạy | Model | Guardrail đạt | Nội dung AI đạt | Tổng đạt | Tỷ lệ | So với bar | Bằng chứng |
|---|---|---:|---:|---:|---:|---|---|
| run-01 | gemini-2.5-flash | 3/3 | 0/17 | 3/20 | 15% | Không đạt | `eval/results/run-01.jsonl` |

Ba case đạt là guardrail S01-A, S01-B và S03-A.

Không có case nội dung AI nào trong 17 case còn lại đạt toàn bộ tiêu chí ở lượt review đầu.

Nguyên nhân chính là factual claim vượt nguồn, hint gợi quá gần đáp án, follow-up đổi learning outcome và distractor chưa đủ khả năng chẩn đoán.

Kết quả `run-01` là baseline vội nhưng được giữ nguyên để bảo toàn lịch sử đo.

Human review và 20 trace gốc nằm trong `eval/human-review.json` và `eval/traces/run-01/`.

Mỗi lượt sau phải dùng review file riêng, giữ nguyên artifact các lượt trước và báo cáo đủ cả case đạt lẫn chưa đạt.

## §8. Phân công & kế hoạch

| Thành viên | Vai trò | Phần chịu trách nhiệm | Cơ sở trong repo |
|---|---|---|---|
| Nguyễn Đăng Long - 2A202601934 | Nhóm trưởng, Backend & Eval Lead | Quản lý deliverable; kết nối các bộ phận; backend, API, session và content pipeline; golden set, evaluator, human review và spec | `backend/app/routers.py`, `backend/app/store.py`, `eval/`, `spec.md` |
| Đào Minh Chiến - 2A202601184 | AI/LLM Engineer | Tích hợp model; prompt checkpoint; LLM client, cấu hình và rule engine; cải thiện prompt và chạy `run-02` | `backend/app/ai.py`, `backend/app/llm.py`, `backend/app/config.py`, `backend/app/rules.py` |
| Lương Minh Quân - 2A202601308 | Product Manager, Frontend Lead | Quyết định sản phẩm và phạm vi tính năng; điều phối triển khai; teacher flow, learner flow, frontend state và tích hợp API | `frontend/` |
| Lê Đăng Tấn - 2A202601916 | Project Manager | Phân tích đề bài và pain point; khảo sát; PRD và MVP; đề xuất thiết kế; điều phối workstream; điều phối demo cuối và dry run | `docs/problem-space/`, `docs/mvp/`, `docs/docs.md` |

### Validation CP5

| Người dùng | Vai trò thử | Trạng thái |
|---|---|---|
| Sái Hoài Nam - học viên Khóa 4 AI20K | Learner flow | Đã đồng ý tham gia buổi thử |
| Nguyễn Quang Sơn - học viên Khóa 4 AI20K | Teacher flow | Đã đồng ý tham gia buổi thử |
| Một lab coach được mời | Teacher flow và learner flow, team vận hành đầu còn lại | Đang tuyển người tham gia |

Nguyễn Đăng Long tổ chức và ghi log cho hai phiên đã có người đồng ý.

Mỗi người thực hiện một phiên khoảng 10 phút.

Log phải ghi task, điều quan sát được, quote nguyên văn, mức nghiêm trọng và câu trả lời cho ba câu hỏi: điều khó hiểu nhất, mức độ tin kết quả và khả năng dùng thật.

Mục tiêu CP5 là có ít nhất 5 mẩu feedback từ ít nhất 5 người ngoài nhóm, trong đó có Nam và Sơn.

### Multi-prototype

- Phương án 1: học viên bấm "Cần hỗ trợ", gửi ticket open text và trợ giảng xử lý từng trường hợp hoặc gộp các câu tương tự.
- Phương án 2: AI soạn checkpoint ngay trong lecture, cả lớp trả lời và giảng viên nhận Class Pulse để can thiệp rồi đo recovery.
- Trục khác biệt: phương án 1 phản ứng với nhu cầu hỗ trợ cá nhân sau khi học viên tự nhận ra mình bị kẹt; phương án 2 chủ động thu tín hiệu đại diện của toàn lớp tại thời điểm giảng viên cần quyết định tiếp tục hay giải thích lại.
- Quyết định: chọn phương án 2 vì đây là pain point xương sống ban đầu, phục vụ gần toàn bộ lớp với friction thấp và khớp prototype hiện có.

### Việc tiếp theo

1. Chiến cải thiện prompt theo hợp đồng nguồn và chạy trọn `run-02` bằng quy trình review tách riêng.
2. Long kiểm tra artifact eval, tổng hợp tỷ lệ so với quality bar và giữ nguyên `run-01`.
3. Quân rà teacher flow và learner flow theo bốn đường đi trong §6.
4. Long tổ chức validation; Tấn điều phối dry run, demo cuối và bảo đảm mỗi thành viên giải thích được phần mình phụ trách.

## §9. Changelog

| Thời điểm | Đổi gì | Vì sao |
|---|---|---|
| 30/07/2026 | Chuyển từ hỗ trợ cá nhân sang tín hiệu hiểu bài toàn lớp trong lecture | Cần giữ lát cắt trực tiếp trong một phiên học |
| 31/07/2026 | Chốt code hiện tại làm source of truth | Prototype đã có hai role, checkpoint, Class Pulse và follow-up chạy được |
| 31/07/2026 | Xác định AI decision là soạn checkpoint từ slide để giảng viên duyệt | Class Pulse và trạng thái lớp do rule engine xác định |
| 31/07/2026 | Chốt quality bar 80% và điều kiện không tạo factual claim thiếu căn cứ | Dùng làm chuẩn cố định cho mọi lượt đo |
| 31/07/2026 | Ghi nhận `run-01` đạt 3/20 | Giữ kết quả thấp trung thực và phân tích nguyên nhân |
| 31/07/2026 | Chọn checkpoint toàn lớp thay cho ticket hỗ trợ cá nhân | Phù hợp pain point ban đầu và phục vụ quyết định trong lecture |
| 31/07/2026 | Chốt slide hiện tại là mục tiêu kiểm tra và các slide trước là ngữ cảnh giới hạn | Đồng bộ spec với product flow và `slides.context_for()` |
| 31/07/2026 | Chốt phân công theo vai trò và commit history | Bảo đảm mỗi deliverable có người chịu trách nhiệm cụ thể |
