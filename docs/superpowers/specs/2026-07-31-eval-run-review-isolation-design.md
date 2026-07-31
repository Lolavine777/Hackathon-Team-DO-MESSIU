# Eval Run Review Isolation Design

## Mục tiêu

Mỗi evaluation run phải dùng human review riêng để output mới không bị chấm bằng đánh giá của `run-01`.
Teammate phải có hướng dẫn đủ rõ để sửa AI checkpoint generation, chạy local, review output và chứng minh thay đổi.

## Thiết kế

`run_eval.py` chọn review file theo thứ tự:

1. Dùng `--review-file` nếu người chạy truyền rõ đường dẫn.
2. Giữ `eval/human-review.json` cho `run-01` để không thay đổi artefact CP3.
3. Dùng `eval/reviews/<run-id>.json` cho mọi run mới.

Khi review file của run mới chưa tồn tại, evaluator tạo template với ba trường `grounded`, `diagnostic` và `safe` bằng `null`.
Evaluator không ghi đè review đã tồn tại.
Summary ghi đường dẫn review được dùng và báo `human_review_complete`.

## Handoff

`eval/IMPROVEMENT-GUIDE.md` mô tả:

- Phạm vi AI đang được cải thiện.
- Failure clusters của `run-01`.
- File code cần đọc.
- Thứ tự sửa.
- Quy trình chạy local và tạo `run-02`.
- Điều kiện để kết luận một thay đổi tốt hơn.

## Không làm trong PR này

- Không sửa hoặc ghi đè `run-01`.
- Không thay quality bar đã nộp.
- Không redesign golden set.
- Không tự động dùng LLM để chấm LLM.
- Không thay prompt hoặc hành vi sản phẩm.

## Kiểm thử

Unit tests phải chứng minh:

- `run-01` vẫn dùng review legacy.
- `run-02` mặc định dùng review riêng.
- `--review-file` luôn được ưu tiên.
- Template mới chứa đúng các case cần human review.
- Template hiện có không bị ghi đè.
