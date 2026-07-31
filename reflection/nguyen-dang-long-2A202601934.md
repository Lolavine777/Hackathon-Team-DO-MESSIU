# Reflection cá nhân - Nguyễn Đăng Long

## 1. Tôi phụ trách phần nào và artefact nào chứng minh điều đó?

Tôi là nhóm trưởng và phụ trách backend, API, session/content pipeline, eval và quản lý deliverable.

Các artefact chính chứng minh phần tôi làm gồm `backend/app/routers.py`, `backend/app/store.py`, `backend/app/content.py`, `eval/`, `spec.md` và các báo cáo CP3, CP4, CP5 trong repo.

Tôi cũng kết nối các workstream để thống nhất lát cắt sản phẩm, quality bar, validation log và nội dung demo cuối.

## 2. Quyết định quan trọng nhất tôi đã tham gia là gì?

Quyết định quan trọng nhất là chốt AI chỉ tạo bản nháp checkpoint chẩn đoán từ đúng slide hiện tại để giảng viên duyệt trước khi kích hoạt, thay vì xây một chatbot tổng quát hoặc để AI tự quyết định trạng thái của cả lớp.

Quyết định này giữ cho sản phẩm bám vào pain point là giảng viên thiếu tín hiệu hiểu bài trong lecture, đồng thời giữ human-in-the-loop vì câu hỏi, đáp án và hint sai có thể làm cả lớp học sai.

## 3. Bằng chứng hoặc feedback nào làm tôi đổi ý?

Kết quả eval lần đầu chỉ đạt 3/20, tương đương 15%, vì model đưa thêm nội dung ngoài slide, hint có thể làm lộ đáp án và follow-up đôi khi đổi learning outcome.

Điều này khiến tôi đổi cách nhìn từ việc chỉ kiểm tra AI có sinh được câu hỏi hay không sang kiểm tra groundedness, diagnostic quality, safety và cấu trúc đầu ra bằng golden set có đủ bốn lớp tình huống khó.

Sau khi siết nguồn về đúng slide, bổ sung guardrail và vòng repair, run-02 đạt 17/20, tương đương 85%, trên quality bar đã chốt là ít nhất 80% và không được bịa kiến thức ngoài slide.

Feedback của Sái Hoài Nam rằng một số trạng thái và nút chưa rõ cũng khiến nhóm bổ sung hướng dẫn rõ hơn cho checkpoint mẫu và ba trạng thái Pulse trong kịch bản demo.

## 4. Một lỗi hoặc giả định sai tôi phát hiện là gì?

Giả định sai lớn nhất của tôi là một flow đã bấm được và một câu hỏi nhìn hợp lý thì có thể xem là chất lượng đủ tốt.

Run-01 cho thấy output nhìn có vẻ hoàn chỉnh vẫn có thể dùng ví dụ không có trong slide, tạo hint quá gần đáp án hoặc hỏi follow-up sang khái niệm khác.

Tôi cũng nhận ra việc dùng số liệu hoặc review mà không ghi rõ provenance sẽ làm giảm khả năng kiểm chứng, nên repo đã giữ nguyên toàn bộ run-01, tách review run-02 và ghi rõ review run-02 do AI thực hiện.

## 5. Nếu có thêm thời gian, tôi sẽ ưu tiên thay đổi điều gì và vì sao?

Tôi sẽ ưu tiên một vòng review độc lập cho run-02 bởi người trong nhóm không tham gia sửa prompt, sau đó cải thiện ba case còn fail là N06, S02-A và S03-B.

Về sản phẩm, tôi sẽ ưu tiên cho phép giảng viên tạo hoặc yêu cầu AI gợi ý checkpoint ngay tại slide đang xem, đồng thời làm rõ trạng thái chờ của learner khi slide chưa có checkpoint.

Hai thay đổi này vừa xử lý failure còn lại của eval, vừa giải quyết trực tiếp friction mà người dùng đã nêu trong validation, thay vì mở rộng sang các tính năng ngoài lát cắt hiện tại.
