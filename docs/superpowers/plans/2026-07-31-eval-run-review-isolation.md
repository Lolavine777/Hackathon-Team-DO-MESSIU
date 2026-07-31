# Eval Run Review Isolation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Ngăn evaluator tái dùng human review của run cũ và cung cấp hướng dẫn đủ rõ để teammate cải thiện AI checkpoint generation.

**Architecture:** Giữ runner hiện tại và thêm hai helper thuần cho việc chọn review path và tạo template.
Run đầu thu raw trace, tạo review template riêng, sau đó teammate điền review và dùng `--reuse-traces` để tính lại mà không gọi model.

**Tech Stack:** Python 3.12 standard library, unittest, Markdown.

## Global Constraints

- Không thay đổi `run-01` hoặc quality bar đã nộp.
- Không thêm dependency.
- Mỗi run mới dùng review file riêng.
- Không ghi đè human review hiện có.
- Mỗi câu đầy đủ trong Markdown nằm trên một dòng vật lý.

---

### Task 1: Review isolation

**Files:**
- Modify: `eval/test_eval_runner.py`
- Modify: `eval/run_eval.py`

**Interfaces:**
- Produces: `resolve_review_path(run_id: str, explicit: Path | None, root: Path) -> Path`
- Produces: `write_review_template(path: Path, results: list[dict]) -> bool`

- [x] Viết unit tests cho legacy run, run mới, explicit path và bảo vệ file review hiện có.
- [x] Chạy tests và xác nhận fail vì helper chưa tồn tại.
- [x] Cài đặt hai helper tối thiểu.
- [x] Tích hợp helper vào `main()`.
- [x] Chạy toàn bộ `eval/test_eval_runner.py` và xác nhận pass.

### Task 2: Teammate handoff

**Files:**
- Create: `eval/IMPROVEMENT-GUIDE.md`
- Modify: `eval/README.md`

**Interfaces:**
- Consumes: runner đã hỗ trợ review theo run.
- Produces: quy trình local `run-02` có thể thực hiện mà không cần đoán.

- [x] Ghi failure clusters và file code cần đọc.
- [x] Ghi lệnh collect, review, reuse và so sánh kết quả.
- [x] Ghi rõ các test chưa tự động đánh giá được.
- [x] Chạy unit tests, backend compile, frontend build và secret scan.
- [x] Commit implementation và chuẩn bị PR.
