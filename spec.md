# AI SPEC - VLearn Lecture Pulse · Nhóm `[TÊN NHÓM]` · Zone `[ZONE]`

Hướng: [x] A - VLearn  [ ] B - Trợ lý Học viên  [ ] C - Làn mở

Loại: [ ] Tối ưu tính năng có sẵn  [x] Tính năng mới

## §1. User & Job

- Job executor + workflow: Giảng viên đang dạy một phiên lecture đông người, trình bày nội dung, kích hoạt checkpoint, xem tín hiệu toàn lớp, can thiệp và kiểm tra lại.
- Core JTBD: Khi vừa trình bày xong một khái niệm quan trọng, giảng viên muốn kiểm tra nhanh mức độ hiểu của cả lớp để biết nên tiếp tục hay giải thích lại.
- Problem statement: Trong lớp đông, phần lớn người học không cung cấp tín hiệu khi chưa hiểu nên giảng viên có thể tiếp tục bài khi nhiều sinh viên đang bị bỏ lại.
- Evidence:
  - Khảo sát đợt 2 có `n=17`: 10/17 đồng ý giảng viên khó biết ai đang gặp khó khăn trong lớp đông.
  - 10/17 đồng ý từng có phần chưa hiểu nhưng giảng viên vẫn tiếp tục bài.
  - 15/17 dùng ChatGPT hoặc công cụ tương tự khi bị kẹt, làm tín hiệu hiểu bài rời khỏi phiên học.
  - 6/17 chờ ít nhất 20 phút hoặc thường không nhận được hỗ trợ.
  - Chatlog thật có 1.261 lượt hỏi đáp, nhưng trường `misconceptions` không được dùng lần nào và tutor chỉ hỏi kiểm tra lại ở 3/2.515 message.
- Quote hoặc ví dụ nguyên văn:
  - R1, Q5: `"Bỏ qua và chuyển sang phần khác, Không làm tiếp"`.
  - R1 và R10, Q6: `"Sợ câu hỏi của mình quá đơn giản"`.
  - T0649/M1149: `"tóm tắt nội dung chính trong slide này"`.
  - T1201/M2413: `"tóm tắt"`.
  - T0058/M2247: `"xem bài tập thực hành lab day 2 chiều nay ở đaau"`.
- Giới hạn bằng chứng: khảo sát tập trung nhiều vào giờ thực hành, chưa quan sát trực tiếp đủ phiên lecture có checkpoint.

Nguồn đầy đủ nằm tại `docs/problem-space/lms-du-lieu-khong-hanh-dong.md` và `data/vlearn-pack/chatlog/DATA_DICTIONARY.md`.

## §2. Impact & quyết định chọn

| Ứng viên | Mức độ | Tần suất | Impact | Tổng tham khảo | Quyết định |
|---|---:|---:|---:|---:|---|
| Phân bổ sai thời gian hỗ trợ trong lớp đông | 4 | 4 | 4 | 12 | Chọn cơ chế gốc |
| Người kẹt rời hàng đợi nên lớp trông như đang ổn | 5 | 2 | 3 | 10 | Giữ làm rủi ro cần đo |
| Cùng một lỗi phải giải thích lại nhiều lần | 2 | 4 | 3 | 9 | Giữ làm cơ hội broadcast |
| Phản hồi bài nộp đến muộn | 2 | 3 | 3 | 8 | Loại vì nằm ngoài một phiên lecture |

Ứng viên đã loại gồm chatbot tổng quát, theo dõi code trong IDE, dự đoán sinh viên yếu và hệ thống ticket hỗ trợ cá nhân đầy đủ.
Các hướng này làm lát cắt rộng hơn hoặc đòi dữ liệu và quyền truy cập chưa có.

Ứng viên được chọn là vòng phản hồi checkpoint trong lecture.
Prototype ưu tiên tạo tín hiệu đại diện cho cả lớp và giúp giảng viên quyết định hành động ngay trong phiên.

Quyết định shift theo code source of truth: AI chỉ soạn checkpoint chẩn đoán từ slide để giảng viên duyệt.
Tỷ lệ, class pulse và đề xuất can thiệp vẫn do rule engine xác định, không gán nhãn AI cho phần deterministic.

## §3. Giải pháp tương tự đã nghiên cứu

- `[PLACEHOLDER - thành viên bổ sung sản phẩm đã dùng thử 1]`: flow / đáng học / đáng né / khác biệt của nhóm.
- `[PLACEHOLDER - thành viên bổ sung sản phẩm đã dùng thử 2]`: flow / đáng học / đáng né / khác biệt của nhóm.

Phần này chưa có log dùng thử đủ để khẳng định và không được tự suy đoán.

## §4. Thiết kế

- Lát cắt một câu: Trong một phiên lecture, AI chuyển nội dung slide hiện tại thành một checkpoint chẩn đoán misconception để giảng viên duyệt và kích hoạt, giúp cả lớp phản hồi mức độ hiểu trước khi bài giảng tiếp tục.
- Non-goals:
  - Không xây chatbot trả lời mọi câu hỏi.
  - Không để AI tự xuất bản checkpoint hoặc tự dừng bài giảng.
  - Không dùng kết quả checkpoint để chấm điểm hay xếp hạng sinh viên.
  - Không dự đoán rủi ro dài hạn của từng sinh viên.
  - Không để LLM tính tỷ lệ, trạng thái class pulse hoặc recovery.
- Mức prototype nhắm tới: [ ] Sketch [ ] Mock [x] Working.
- Phần thật: gọi model, tạo checkpoint, duyệt bản nháp, vòng đời checkpoint, gửi phản hồi, class pulse, intervention, follow-up và báo cáo.
- Phần mock: roster và phản hồi của khoảng 152 sinh viên được simulator tạo; dữ liệu phiên nằm trong RAM; xác thực mới dựa trên role header.
- Automation: [x] augment [ ] conditional [ ] automate.
- Lý do: lỗi trong câu hỏi hoặc đáp án có thể làm cả lớp học sai, nên giảng viên phải duyệt trước khi kích hoạt.

### §4b. Nguyên tắc đã áp dụng

| Nguyên tắc | Áp cụ thể vào đâu trong prototype |
|---|---|
| Giải thích AI có thể làm gì | UI báo trạng thái AI và khóa nút khi model chưa cấu hình |
| Human-in-the-loop | `suggest-checkpoints` chỉ trả bản nháp; giảng viên sửa và lưu qua endpoint teacher-only |
| Cho phép sửa và từ chối | Giảng viên có thể chỉnh prompt, lựa chọn, đáp án, hint và follow-up trước khi lưu |
| Phạm vi tối thiểu | Model chỉ nhận nội dung trang hiện tại và ngữ cảnh slide giới hạn |
| Graceful degradation | Quiz, class pulse và rule engine vẫn chạy khi AI không khả dụng |
| Hiển thị bằng chứng | Class Pulse hiển thị participation, tỷ lệ đúng, phân bố lựa chọn và misconception |
| Tránh tác động không mong muốn | Kết quả trước lớp được aggregate và checkpoint mặc định không tính điểm |

## §5. Kiểu lỗi - 4 lớp chỗ khó và kịch bản

| Tình huống cụ thể | Lớp | Hành vi mong muốn | Case |
|---|---|---|---|
| Page bằng 0 | Không có trong tài liệu | Trả 422, không sinh checkpoint | S01-A |
| Page lớn hơn tổng số trang | Không có trong tài liệu | Trả 422, không bịa nội dung | S01-B |
| Trang tổng quan chứa nhiều khái niệm | Mơ hồ | Chọn một learning outcome hẹp và kiểm chứng được | S02-A |
| Trang tóm tắt có nhiều insight | Mơ hồ | Không trộn nhiều learning outcome vào một câu | S02-B |
| Học viên gọi chức năng soạn checkpoint | Ngoài phạm vi | Trả 403 và không lộ nội dung teacher-only | S03-A |
| AI trả bản nháp nhưng chưa được giảng viên duyệt | Ngoài phạm vi | Không tự publish hoặc tăng số checkpoint | S03-B |
| Sai định nghĩa nền tảng JTBD | Hậu quả domain | Chỉ dùng kiến thức trên slide và có đúng một đáp án đúng | S04-A |
| Tự thêm metric hoặc công thức | Hậu quả domain | Không thêm kiến thức ngoài slide và hint không lộ đáp án | S04-B |

Các case thường và hiếm bổ sung nằm trong `eval/golden-set.jsonl`.

## §6. Bốn đường đi của trải nghiệm

- Happy path: Giảng viên mở trang slide, yêu cầu gợi ý, xem bản nháp, chỉnh sửa, lưu, kích hoạt, nhận Class Pulse, can thiệp và chạy follow-up.
- Low-confidence: Khi participation hoặc confidence chưa đủ, rule engine báo tín hiệu chưa đủ và đề xuất chờ, gia hạn hoặc chạy lại.
- Failure hoặc không căn cứ: Page ngoài tài liệu hoặc trang không có đủ chữ trả lỗi rõ ràng và không sinh nội dung.
- Correction: Giảng viên chỉnh checkpoint trong editor hoặc bỏ bản nháp trước khi lưu.
- Ngoài phạm vi: Role học viên không được gọi endpoint soạn checkpoint và AI không được tự publish.
- Case đặc thù domain: Nếu checkpoint có nhiều đáp án đúng, bịa nội dung hoặc hint lộ đáp án, checkpoint bị đánh fail trong eval và không được coi là đạt quality bar.

## §7. Kiểm thử

- Grounded: prompt, đáp án, giải thích, hint và ví dụ không đưa thêm kiến thức ngoài trang slide được cấp.
- Diagnostic: distractor đại diện cho misconception hợp lý và follow-up kiểm tra lại cùng learning outcome bằng cách hỏi khác.
- Safe: có đúng một đáp án đúng, hint không tiết lộ đáp án và bản nháp không tự kích hoạt cho lớp.
- Structural: output có prompt, bốn lựa chọn phân biệt được, misconception label, ba hint cho mỗi lựa chọn sai, follow-up và ví dụ sử dụng được.
- Golden set: 20 case trong `eval/golden-set.jsonl`.
- Cơ cấu: 8 case thường, 4 case hiếm và 2 case cho mỗi lớp chỗ khó.
- Nguồn thực tế: 10 case phát triển từ chatlog thật và 10 case từ tự dùng thử prototype.
- Quality bar đã chốt: "Đạt khi ít nhất 80% câu thử đạt và AI không được bịa kiến thức ngoài nội dung slide dù chỉ một lần."
- Điều kiện an toàn bổ sung: mỗi checkpoint có đúng một đáp án đúng và hint không tiết lộ đáp án.

| Lượt chạy | Model | Đạt | Tỷ lệ | So với bar | Bằng chứng |
|---|---|---:|---:|---|---|
| run-01 | gemini-2.5-flash | 3/20 | 15% | Không đạt | `eval/results/run-01.jsonl` |

Ba case đạt là S01-A, S01-B và S03-A.
17 case không đạt chủ yếu do thêm nội dung ngoài slide, hint gợi quá gần đáp án, follow-up đổi learning outcome và distractor chưa đủ khả năng chẩn đoán.
Human review và 20 trace gốc được giữ trong `eval/human-review.json` và `eval/traces/run-01/`.

## §8. Phân công & kế hoạch

| Phần | Người phụ trách | Trạng thái |
|---|---|---|
| Quản lý deliverable, spec và eval | Nguyễn Đăng Long - 2A202601934 | Đang thực hiện |
| Evidence và khảo sát | `[PLACEHOLDER - tên và mã HV]` | Cần xác nhận |
| Prompt và AI checkpoint generation | `[PLACEHOLDER - tên và mã HV]` | Cần xác nhận |
| Backend và realtime | `[PLACEHOLDER - tên và mã HV]` | Cần xác nhận |
| Frontend và demo | `[PLACEHOLDER - tên và mã HV]` | Cần xác nhận |

- Willing user 1: `[PLACEHOLDER - tên/vai trò và sự đồng ý]`.
- Willing user 2: `[PLACEHOLDER - tên/vai trò và sự đồng ý]`.
- Willing user 3: `[PLACEHOLDER - tên/vai trò và sự đồng ý]`.
- Kế hoạch validation: mỗi người dùng thử một phiên 10 phút; ghi task, quan sát, quote nguyên văn và mức nghiêm trọng trong `validation/`.
- Ba câu hỏi bắt buộc: điều khó hiểu nhất, mức độ tin kết quả và khả năng dùng thật.
- Multi-prototype: `[PLACEHOLDER - ghi phương án đã so sánh hoặc lý do không thực hiện]`.

## §9. Changelog

| Thời điểm | Đổi gì | Vì sao |
|---|---|---|
| 30/07/2026 | Chuyển từ hỗ trợ cá nhân sang tín hiệu hiểu bài toàn lớp trong lecture | Cần giữ lát cắt trực tiếp trong một phiên học |
| 31/07/2026 | Chốt code hiện tại làm source of truth | Prototype đã có hai role, checkpoint, class pulse và follow-up chạy được |
| 31/07/2026 | Xác định AI decision là soạn checkpoint từ slide | Class pulse và trạng thái lớp hiện do rule engine, không phải AI |
| 31/07/2026 | Chốt quality bar 80% và điều kiện không bịa ngoài slide | Dùng làm chuẩn cố định trước khi diễn giải kết quả |
| 31/07/2026 | Ghi nhận run-01 đạt 3/20 | Giữ kết quả thấp trung thực và phân tích nguyên nhân |
