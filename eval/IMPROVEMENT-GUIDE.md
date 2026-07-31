# Handoff cải thiện AI checkpoint generation

## Phạm vi cần cải thiện

AI đang được đánh giá là phần tạo checkpoint từ nội dung slide qua `POST /api/ai/suggest-checkpoints`.
Không thay rule engine, Class Pulse, aggregation hoặc kết quả `run-01`.

Code chính cần đọc:

- `backend/app/ai.py`: prompt và normalization của checkpoint.
- `backend/app/slides.py`: context slide được gửi vào model.
- `backend/app/llm.py`: lời gọi model.
- `eval/golden-set.jsonl`: 20 case baseline.
- `eval/human-review.json`: review đã chốt cho `run-01`.
- `eval/traces/run-01/`: request và raw response của lần chạy đầu.

## Baseline phải giữ nguyên

- Model: `gemini-2.5-flash`.
- Kết quả CP3: 3/20.
- Content generation: không có output nào trong 17 output AI đạt toàn bộ human review.
- Guardrail đạt: S01-A, S01-B và S03-A.
- Quality bar: ít nhất 80% và không bịa kiến thức ngoài slide dù chỉ một lần.

Không sửa, xóa hoặc ghi đè `run-01`.
Mọi lần cải thiện phải dùng run ID mới.
Evaluator từ chối gọi model lại nếu run ID đã có trace.
Muốn áp review lên output đã có phải dùng `--reuse-traces`.

## Failure clusters của run-01

### Grounding

- Model thêm ví dụ hoặc nhận định không có trong source được reviewer thấy.
- Một số output dùng nội dung từ trang khác.
- Trang chỉ có CTA vẫn sinh checkpoint JTBD.
- Trace hiện chỉ lưu excerpt trang hiện tại, trong khi backend có thể gửi thêm context trang trước.

### Hint leakage

- Hint không chứa nguyên văn đáp án nhưng diễn giải gần như đúng đáp án.
- Structural scorer hiện chưa bắt được semantic leakage.

### Diagnostic quality

- Distractor là câu đảo ngược hoặc quá vô lý.
- Misconception label có mặt nhưng distractor chưa phản ánh một hiểu sai thực tế.
- Learning outcome và prompt đôi khi đo hai ý gần nhau nhưng không giống nhau.

### Follow-up

- Một số follow-up chỉ có hai hoặc ba lựa chọn.
- Một số output không có follow-up.
- Một số follow-up chuyển sang learning outcome khác.
- Một số follow-up tái sử dụng thông tin đã lộ trong câu chính.

## Thứ tự sửa đề xuất

1. Làm rõ source policy trong prompt và không thêm factual claim ngoài context.
2. Buộc learning outcome, prompt, explanation và follow-up cùng đo một khái niệm.
3. Buộc follow-up có đúng bốn lựa chọn và đúng một đáp án đúng.
4. Yêu cầu mỗi distractor đại diện cho một misconception cụ thể.
5. Cấm hint chứa đáp án hoặc paraphrase trực tiếp đáp án.
6. Chốt chính sách example mới và ghi rõ trong prompt.
7. Chỉ sau đó mới tối ưu văn phong hoặc độ đa dạng.

## Quy trình làm việc

### 1. Chạy test trước khi sửa

```bash
backend/.venv/bin/python -m unittest eval/test_eval_runner.py -v
```

### 2. Chạy backend local với model đã cấu hình

```bash
cd backend
.venv/bin/python -m uvicorn app.main:app --reload
```

### 3. Sửa prompt hoặc normalization

Ưu tiên thay đổi nhỏ trong `backend/app/ai.py`.
Không đổi quality bar hoặc expected result để làm điểm cao hơn.

### 4. Thu output mới

```bash
backend/.venv/bin/python eval/run_eval.py \
  --base-url http://127.0.0.1:8000 \
  --run-id run-02
```

Lệnh này tạo:

- `eval/results/run-02.jsonl`
- `eval/results/run-02-summary.json`
- `eval/traces/run-02/*.json`
- `eval/reviews/run-02.json`

Review template mới có giá trị `null`.
Không copy đánh giá từ `run-01`.

### 5. Review output mới

Đọc từng trace trong `eval/traces/run-02/`.
Điền `grounded`, `diagnostic`, `safe` và `notes` trong `eval/reviews/run-02.json`.

Mỗi trường chỉ được đặt `true` khi reviewer có thể chỉ ra bằng chứng:

- `grounded`: mọi factual claim truy được về context hợp lệ.
- `diagnostic`: distractor và follow-up đo đúng misconception và learning outcome.
- `safe`: đúng một đáp án, hint không lộ đáp án và bản nháp không tự publish.

### 6. Áp review mà không gọi model lại

```bash
backend/.venv/bin/python eval/run_eval.py \
  --base-url http://127.0.0.1:8000 \
  --run-id run-02 \
  --reuse-traces
```

Summary chỉ được dùng khi `human_review_complete` là `true`.

### 7. So sánh với baseline

Không chỉ so tổng `3/20`.
Tách rõ:

- Guardrail có tiếp tục đạt không.
- Bao nhiêu output AI content đạt.
- Có vi phạm điều kiện không bịa ngoài slide không.
- Failure cluster nào giảm và failure cluster nào còn nguyên.

## Những gì test tự động chưa chứng minh

Unit tests không chứng minh semantic grounding, chất lượng misconception, semantic hint leakage hoặc giá trị sư phạm.
Mỗi run mới vẫn cần human review.
Nếu hai reviewer chấm khác nhau, cần làm rõ rubric trước khi kết luận model tốt hơn.

## Definition of done cho một vòng cải thiện

- Test suite pass.
- Run mới có 20 result và 20 trace.
- Review file riêng cho run mới đã hoàn tất.
- Không ghi đè bất kỳ artefact nào của run trước.
- Guardrail cũ không regression.
- Content-generation pass tăng mà không hạ quality bar.
- Thay đổi prompt được giải thích bằng failure cluster cụ thể.
