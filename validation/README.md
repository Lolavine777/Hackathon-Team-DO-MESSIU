# Validation log

Mỗi người thử thực hiện một task thật trong khoảng 10 phút.
Người quan sát không thuyết minh hoặc gợi ý trong lúc thử.
Không điền dữ liệu giả vào bảng này.

## Task dùng thử

Giảng viên mở một slide, yêu cầu AI gợi ý checkpoint, chỉnh và lưu bản nháp, kích hoạt cho lớp, đọc Class Pulse, chọn một can thiệp và chạy follow-up.

## Log

| Người thử và vai trò | Willing user | Task | Quan sát hành vi | Quote nguyên văn | Mức nghiêm trọng |
|---|---|---|---|---|---|
| Sái Hoài Nam - học viên AI20K | Có, đã đồng ý thử | Chưa chạy | Chờ phiên test thật | Chưa có | Chưa đánh giá |
| Nguyễn Quang Sơn - học viên AI20K | Có, đã đồng ý thử | Chưa chạy | Chờ phiên test thật | Chưa có | Chưa đánh giá |
| Lab coach được mời | Đang mời | Chưa chạy | Chờ phiên test thật | Chưa có | Chưa đánh giá |
| AI mô phỏng - học viên ít chủ động | Không phải người thật; lượt kiểm tra khách quan bổ sung | Đăng xuất, chọn Học viên, vào lớp, nhận checkpoint đang mở, chọn đáp án và gửi Pulse | Role chooser dễ hiểu; checkpoint hiển thị rõ khi teacher mở. Điểm gây friction là learner vào lúc slide hiện tại chưa có checkpoint thì chỉ thấy trạng thái chờ và phải hiểu rằng teacher cần kích hoạt trước | “Em biết phải bấm chọn đáp án khi checkpoint mở, nhưng nếu vào lúc chưa mở thì em không biết mình cần chờ hay chuyển slide.” | Vừa |
| AI mô phỏng - lab coach | Không phải người thật; lượt kiểm tra khách quan bổ sung | Đăng xuất, chọn Giảng viên, chuyển tới slide có checkpoint, kích hoạt cho cả lớp, đọc trạng thái realtime | Flow activation và Class Pulse đi được từ đầu đến cuối. Teacher phải chuyển đúng tới trang 1-3 mới thấy checkpoint đã soạn sẵn; trạng thái “trang này chưa có checkpoint” có thể làm người mới tưởng AI không hoạt động | “Tôi cần một chỉ dẫn rõ hơn về trang nào có checkpoint trước khi bắt đầu demo, nếu không sẽ tưởng là hệ thống chưa tạo được câu hỏi.” | Vừa |

## Ba câu hỏi sau mỗi phiên

1. Điều gì khó hiểu hoặc khó chịu nhất?
2. Bạn có tin kết quả này không, và vì sao?
3. Bạn có dùng thật không, và vì sao hoặc vì sao chưa?

## Tổng hợp

- Snapshot hiện có 2 lượt AI mô phỏng và 3 lượt người thật đang chờ thực hiện.
- Chủ đề lặp trong lượt mô phỏng: cần chỉ dẫn rõ khi slide hiện tại chưa có checkpoint.
- Thay đổi cần làm trước demo: thêm câu hướng dẫn ở teacher flow, nêu rõ checkpoint mẫu nằm ở trang 1-3 và teacher cần kích hoạt trước khi learner trả lời.
- Điều giữ nguyên và lý do: giữ role chooser, learner Pulse, teacher activation và Class Pulse vì các flow này đã đi được end-to-end trong smoke test.
- Điều đưa vào backlog: cho phép teacher tạo hoặc yêu cầu AI gợi ý checkpoint ngay tại slide đang xem, thay vì chỉ dùng checkpoint gắn sẵn.

## Ghi chú phương pháp

Hai lượt AI mô phỏng được ghi rõ để phân biệt với feedback người thật.

Các câu trong hai dòng này là quote mô phỏng từ persona, không phải lời nói của Nam, Sơn hoặc lab coach.

Ba lượt người thật vẫn phải được chạy và ghi nguyên văn trước khi nộp CP5.
