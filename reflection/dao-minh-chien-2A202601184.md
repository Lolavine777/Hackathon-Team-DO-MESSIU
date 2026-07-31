# Reflection cá nhân - Đào Minh Chiến

## 1. Tôi phụ trách phần nào và artefact nào chứng minh điều đó?

Tôi phụ trách vai trò AI/LLM Engineer: tích hợp model vào backend, xây dựng LLM client và cấu hình, thiết kế prompt sinh checkpoint, triển khai rule engine, cải thiện chất lượng đầu ra AI và thực hiện các lần chạy đánh giá. Tôi cũng phụ trách hoàn thiện slide thuyết trình 6 trang của nhóm.

Các artefact chính chứng minh phần tôi làm gồm `backend/app/llm.py`, `backend/app/config.py`, `backend/app/ai.py`, `backend/app/rules.py`, `backend/tests/test_ai_guardrails.py`, cùng kết quả và trace trong `eval/results/run-02.jsonl`, `eval/traces/run-02/`, `eval/results/run-03.jsonl` và `eval/traces/run-03/`.

Lịch sử Git cũng ghi nhận các commit của tài khoản `ChienhocIT` cho phần tích hợp LLM, question grouping theo slide, hardening guardrail và bằng chứng của các eval run.

## 2. Quyết định quan trọng nhất tôi đã tham gia là gì?

Quyết định quan trọng nhất tôi tham gia là không dựa hoàn toàn vào một prompt để tạo checkpoint, mà đặt LLM trong một pipeline có kiểm soát. Model chỉ nhận nội dung của slide hiện tại, phải trả về cấu trúc xác định, sau đó output được normalize, kiểm tra bằng rule/guardrail và sửa lại khi phát hiện lỗi trước khi đưa cho giảng viên duyệt.

Tôi chọn cách này vì checkpoint không chỉ cần đúng định dạng mà còn phải bám nguồn, có đúng một đáp án đúng, chẩn đoán được misconception và không để hint làm lộ đáp án. Việc kết hợp prompt với kiểm tra tất định giúp hệ thống vẫn giữ được khả năng sinh nội dung của AI nhưng có lớp bảo vệ cho các lỗi có thể kiểm tra bằng code.

## 3. Bằng chứng hoặc feedback nào làm tôi đổi ý?

Bằng chứng làm tôi thay đổi cách triển khai rõ nhất là kết quả `run-01`: chỉ 3/20 case đạt, tương đương 15%. Nhiều output nhìn hợp lý nhưng vẫn thêm kiến thức ngoài slide, để hint quá gần đáp án, đổi learning outcome ở follow-up hoặc tạo distractor chưa thể hiện đúng một hiểu sai cụ thể.

Từ kết quả đó, tôi chuyển trọng tâm từ việc làm cho model “sinh được câu hỏi” sang kiểm soát groundedness, diagnostic quality, safety và cấu trúc đầu ra. Tôi siết source policy về đúng slide hiện tại, yêu cầu một learning outcome xuyên suốt, bổ sung hint ba tầng theo misconception, guardrail và vòng repair. `run-02` sau thay đổi đạt 17/20 case, tương đương 85%, vượt quality bar 80% của nhóm.

Kết quả này cho tôi thấy chất lượng AI phải được chứng minh bằng golden set và trace cụ thể, không thể chỉ đánh giá qua vài output đẹp trong lúc demo.

## 4. Một lỗi hoặc giả định sai tôi phát hiện là gì?

Giả định sai của tôi là prompt càng chi tiết thì càng đủ để bảo đảm đầu ra ổn định. Thực tế, model vẫn có thể vi phạm các ràng buộc quan trọng, còn một rule viết quá rộng cũng có thể loại nhầm output hợp lệ. Vì vậy, mỗi loại lỗi cần được xử lý ở đúng lớp: prompt chịu trách nhiệm định hướng ngữ nghĩa, schema và normalization giữ cấu trúc, guardrail bắt lỗi xác định được, còn eval và review kiểm tra những tiêu chí ngữ nghĩa mà unit test không chứng minh được.

Tôi cũng nhận ra không nên đọc riêng con số 15% của `run-03` như một kết luận model đã giảm chất lượng. Summary của run này ghi 17 case chưa hoàn tất review và chỉ ba guardrail case tự động đạt; do đó đây là bằng chứng cho thấy quy trình review chưa hoàn tất, không phải một so sánh chất lượng ngang hàng với `run-02`.

## 5. Nếu có thêm thời gian, tôi sẽ ưu tiên thay đổi điều gì và vì sao?

Tôi sẽ ưu tiên hoàn tất review độc lập cho `run-03`, chạy thêm nhiều lần trên cùng golden set và so sánh theo từng failure cluster thay vì chỉ nhìn pass rate của một lần chạy. Việc này giúp tách được ba nguyên nhân: độ biến thiên của model, lỗi thật trong pipeline và kết quả thấp do review chưa hoàn tất.

Sau đó, tôi sẽ tập trung sửa ba case còn fail ở `run-02` là `N06`, `S02-A` và `S03-B`, đồng thời bổ sung regression test cho từng lỗi đã tìm thấy. Đây là hướng cải thiện trực tiếp reliability của chức năng AI cốt lõi và tạo bằng chứng thuyết phục hơn cho chất lượng sản phẩm, thay vì mở rộng thêm tính năng khi pipeline hiện tại chưa được kiểm chứng qua nhiều lần chạy.
