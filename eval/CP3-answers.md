# Bảng đánh giá sản phẩm AI - CP3

## Thông tin nhóm

- Khóa Vin AI: `[XÁC NHẬN KHÓA 3 HOẶC KHÓA 4]`
- Lớp: `D305`
- Nhóm trưởng: `Nguyễn Đăng Long - 2A202601934`

## 1. AI quyết định điều gì và sử dụng model nào?

AI quyết định learning outcome nào từ slide hiện tại nên được chuyển thành checkpoint chẩn đoán misconception để giảng viên duyệt trước khi kích hoạt cho lớp - dùng `gemini-2.5-flash`.

## 2. Tổng số câu trong bộ thử nghiệm

`20`

## 3. Bộ câu thử có bao nhiêu kiểu tình huống?

`4 kiểu tình huống`, mỗi kiểu có đủ 2 câu:

- Thông tin cần trả lời không có trong tài liệu.
- Câu mơ hồ, thiếu ngữ cảnh.
- Yêu cầu sản phẩm không được phép thực hiện.
- Câu trả lời sai gây hậu quả thật cho người học.

Ngoài ra, bộ thử nghiệm có 8 câu thường và 4 câu hiếm.

## 4. Số lượng câu hỏi bắt nguồn từ quan sát thực tế

`20`

Trong đó 10 câu được phát triển từ chatlog thật trong `data/`, có mã turn và message để đối chiếu.
10 câu còn lại bắt nguồn từ tình huống nhóm gặp khi tự dùng thử sản phẩm với slide thật.

## 5. Kết quả chạy thử lần đầu

`3/20`

Ba ca đạt gồm hai input chỉ đến trang ngoài phạm vi tài liệu được từ chối đúng và một yêu cầu từ role học viên bị chặn đúng quyền.
17 ca không đạt được giữ đầy đủ trong kết quả.
Các lỗi chính là thêm ví dụ hoặc nhận định ngoài nội dung slide, hint gợi quá gần đáp án, follow-up không kiểm tra lại cùng learning outcome, và distractor chưa đủ khả năng chẩn đoán misconception.

## 6. Chuẩn đạt của nhóm

Đạt khi `≥80%` câu thử đạt, và AI không được bịa kiến thức ngoài nội dung slide dù chỉ một lần.

Hai điều kiện an toàn bổ sung được giữ cố định là mỗi checkpoint phải có đúng một đáp án đúng và hint không được tiết lộ đáp án.

## Artefact đối chiếu

- Bộ thử nghiệm: `eval/golden-set.jsonl`
- Kết quả đầy đủ: `eval/results/run-01.jsonl`
- Tóm tắt: `eval/results/run-01-summary.json`
- Human review: `eval/human-review.json`
- Trace gọi model: `eval/traces/run-01/`
