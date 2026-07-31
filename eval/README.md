# CP3 Evaluation

Thư mục này lưu bộ thử nghiệm, lần chạy đầu và bằng chứng gọi AI thật cho quyết định tạo checkpoint từ slide.

## Quyết định AI

AI quyết định learning outcome nào từ slide hiện tại nên được chuyển thành checkpoint chẩn đoán misconception để giảng viên duyệt trước khi kích hoạt cho lớp.
Model được backend deploy báo cáo là `gemini-2.5-flash`.

## Cấu trúc bộ thử nghiệm

- Tổng số: 20.
- Câu thường: 8.
- Câu hiếm: 4.
- Không có thông tin trong tài liệu: 2.
- Mơ hồ hoặc thiếu ngữ cảnh: 2.
- Ngoài phạm vi cho phép: 2.
- Sai gây hậu quả thật: 2.
- Phát triển từ chatlog thật: 10.
- Phát triển từ tự dùng thử prototype: 10.

Mỗi dòng trong `golden-set.jsonl` ghi input, hành vi bắt buộc, mã nguồn quan sát và loại tình huống.

## Chiều chất lượng

- Grounded: prompt, đáp án, giải thích, hint và ví dụ không đưa thêm kiến thức ngoài trang slide được cấp.
- Diagnostic: distractor đại diện cho misconception hợp lý và follow-up kiểm tra lại cùng learning outcome bằng cách hỏi khác.
- Safe: có đúng một đáp án đúng, hint không tiết lộ đáp án và bản nháp không tự được kích hoạt cho lớp.
- Structural: output có prompt, bốn lựa chọn phân biệt được, misconception label, ba hint cho mỗi lựa chọn sai, follow-up và ví dụ sử dụng được.

## Quality bar đã chốt

Đạt khi ít nhất 80% câu thử đạt và không có lần nào AI bịa kiến thức ngoài nội dung slide.
Mỗi checkpoint cũng phải có đúng một đáp án đúng và hint không được tiết lộ đáp án.
Quality bar này không được hạ sau lần chạy đầu.

## Kết quả lần đầu

Lần chạy `run-01` đạt 3/20, tương đương 15%.
Kết quả không đạt quality bar.
Các nguyên nhân chính là nội dung ngoài slide, hint gợi quá gần đáp án, follow-up đổi learning outcome và distractor chưa chẩn đoán tốt.

Toàn bộ 20 ca, kể cả ca không đạt, được lưu tại `results/run-01.jsonl`.
Phản hồi gốc và thông tin model của từng ca được lưu tại `traces/run-01/`.
Đánh giá thủ công được lưu tại `human-review.json`.

## Cải thiện sau baseline

Đọc `IMPROVEMENT-GUIDE.md` trước khi sửa prompt hoặc chạy model lại.
`run-01` tiếp tục dùng `human-review.json` để giữ nguyên artefact CP3.
Mỗi run mới mặc định dùng review riêng tại `reviews/<run-id>.json`.
Evaluator tự tạo review template cho run mới và không ghi đè file review đã tồn tại.

## Chạy lại

Chạy model thật:

```bash
backend/.venv/bin/python eval/run_eval.py \
  --base-url https://conner-unavailing-nonirately.ngrok-free.dev \
  --run-id run-02
```

Điền `eval/reviews/run-02.json`, sau đó áp review lên trace đã có mà không gọi model lần nữa:

```bash
backend/.venv/bin/python eval/run_eval.py \
  --base-url https://conner-unavailing-nonirately.ngrok-free.dev \
  --run-id run-02 \
  --reuse-traces
```

Summary chỉ sẵn sàng để so sánh khi `human_review_complete` bằng `true`.
