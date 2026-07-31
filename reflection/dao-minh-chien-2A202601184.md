# Reflection cá nhân - Đào Minh Chiến

## 1. Tôi phụ trách phần nào và artefact nào chứng minh điều đó?

Tôi phụ trách phần AI/LLM của sản phẩm, gồm tích hợp model, prompt sinh checkpoint, cấu hình LLM, rule engine liên quan đến guardrail và vòng cải thiện chất lượng AI.

Các artefact thể hiện phần này là `backend/app/ai.py`, `backend/app/llm.py`, `backend/app/config.py`, `backend/app/rules.py`, cùng các trace và kết quả trong `eval/`.

Tôi cũng phụ trách hoàn thiện nội dung slide demo và giải thích cách AI tạo bản nháp để giảng viên kiểm duyệt.

## 2. Quyết định quan trọng nhất tôi đã tham gia là gì?

Quyết định quan trọng nhất là không coi việc model sinh ra một câu hỏi là đủ, mà phải kiểm tra cả nguồn, cấu trúc, misconception, hint và follow-up trước khi trả bản nháp.

Vì vậy AI chỉ được đề xuất checkpoint từ slide hiện tại, còn rule engine kiểm tra đầu ra và giảng viên vẫn phải duyệt trước khi kích hoạt cho lớp.

## 3. Bằng chứng hoặc feedback nào làm tôi đổi ý?

Run-01 đạt 3/20 và cho thấy nhiều lỗi không thể nhìn thấy nếu chỉ đọc nhanh một output: ví dụ được tự thêm, hint gần như chỉ đáp án, follow-up đổi learning outcome và có output thiếu lựa chọn hợp lệ.

Từ đó tôi chuyển trọng tâm sang prompt có nguồn duy nhất, normalization đầu ra, phát hiện hint leakage và vòng repair có phản hồi lỗi cụ thể.

Run-02 đạt 17/20, tương đương 85%, cho thấy các guardrail đã cải thiện đáng kể chất lượng, dù ba case N06, S02-A và S03-B vẫn cần xử lý tiếp.

## 4. Một lỗi hoặc giả định sai tôi phát hiện là gì?

Giả định sai của tôi là nếu câu hỏi chính có vẻ đúng thì follow-up và các hint còn lại có thể được xem là ổn theo mặc định.

Thực tế follow-up có thể kiểm tra một learning outcome khác, còn hint có thể vô tình tiết lộ đáp án dù câu hỏi chính vẫn hợp lý.

Tôi cũng nhận ra review do AI thực hiện không thể được trình bày như đánh giá độc lập, nên provenance của `reviews/run-02.json` phải được nói rõ khi demo.

## 5. Nếu có thêm thời gian, tôi sẽ ưu tiên thay đổi điều gì và vì sao?

Tôi sẽ ưu tiên thiết kế lại cách tạo follow-up để nó kiểm tra cùng learning outcome bằng một biểu đạt khác, thay vì chỉ lọc các lựa chọn trùng với câu chính.

Sau đó tôi sẽ thêm một vòng review độc lập của con người cho các case mà guardrail còn cảnh báo.

Đây là cách giảm rủi ro AI tạo ra một checkpoint trông hoàn chỉnh nhưng không thực sự đo được misconception của người học.
