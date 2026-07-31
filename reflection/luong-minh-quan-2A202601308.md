# Reflection cá nhân - Lương Minh Quân

## 1. Tôi phụ trách phần nào và artefact nào chứng minh điều đó?

Tôi phụ trách quyết định sản phẩm và frontend, gồm teacher flow, learner flow, trạng thái phiên học, tích hợp API và cách Class Pulse được hiển thị cho từng vai trò.

Các artefact chính là toàn bộ thư mục `codebase/frontend/`, đặc biệt các trang `TeacherPage.jsx`, `LearnerPage.jsx`, các component checkpoint, Pulse và các state hook kết nối với API.

Tôi cũng rà soát flow end-to-end để bảo đảm giảng viên có thể mở checkpoint, học viên trả lời, rồi teacher đọc được tín hiệu để can thiệp.

## 2. Quyết định quan trọng nhất tôi đã tham gia là gì?

Quyết định quan trọng nhất là giữ sản phẩm trong flow VLearn gồm hai vai trò rõ ràng, thay vì biến nó thành một chatbot hoặc một trang quiz độc lập.

Teacher phải chủ động duyệt và kích hoạt checkpoint, learner phản hồi ngay trong phiên học, còn Class Pulse giúp teacher nhìn được tín hiệu tổng hợp và chọn can thiệp.

Điều này bảo vệ mục tiêu giảm friction khi phản hồi mà vẫn giữ quyền kiểm soát lớp cho giảng viên.

## 3. Bằng chứng hoặc feedback nào làm tôi đổi ý?

Nguyễn Quang Sơn nói rằng việc hỏi hỗ trợ kiến thức làm người học đỡ áp lực hơn so với phải giơ tay hoặc xung phong phát biểu.

Ngược lại, Sái Hoài Nam chỉ ra rằng một số trạng thái và nút chưa đủ rõ, còn các lượt mô phỏng cho thấy learner có thể không biết phải chờ gì khi teacher chưa mở checkpoint.

Vì vậy nhóm giữ learner Pulse, teacher activation và Class Pulse, nhưng bổ sung hướng dẫn trong demo về checkpoint mẫu ở trang 1-3 và ý nghĩa của ba trạng thái Pulse.

## 4. Một lỗi hoặc giả định sai tôi phát hiện là gì?

Tôi từng giả định rằng khi người dùng nhìn thấy màn hình thì họ sẽ tự hiểu trạng thái hiện tại của phiên học.

Validation cho thấy điều đó không đúng: một learner vào trước khi checkpoint được kích hoạt có thể tưởng hệ thống không hoạt động, còn teacher có thể không biết trang nào đã có checkpoint mẫu.

Bài học là UI realtime vẫn cần trạng thái chờ, hướng dẫn và hành động tiếp theo thật rõ, đặc biệt khi người dùng không có người đứng cạnh giải thích.

## 5. Nếu có thêm thời gian, tôi sẽ ưu tiên thay đổi điều gì và vì sao?

Tôi sẽ ưu tiên làm rõ empty state và waiting state cho learner, đồng thời hiển thị rõ checkpoint nào đang có sẵn trên slide hiện tại cho teacher.

Sau đó tôi sẽ cho phép teacher tạo hoặc yêu cầu AI gợi ý checkpoint ngay tại slide đang xem.

Hai thay đổi này giải quyết trực tiếp friction đã quan sát được mà không làm thay đổi lát cắt sản phẩm hoặc biến prototype thành một hệ thống khác.
