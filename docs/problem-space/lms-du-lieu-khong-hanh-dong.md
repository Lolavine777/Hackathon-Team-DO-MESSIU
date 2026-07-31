<!-- Khung tài liệu problem-space. Copy nguyên file này khi mở một vấn đề mới.
     Thứ tự các mục CHÍNH LÀ cơ chế: mục 0 phải có trên đĩa trước khi agent nói
     bất cứ điều gì về vấn đề, và mục 8 không phải sản phẩm của tài liệu này. -->

# LMS lưu dữ liệu nhưng không thành hành động

> Quy mô: `một tính năng` · Sàn Discover: `5` nỗi đau / `2` nhóm chịu đau

> Snapshot chính thức dùng cho CP4: 31 phản hồi học viên đầu tiên trong `servey_learner.txt`.
> Các mục `n=6` và `n=17` bên dưới là lịch sử các vòng phân tích trước, không phải mẫu số dùng trong `spec.md` hoặc biểu mẫu CP4.
> Trên snapshot CP4, 19/31 (61,3%) đồng ý giảng viên khó biết ai đang gặp khó khăn trong lớp đông, 17/31 (54,8%) từng chưa hiểu nhưng giảng viên vẫn tiếp tục bài và 27/31 (87,1%) dùng ChatGPT hoặc công cụ AI khác khi bị kẹt.

## 0. Nguyên văn ✅

<!-- Người dùng viết. Nguyên văn — không sửa, không diễn đạt lại, không bình luận.
     Ghi TRƯỚC khi agent nói bất cứ điều gì về vấn đề. Không bao giờ sửa lại mục này. -->

**Ngày giờ:** 2026-07-30

**Vấn đề, theo đúng lời người dùng:**

> Điều gì đang sai?
> LMS chỉ lưu dữ liệu (điểm, quiz, tiến độ, log) nhưng không phân tích để đưa ra hành động.
> Giảng viên phải tự xem nhiều báo cáo, khó phát hiện vấn đề kịp thời.
>
> Điều gì đang thiếu?
> Thiếu khả năng phát hiện sớm sinh viên hoặc cả lớp đang gặp khó khăn.
> Thiếu feedback và gợi ý cá nhân hóa ngay trong quá trình học.
> Thiếu insight giúp giảng viên biết nên can thiệp vào đâu.
>
> Điều gì đang gây đau?
> 👨‍🏫 Giảng viên
>
> Không biết ai cần hỗ trợ trước.
> Mất nhiều thời gian theo dõi và chấm bài.
> Chỉ phát hiện sinh viên yếu khi đã quá muộn.
>
> 👨‍🎓 Sinh viên
>
> Không biết mình yếu ở đâu và nên học gì tiếp.
> Feedback chậm, ít tương tác, dễ mất động lực.
>
> 🏫 Nhà trường
>
> Khó xác định nguyên nhân khiến kết quả học tập hoặc tỷ lệ bỏ học giảm/tăng.
> Thiếu dữ liệu phân tích để cải thiện chương trình và chất lượng giảng dạy.

**Cách người dùng mô tả việc muốn làm, khi gọi skill này (nguyên văn):**

> Tích hợp một AI Teaching Assistant vào LMS để phân tích dữ liệu học tập theo thời gian thực (tiến độ, kết quả quiz, số lần nộp bài, lỗi thường gặp và mức độ tương tác). AI sẽ tự động phát hiện sinh viên hoặc cả lớp đang gặp khó khăn, đưa ra gợi ý can thiệp cho giảng viên và cung cấp hint cá nhân hóa cho sinh viên, giúp tăng tính tương tác mà không thay đổi quy trình giảng dạy hiện có.

**Những giải pháp người dùng đã nghĩ tới trước khi mở tài liệu này** (kể cả cái họ đến đây để làm):

1. AI Teaching Assistant tích hợp trực tiếp vào LMS.
2. Cảnh báo giảng viên khi cả lớp gặp khó ở cùng một chủ đề.
3. AI/giảng viên tạo quiz/poll ôn tập/hỏi đáp thích ứng.
4. AI chấm sơ bộ (quiz và open text field), trợ giảng duyệt trước khi trả kết quả.
5. Hệ thống badge/gamification để cộng điểm.

## 1. Bối cảnh & vì sao lúc này ✅

**Ai chịu ảnh hưởng.** Sinh viên trong một lớp có phần hỏi–đáp trực tiếp, đồng bộ (giảng viên hỏi cả lớp tại chỗ). Giảng viên của lớp đó. Nhà trường — nêu ở mục 0 nhưng tới lúc này chưa có nguồn nào ngoài suy đoán.

**Chuyện gì đang diễn ra.** Hai chuyện khác nhau về bản chất, và mục 0 gộp chúng làm một:

- **(a) Thiếu phân tích.** LMS lưu điểm/quiz/tiến độ/log nhưng không biến chúng thành hành động; giảng viên phải tự đọc nhiều báo cáo. Nguồn: chỉ có lời người dùng, chưa mở LMS nào ra kiểm — nhãn `assumed`.
- **(b) Im lặng có chủ ý.** Sinh viên *biết* mình đang không hiểu nhưng chọn không nêu ra, vì kênh hỏi là công khai và đồng bộ. Thắc mắc không biến mất — nó chuyển sang kênh khác mà giảng viên không thấy. Nguồn: người dùng, ngôi thứ nhất, có mốc thời gian — nhãn `reported`.

(b) không phải hệ quả của (a). Phát hiện sớm không chữa được sự ngại; nếu hệ thống nêu tên sinh viên cho giảng viên, rào cản xã hội có thể tăng chứ không giảm. Đây là điểm rẽ quan trọng nhất của mục này.

**Vì sao lúc này.** Sự kiện gần nhất xảy ra trong ngày mở tài liệu.

**Sự kiện có ngày tháng:** 30/07/2026, buổi sáng, môn **Ứng dụng AI**. Giảng viên hỏi cả lớp có thắc mắc gì không. Người dùng có thắc mắc và không nêu ra. Nguồn: chính người dùng (`reported`).

> Cảnh báo về cách lấy được dữ kiện này: chi tiết "giảng viên hỏi cả lớp" và "sau đó tự tra / hỏi ChatGPT" xuất phát từ **câu đoán của agent** và người dùng xác nhận "đúng", chứ không phải người dùng tự kể ra. Đó là câu hỏi dẫn. Phần lõi (ngại không trả lời, sáng nay, môn Ứng dụng AI) do người dùng nói; phần bối cảnh xung quanh cần hỏi lại không dẫn dắt trước khi được tính là bằng chứng.

**Bóc hết jargon thì còn lại cơ chế kiểm được nào.** Bỏ hết "AI Teaching Assistant", "phân tích thời gian thực", "hint cá nhân hoá", "tăng tương tác":

- **Cơ chế B (từ (b)) — kiểm được, chưa kiểm.** Trong một buổi học, số thắc mắc được nêu công khai nhỏ hơn số thắc mắc thật sự tồn tại trong đầu sinh viên. Phép kiểm: cùng một buổi, đếm số câu hỏi nêu ra tại lớp, rồi thu phiếu ẩn danh cuối giờ hỏi "bạn có thắc mắc gì mà không nói ra không, là gì". Hai con số lệch nhau là quan sát được, và độ lệch là đại lượng đo được.
- **Cơ chế A (từ (a)) — kiểm được, chưa kiểm.** Thời điểm dữ liệu trong LMS đã đủ để nhận ra một sinh viên đang tụt lại sớm hơn thời điểm giảng viên thật sự nhận ra. Phép kiểm cần: log LMS thật + thời điểm giảng viên can thiệp thật. Hiện không có quyền truy cập dữ liệu nào — nên đây vẫn là giả định.

**Ràng buộc bằng chứng của cả tài liệu:** không có LMS thật, không có dữ liệu thật (người dùng xác nhận 30/07/2026). Trần nhãn cho mọi dòng ở mục 3 là `reported`; không có dòng `observed` nào từ dữ liệu hệ thống.

## 2. Phạm vi — IS / IS NOT ✅

**Nhóm được chọn (phạm vi 3):** cặp *sinh viên im lặng* × *giảng viên của lớp đó*, trong một môn có hỏi–đáp đồng bộ tại lớp. Chọn cặp vì bộ lọc `Tangible` đòi chi phí phải được cảm nhận bởi **người ra quyết định** — sinh viên cảm được nhưng không quyết, giảng viên quyết nhưng có thể không cảm được. Thiếu một trong hai thì không kiểm được bộ lọc đó.

**Dòng bắt buộc:** không phải **sinh viên chủ động đặt câu hỏi**, dù nhóm đó dễ tiếp cận hơn nhiều.

Cái bẫy ở đây sắc hơn thường lệ và cần ghi lại: nhóm cần nghe nhất (người im lặng) **định nghĩa đã** là nhóm ít trả lời phỏng vấn nhất; nhóm dễ hỏi nhất (bạn hay phát biểu, bạn cùng nhóm project) là nhóm **không** mang nỗi đau này. Mọi bằng chứng thu được đều phải trả lời: người này im lặng hay chủ động?

**Điều kiện sửa phạm vi** (viết trước, để một thay đổi thành quyết định chứ không thành trôi): chỉ đổi nhóm khi một trong hai điều sau xảy ra, và phải ghi lại như một quyết định có ngày:
- Phỏng vấn được ≥1 giảng viên và họ nói mất tín hiệu không phải mất mát đối với họ → phạm vi chuyển về sinh viên đơn lẻ, và kết luận nghiêng về `KHÔNG ĐÁNG GIẢI`.
- Phát hiện nhóm im lặng gần như không tồn tại trong lớp cụ thể này (đa số vẫn hỏi công khai) → sự kiện 30/07 là ngoại lệ cá nhân, không phải nhóm.

**Ràng buộc thời gian / nguồn lực.** Project môn học, một sinh viên. Không có quyền truy cập dữ liệu LMS. Nguồn phỏng vấn khả thi: bạn cùng lớp, giảng viên môn Ứng dụng AI. Không có ngân sách.

**Ràng buộc cứng do người dùng nêu (30/07/2026):** *"không thể tăng số lượng nguồn lực"* — không thêm giảng viên, không thêm trợ giảng, không giảm số sinh viên mỗi lớp.

Hệ quả bắt buộc phải ghi: ràng buộc này **loại bỏ toàn bộ nhóm giải pháp tăng cung**, và vì thế nó **đổi bản chất vấn đề từ thiếu cung thành phân bổ sai cung**. Tổng thời gian hỗ trợ trong một buổi lab là hằng số; câu hỏi không còn là "làm sao có thêm", mà là "hằng số đó hiện đang được chia theo quy tắc nào, và quy tắc đó có đưa nó tới đúng người không".

### Nhánh: đây là SAI LỆCH, không phải mong muốn suông

Có trạng thái trước để so: trước khi tồn tại một chatbot đủ tốt để giải quyết trọn một thắc mắc về nội dung, thắc mắc của sinh viên chỉ có ba đường — hỏi giảng viên, hỏi bạn, hoặc bỏ. Hai trong ba đường đó để lại dấu vết mà giảng viên thấy được. Đường thứ tư hiện nay không để lại dấu vết nào. Nên lưới có chỗ bám.

| | IS | IS NOT — cái gì lẽ ra cũng bị mà lại không? |
|---|---|---|
| **What** | Thắc mắc **về nội dung bài học** không đi vào kênh lớp/LMS; được giải quyết ở kênh ngoài, không để lại dấu vết | Thắc mắc **hành chính** (deadline, định dạng nộp, thắc mắc điểm, quy định môn) — vẫn được hỏi giảng viên, vì kênh ngoài không trả lời được. *Kiểm được, chưa kiểm.* |
| **Where** | Lớp có hỏi–đáp đồng bộ, công khai, cần trả lời tại chỗ trước mặt người khác | Kênh 1-1 không đồng bộ (chat riêng, email, office hours) — rào cản xã hội thấp hơn nhiều, có thể vẫn thông. *Chưa kiểm.* |
| **When** | Sáng 30/07/2026, môn Ứng dụng AI. Rộng hơn: từ khi kênh ngoài đủ tốt để giải quyết trọn một thắc mắc nội dung | Trước đó, khi không kênh nào ngoài lớp giải quyết được nội dung — lúc đó câu hỏi hoặc được hỏi, hoặc chết, và cả hai đều nhìn thấy được |
| **Extent** | Ít nhất 1 sinh viên, 1 buổi, 1 thắc mắc, `reported` ngôi thứ nhất | **Chưa biết** có bao nhiêu sinh viên, bao nhiêu buổi. Đây là lỗ trống lớn nhất của tài liệu và là chỗ phép thử phải nhắm vào |
| **Who** (vai trò) | Sinh viên có thắc mắc nhưng không nêu; giảng viên của lớp đó | Sinh viên chủ động hỏi (vẫn hỏi, không mất tín hiệu). Giảng viên các môn mà kênh ngoài trả lời **kém**: lab có phần cứng, đồ án, môn phụ thuộc ngữ cảnh riêng của trường/của chính giảng viên đó — ở đó câu hỏi vẫn chảy về người dạy. *Kiểm được, chưa kiểm — và là dòng phân biệt mạnh nhất trong lưới.* |

## 3. Hiện trạng & nỗi đau có bằng chứng ⏳ MỞ LẠI

> **Mở lại 30/07/2026** sau khi người dùng cung cấp thêm 16 phản hồi khảo sát (đợt 2, 16:07–16:24). n từ 6 lên 17 dòng trong phạm vi. Phần đóng trước đó và cổng 1 chạy trên n=6 **không còn hiệu lực** — xem "Đợt 2" bên dưới. Bốn con số trong tài liệu đã bị đảo, kể cả hai con số mà agent đã dùng để tự sửa mình ở vòng 2.

Vòng đề xuất 1 (agent đề xuất, người dùng giữ/cắt). Sàn: 5 nỗi đau / 2 nhóm — **đã đạt** (8 ứng viên, 2 nhóm chắc chắn).

| # | Nỗi đau | Ai chịu | Nhãn | Nguồn cụ thể — trích được về đúng chỗ |
|---|---------|---------|------|----------------------------------------|
| 1 | Có thắc mắc về nội dung nhưng không nêu ra ở kênh công khai, đồng bộ | Sinh viên | `reported` | Người dùng, ngôi thứ nhất, 30/07/2026, môn Ứng dụng AI. Nguyên văn: *"ngại không trả lời"*, *"tôi hỏi ChatGPT, đã hiểu câu hỏi"* |
| 2 | Né hỏi công khai đi kèm kết quả học tập kém hơn rõ rệt: **78% sinh viên đặt câu hỏi trong lớp đậu môn, so với 45% ở nhóm né hỏi công khai** | Sinh viên | `reported` — **hạ từ `observed` ở cổng 1** | Peeters, Robinson & Rubie-Davies (2020), *J. Educational Psychology* 112(3) 533–550. Phương pháp: quan sát 3 lớp toán phổ thông + stimulated recall 18 sinh viên. **Chuỗi truyền: bài gốc → blog Columbia EPIC → bộ tóm tắt của WebFetch → tài liệu này. Hai lớp trung gian; chưa mở bài gốc, chưa đọc HTML thô của EPIC.** Thêm: đây là **tương quan**, không phải nhân quả — người hay đặt câu hỏi rất có thể vốn đã học tốt hơn; và là phổ thông, không phải đại học |
| 3 | Thắc mắc chuyển sang kênh ngoài; **không để lại dấu vết nào trong LMS** → không có dữ liệu để phân tích | Giảng viên (và cả hệ thống) | (a) `reported` · (b) `inconclusive` — **cổng 1** | (a) Người dùng, ngôi 1: câu hỏi sáng nay đi vào ChatGPT, không vào lớp. (b) StudyChat dataset, arXiv 2503.07928 — thu trong **một môn AI**. **Chưa phân giải được: kết luận này do một model nhỏ đọc PDF sinh ra, không có câu trích và không có con số nào.** PDF đã tải về: `…/tool-results/webfetch-1785400945675-yyx828.pdf` — ai muốn kiểm thì mở được |
| 4 | Im lặng mang hai nghĩa loại trừ nhau — *đã hiểu* / *không dám hỏi* — và không có cách phân giải; mặc định bị đọc thành nghĩa thứ nhất | Giảng viên | `reported` cho hiện tượng, `assumed` cho lớp cụ thể này | Văn liệu về classroom silence: silence có thể bị hiểu sai theo nhiều nghĩa (Frontiers in Psychology 2021, PMC8830408). Việc *lớp Ứng dụng AI sáng nay* bị đọc sai thì không ai kiểm |
| 5 | Chi phí xã hội của việc hỏi công khai: sợ làm giảng viên không vui, sợ bị bạn cười, sợ thành gánh nặng | Sinh viên | `reported` | Peeters et al. (2020) qua EPIC: *"tension between the goals such as the desire to learn and avoidance of psychological risks (e.g. upsetting the teacher, being mocked by peers)"* |
| 6 | Rào cản này đậm hơn trong bối cảnh Việt Nam: face concerns, lo lắng, chuẩn mực văn hoá | Sinh viên | `reported` — **chưa phân giải lại** | Nghiên cứu về classroom silence ở sinh viên kỹ thuật Việt Nam & Malaysia, *Cogent Education* 10.1080/2331186X.2024.2404780. **Chỉ đọc được bản tóm tắt kết quả tìm kiếm — bài gốc trả HTTP 403.** Không có số, không có cỡ mẫu |
| 7 | Mất kênh giao tiếp với giảng viên (hiện tượng), **chi phí cụ thể chưa xác định** | Sinh viên | `reported` cho cảm nhận, `assumed` cho chi phí | Người dùng, nguyên văn: *"tôi nhận thấy mình mất giao tiếp với giảng viên"*. Câu hỏi về chi phí cụ thể đã hỏi, **chưa được trả lời** |
| 8 | ~~Câu trả lời từ kênh ngoài không được kiểm theo tiêu chí của môn; deep-processing thấp hơn ~35% germane cognitive load~~ | — | **RỜI BẢNG — cổng 1** | Chỉ tồn tại trong một snippet kết quả tìm kiếm: không tác giả, không năm, không cỡ mẫu, không venue. Không đủ để phân giải về bất cứ đâu. Phần "câu trả lời không được kiểm theo tiêu chí của môn" vẫn là một mối lo hợp lý nhưng hiện **không có nguồn nào** — nếu muốn giữ, phải đi tìm lại từ đầu |

### Nỗi đau chống lại chính giải pháp ở mục 0 — ghi ở đây vì nó là bằng chứng, xử lý ở mục 5

| # | Nỗi đau | Ai chịu | Nhãn | Nguồn |
|---|---------|---------|------|-------|
| 9 | Dashboard cảnh báo sớm phần lớn **không được dùng**: chỉ **42% giảng viên** dùng thường xuyên sau **3 năm** triển khai (khảo sát **366** giảng viên). Rào cản: không có hướng dẫn diễn giải, tự tin số thấp, **thêm việc**, không tích hợp vào workflow | Giảng viên | `reported` — **chưa phân giải lại** | Herodotou et al. (2023), *Predictive Learning Analytics and University Teachers: Usage and perceptions three years post implementation*, Open University, oro.open.ac.uk/86454. **Bài gốc trả HTTP 403; con số 42%/366 lấy từ nguồn thứ cấp.** |
| 10 | Kể cả khi dashboard được dùng, nó không cải thiện kết quả cuối: chỉ giúp duy trì động lực ở nhóm sinh viên **đã có động lực cao**, không tác động lên outcome cuối kỳ | Sinh viên, giảng viên | `reported` | *Journal of Learning Analytics* — Insights of Instructors and Advisors into an Early Prediction Model for Non-Thriving Students; đọc qua bản tóm tắt kết quả tìm kiếm |

### Vòng 2 — khảo sát sinh viên, 30/07/2026 (nguồn `observed` đầu tiên)

Artifact: `lms-du-lieu-khong-hanh-dong.survey-sv-2026-07-30.tsv`, lưu nguyên văn cùng thư mục. 7 phản hồi. Nhãn R1–R7 theo timestamp.

**Loại bỏ trước khi phân tích:** R2 (15:48:18) — khai *"Năm 10"*, *"Chưa từng học"* môn thực hành, nhận/nộp bài qua *"Telegram"*, tần suất kẹt = 1, khi kẹt thì *"Hỏi claude"*. Không nằm trong phạm vi mục 2 và gần như chắc chắn là phản hồi đùa. **n hợp lệ = 6.**

| # | Nỗi đau | Ai chịu | Nhãn | Nguồn — trích được về đúng chỗ |
|---|---------|---------|------|--------------------------------|
| 11 | Bị kẹt trong giờ thực hành ở tần suất cao: **trung bình 4.0/5** (R1:5, R5:5, R3:4, R4:4, R6:3, R7:3) | Sinh viên | `observed` | Survey Q4, 6/6 |
| 12 | Khi kẹt, **5/6 dùng ChatGPT/AI**; chỉ **2/6 hỏi giảng viên hoặc trợ giảng**. Tín hiệu ra khỏi mọi kênh nhà trường thấy được | Sinh viên → Giảng viên mất tín hiệu | `observed` | Survey Q5, 6/6 |
| 13 | **1/6 không dùng workaround nào — bỏ luôn.** R1: *"Bỏ qua và chuyển sang phần khác, Không làm tiếp"*, kẹt tần suất 5/5, và *"Thường không nhận được hỗ trợ"* | Sinh viên | `observed` | Survey R1, Q4+Q5+Q7 |
| 14 | **2/6 trả lời "Thường không nhận được hỗ trợ"** dù R7 khai đã thử cả 5 đường (hỏi GV, hỏi bạn, Google, ChatGPT, xem lại tài liệu) | Sinh viên | `observed` | Survey Q7: R1, R7 |
| 15 | Lý do không hỏi giảng viên chia thành **ba cơ chế khác nhau, cần ba loại can thiệp khác nhau** — không phải một: <br>· **Xã hội** — ngại phát biểu trước lớp 3/6; sợ câu hỏi quá đơn giản 3/6 <br>· **Năng lực diễn đạt** — *"Không biết mô tả lỗi như thế nào"* 3/6 <br>· **Nguồn lực/cung** — lớp đông khó nhận hỗ trợ 3/6; giảng viên đang bận sinh viên khác 1/6 | Sinh viên | `observed` | Survey Q6, 6/6 |
| 16 | **Dữ liệu thực hành không nằm trong LMS.** GitHub/GitLab 4/6; Teams 2/6; Zalo/Messenger/Discord 2/6; Google Classroom 1/6; LMS trường chỉ 4/6 và không ai dùng LMS đơn độc trừ R1, R5 | Giảng viên, nhà trường | `observed` | Survey Q3, 6/6 |
| 17 | **Người cần giúp nhất là người sợ bị nhìn thấy nhất.** R1 — kẹt 5/5, bỏ bài, thường không được hỗ trợ, ngại phát biểu + sợ câu hỏi đơn giản — là người **duy nhất trong 6 dòng hợp lệ** lo *"Giảng viên sử dụng dữ liệu để đánh giá hoặc gây áp lực"*, chấm tính năng phát hiện **3/5** và *"Chưa chắc chắn"* sẽ dùng | Sinh viên | `observed` | Survey R1, Q6+Q9+Q13+Q14. **Sửa ở cổng 1:** bản trước viết R1 "thấp nhất nhóm cả ba chỉ số" — sai. Q9: R1 = 3 nhưng **R6 cũng = 3**; Q14: R1 "Chưa chắc chắn" nhưng **R5 cũng vậy**. R1 là **đồng thấp nhất**. Thêm: R2 (đã loại) cũng chọn cùng mối lo, nên trên cả 7 dòng thì là 2/7 |
| 18 | Lo ngại lớn nhất về AI là **chất lượng đầu ra, không phải quyền riêng tư**: *"AI đưa ra gợi ý hoặc đáp án không chính xác"* **4/6** (R3,R4,R5,R6); quyền riêng tư chỉ **1/6** (R7) | Sinh viên | `observed` | Survey Q13 |
| 18b | **1/6 không dùng LMS của trường một chút nào** — R4 nhận/nộp bài qua Google Classroom, GitHub, Zalo/Discord và nộp trực tiếp cho giảng viên | Nhà trường, giảng viên | `observed` — phát hiện thêm khi đếm lại ở cổng 1 | Survey R4, Q3 |

### Bằng chứng từ khảo sát đi NGƯỢC cách đóng khung ở mục 0

| # | Phát hiện | Nhãn | Nguồn |
|---|-----------|------|-------|
| 19 | **Chi phí cụ thể không được xác nhận.** *"Tôi từng bị chậm tiến độ vì không được hỗ trợ kịp thời"*: chỉ **2/6 đồng ý**, **4/6 trung lập**. Đây là đúng bài kiểm `Tangible`, và nó phần lớn **trượt** | `observed` | Survey Q8b |
| 20 | **Nhu cầu yếu.** Sẵn sàng dùng nếu triển khai thử: **1/6 "Chắc chắn có"**, 3/6 "Có thể có", 2/6 "Chưa chắc chắn". Không ai đang tuyệt vọng | `observed` | Survey Q14 |
| 21 | **Tính năng chủ lực ở mục 0 gần như không ai chọn.** Q11 (chọn 1 quan trọng nhất): *AI chấm sơ bộ + giảng viên duyệt* **3/6**; *cảnh báo giảng viên khi cả lớp gặp khó* **1/6**; *gợi ý cá nhân khi gặp lỗi* **1/6**; *badge/gamification* **1/6**. Nhu cầu số một là **phản hồi nhanh trên bài đã nộp**, không phải phát hiện khó khăn thời gian thực | `observed` | Survey Q11 |
| 22 | Tính hữu ích tự khai của tính năng phát hiện: trung bình **3.83/5** (R7:5, R3/R4/R5:4, R1/R6:3) — ấm nhẹ, không phải nóng | `observed` | Survey Q9 |

### Giới hạn phương pháp của khảo sát — phải đọc kèm mọi con số trên

1. **n = 6.** Mọi tỷ lệ ở đây là đếm đầu người, không phải thống kê. "3/6" nghĩa là ba người.
2. **Cả 7 phản hồi trong 14 phút** (15:45–15:59). Một lần phát tới một nhóm sẵn có — đúng cái bẫy mục 2 đã ghi trước: bằng chứng chảy về phía người dễ tiếp cận.
3. **5/6 là năm 4 trở lên** (R4: năm 5+). Sinh viên cuối khoá, đã sống sót qua hệ thống. Không phải nhóm rủi ro nhất.
4. **3/6 straight-line toàn bộ dải Likert** — R5 và R7 chọn "Hoàn toàn đồng ý" cả 5 mục, R6 chọn "Trung lập" cả 5 mục. Dải Likert vì vậy gần như không mang thông tin.
5. **Q9–Q15 là câu hỏi thuộc solution space, hỏi trực tiếp người trả lời.** Chúng đo mức dễ tính, không đo nhu cầu: tán thành một tính năng tưởng tượng không tốn gì. Phần đáng tin của khảo sát là **Q4, Q5, Q6, Q7** — hành vi đã xảy ra. Phần Q9–Q15 chỉ nên dùng để *phản chứng* (như dòng 20, 21), không dùng để *chứng minh*.
6. **Chưa hỏi giảng viên nào.** Bài kiểm `Tangible` phía người ra quyết định vẫn trắng.
7. R5 trả lời Q15 bằng *"dẹt sơ"*, R2 bằng *"không"* — mức đầu tư của người trả lời vào phần mở là thấp.

### Điều khảo sát này bác của chính agent

Ở vòng 1, agent đề xuất đóng khung nỗi đau là **im lặng có chủ ý** — chi phí xã hội của việc hỏi công khai. Survey Q6 cho thấy đó chỉ là **một trong ba** cơ chế, và không phải cơ chế lớn nhất: xã hội 3/6, không biết diễn đạt lỗi 3/6, lớp đông/giảng viên bận 3/6+1. Hai cơ chế sau không phải sự ngại và không được chữa bởi cùng một thứ. Ghi lại như một lần đóng khung sai của agent, không xoá.

Điều này cũng giải thích vì sao ChatGPT thắng áp đảo (12): nó **đồng thời** xoá chi phí xã hội *và* xoá yêu cầu phải diễn đạt được lỗi — dán nguyên thông báo lỗi vào là xong. Không kênh nào của nhà trường làm được cả hai.

### Vòng 3 — đề xuất sau khi chốt cơ chế C và ràng buộc "không tăng nguồn lực"

Agent đề xuất; người dùng giữ hoặc cắt. Tất cả đều `assumed` cho tới khi hỏi được giảng viên.

| # | Nỗi đau | Ai chịu | Nhãn | Cơ sở |
|---|---------|---------|------|-------|
| 23 | **Quy tắc phân bổ hiện tại là "ai hỏi được thì được giúp trước".** Trong lab đông, thời gian giảng viên đi tới người **giơ tay** — tức người có rào cản xã hội thấp nhất và diễn đạt được lỗi rõ nhất. Đó chính là **nghịch đảo** của người cần nhất | Sinh viên khó khăn nhất | `assumed` — suy ra từ Q6+Q7, chưa quan sát buổi lab nào | Q6: rào cản xã hội 3/6 và không diễn đạt được lỗi 3/6 đều là điều kiện **cần** để giơ tay. Q7: R1 và R7 *"Thường không nhận được hỗ trợ"* |
| 24 | **Cầu tự triệt tiêu, nên cung trông như đủ.** R1 bỏ bài giữa buổi → không còn ai đang chờ → giảng viên kết thúc buổi với ấn tượng lớp ổn. Người rời hàng đợi biến mất khỏi mọi phép đo | Giảng viên (mất tín hiệu), sinh viên | `observed` cho hành vi bỏ bài (R1, Q5), `assumed` cho phần giảng viên đọc sai | Survey R1 Q4+Q5+Q7 |
| 25 | **Cùng một lỗi được giải thích lại nhiều lần cho từng người** — thời gian hằng số bị tiêu vào việc lặp, thay vì vào ca khó | Giảng viên | `assumed` — nhưng có tín hiệu cầu: *"Thông báo cho giảng viên khi nhiều sinh viên cùng gặp khó khăn"* được chọn 2/6 ở Q10 | Survey Q10: R3, R7 |
| 26 | Câu hỏi mô tả kém **tiêu nhiều thời gian giảng viên hơn** câu hỏi mô tả tốt — nên cơ chế "không biết mô tả lỗi" (3/6) không chỉ ngăn sinh viên hỏi, nó còn làm mỗi lần hỏi đắt hơn | Giảng viên và sinh viên | `assumed` | Nối Q6 (3/6 không biết mô tả lỗi) với ràng buộc thời gian hằng số |
| 27 | Giảng viên **không biết mình đã bỏ sót ai** trong buổi vừa dạy — phân bổ sai là vô hình với chính người phân bổ | Giảng viên | `assumed` — **chưa hỏi giảng viên nào** | — |
| 28 | Môn này **có trợ giảng hay không: vẫn chưa biết.** Nếu có, họ là người chịu đau chưa từng được hỏi; nếu không, ràng buộc "không tăng nguồn lực" còn chặt hơn | Trợ giảng | `assumed` | Mục 0 giải pháp 4 nhắc tới trợ giảng nhưng chưa ai xác nhận họ tồn tại |

**Yield vòng 3:** 6 ứng viên mới. **Saturation vẫn chưa đạt** (cần hai vòng liên tiếp không sinh gì; hiện là vòng 1 → 10, vòng 2 → 12, vòng 3 → 6). Lớp ứng viên chắc chắn còn sinh thêm là lớp **phía giảng viên**, và nó chỉ mở ra khi phỏng vấn được một giảng viên. Điều này phải vào phép tính dừng ở mục 7 chứ không được lặng lẽ bỏ qua.

### Nhóm liền kề — đề xuất vòng 1

- **Trợ giảng** — mục 0 chỉ nêu với tư cách *người thực thi giải pháp*, chưa bao giờ là người chịu đau. Môn này có trợ giảng hay không: **chưa biết**.
- **Bạn cùng lớp** — không phải nhóm chịu đau mà là **workaround cạnh tranh thứ hai**. Peeters et al. ghi nhận đúng chuyện này: nhiều "help avoider" vẫn hỏi, nhưng hỏi **bạn tin cậy, ở chỗ riêng tư**.
- **Nhà trường** — agent đề xuất **cắt** khỏi phạm vi: zero nguồn, không tiếp cận được.

### Vòng 4 — khảo sát đợt 2, n tăng lên 17 (30/07/2026, 16:07–16:24)

23 phản hồi tổng. Nhãn R1–R23 theo timestamp.

**Phân loại phạm vi.** Mục 2 khoanh vào sinh viên **đang học**, trong môn **có giờ thực hành**. Nên:

- **Loại khỏi mọi phép đếm:** R2 (*"Năm 10"*, chưa từng học, Telegram, *"Hỏi claude"*) và R16 (*"Thất nghiệp"* — không phải năm học nào, không xác định được có đang học hay không).
- **Tách riêng, không tính vào n chính:** R17 (*"Đã ra trường"*), R18 và R22 (*"Đã tốt nghiệp"*) — hồi tưởng, không đang trong lab nào; R18 còn trả lời Q7 là *"Tôi không nhớ hoặc chưa từng gặp trường hợp này"*. Và R13 (*"Chưa học nhưng sắp học"*) — chưa từng học môn thực hành nên Q4–Q7 không thể là kinh nghiệm thật.
- **n chính = 17:** R1, R3–R12, R14, R15, R19, R20, R21, R23.

| # | Phát hiện trên n=17 | Ai chịu | Nhãn | Nguồn |
|---|---|---|---|---|
| 29 | Bị kẹt: **trung bình 3.29/5** (tổng 56/17). Mức cao (4–5): **7/17**. Mức thấp (1–2): 4/17 | Sinh viên | `observed` | Q4 |
| 30 | **Dùng ChatGPT/AI: 15/17 (88%)** — gần như phổ quát. Không dùng: chỉ R1 và R8 | Sinh viên | `observed` | Q5 |
| 31 | **Chờ ≥20 phút hoặc không bao giờ được hỗ trợ: 6/17 (35%)** — Trên 20 phút: R4, R8, R10, R12 · Thường không nhận được hỗ trợ: R1, R7 | Sinh viên | `observed` | Q7 |
| 32 | **Hai người bỏ bài, cùng một chân dung.** R1 và R10 — cả hai Q4 = **5/5** (kẹt cao nhất), cả hai đều nêu *"Sợ câu hỏi của mình quá đơn giản"*, cả hai đều nằm trong nhóm lo *"Giảng viên sử dụng dữ liệu để đánh giá hoặc gây áp lực"*. R10 chờ **trên 20 phút** | Sinh viên | `observed` | Q4+Q5+Q6+Q7+Q13 |
| 33 | **Lo bị giảng viên dùng dữ liệu gây áp lực: 4/17 (24%)** — R1, R10, R12, R15. Không còn là một người lẻ | Sinh viên | `observed` | Q13 |
| 34 | **Lo về quyền riêng tư: 6/17 (35%)** — R7, R8, R12, R20, R21, R23 | Sinh viên | `observed` | Q13 |
| 35 | **Badge / bảng xếp hạng tạo cạnh tranh không cần thiết: 4/17 (24%)** — R10, R11, R12, R19. Bằng chứng chống giải pháp số 5 ở mục 0 | Sinh viên | `observed` | Q13 |
| 36 | **GitHub/GitLab: 10/17 (59%)**. **3/17 không dùng LMS của trường một chút nào** (R4, R6, R19) | Nhà trường, giảng viên | `observed` | Q3 |
| 37 | *"Giảng viên khó biết ai đang gặp khó khăn trong lớp đông"*: **10/17 đồng ý** (59%), 4 trung lập, 3 không đồng ý | Giảng viên | `observed` | Q8a |
| 38 | *"Có phần tôi chưa hiểu nhưng giảng viên vẫn tiếp tục bài"*: **10/17 đồng ý** (59%) | Sinh viên | `observed` | Q8c |

### Bốn con số bị ĐẢO khi n lên 17 — kể cả hai con số agent đã dùng để tự sửa mình

| Claim cũ (n=6) | Trên n=17 | Hệ quả |
|---|---|---|
| **Chỉ 2/6 (33%) hỏi giảng viên** khi kẹt | **10/17 (59%) hỏi giảng viên hoặc trợ giảng** — R4,R7,R8,R9,R11,R12,R14,R15,R19,R23 | **Câu chuyện "không ai hỏi giảng viên" là giả tạo của mẫu nhỏ.** ChatGPT không **thay** giảng viên — nó được dùng **song song**. Điều này làm yếu thêm P5 (đã bị loại), nhưng **làm mạnh và làm rõ P1**: người ta *có* hỏi; vấn đề là chuyện gì xảy ra **sau khi** hỏi — 6/17 chờ ≥20 phút hoặc không bao giờ được giúp. Đó đúng là bài toán hàng đợi, tức phân bổ |
| **Ba cơ chế ở Q6 đồng hạng 3/6 mỗi cái** — agent dùng con số này ở vòng 2 để tự sửa rằng đóng khung "im lặng có chủ ý" là sai | Từng mục: **sợ câu hỏi quá đơn giản 9/17 (53%)** · ngại phát biểu 8/17 (47%) · không biết mô tả lỗi 8/17 (47%) · lớp đông 6/17 (35%) · giảng viên đang bận 5/17 (29%). Gộp cụm: **xã hội 11/17 (65%)** · diễn đạt 8/17 (47%) · **cung 9/17 (53%)** | **Lần tự sửa của agent ở vòng 2 cũng là giả tạo của mẫu nhỏ.** Cụm xã hội **dẫn đầu rõ**, không đồng hạng; và *"sợ câu hỏi của mình quá đơn giản"* là lý do được nêu nhiều nhất trong cả khảo sát. Cụm cung (cơ chế C người dùng đã chọn) đứng **thứ hai**, 53% — vẫn lớn, nhưng không phải lớn nhất |
| **Tính năng chủ lực ở mục 0 "gần như không ai chọn"** (1/6) | Q11: *AI chấm sơ bộ + GV duyệt* **6/17 (35%)** · **cảnh báo GV khi cả lớp gặp khó 5/17 (29%)** · **gợi ý cá nhân 4/17 (24%)** · theo dõi tiến độ 1/17 · badge 1/17 | **Claim cũ sai trên mẫu lớn.** Gộp hai tính năng chủ lực của mục 0 (cảnh báo GV + gợi ý cá nhân) = **9/17 (53%)**, **vượt** AI chấm sơ bộ (35%). Ý tưởng gốc không hề bị chối — nó dẫn đầu khi gộp |
| Q9 hữu ích trung bình **3.83** | **3.94** (67/17); **11/17 chấm 4–5** | Nhích lên, vẫn ấm chứ chưa nóng |

### Con số KHÔNG đảo — và một con số xấu đi rất nhiều

**`Tangible` vẫn trượt, và giờ trượt sạch hơn trước.** *"Tôi từng bị chậm tiến độ vì không được hỗ trợ kịp thời"* (Q8b) trên n=17: **6/17 đồng ý (35%)**, 8/17 trung lập (47%), 3/17 không đồng ý.

Nhưng đây là chỗ quan trọng. **9/17 (53%) straight-line toàn bộ dải Likert 5 mục** — R5, R7, R10, R15 (Hoàn toàn đồng ý ×5), R8, R9 (Đồng ý ×5), R6, R21 (Trung lập ×5), R23 (Hoàn toàn không đồng ý ×5). Tám người còn lại thật sự phân biệt giữa các mục: R1, R3, R4, R11, R12, R14, R19, R20.

Đếm Q8b **chỉ trong 8 người phân biệt được**: R1 Trung lập · R3 Trung lập · R4 Trung lập · R11 Không đồng ý · R12 Trung lập · R14 Trung lập · R19 Trung lập · R20 Không đồng ý.

> **Không một ai.** Cả 6 phiếu "đồng ý" ở Q8b đều đến từ người straight-line. Trong nhóm thật sự đọc và phân biệt từng mục, **0/8 xác nhận mình từng bị chậm tiến độ vì thiếu hỗ trợ kịp thời** — 6 trung lập, 2 không đồng ý.

Đây là phát hiện nặng nhất của đợt 2. Bài kiểm `Tangible` không chỉ yếu — nó **rỗng** khi bỏ đi các phiếu không phân biệt.

**Nhu cầu vẫn yếu (Q14):** *Chắc chắn có* **4/17 (24%)**, *Có thể có* 5/17, ***Chưa chắc chắn* 8/17 (47%)** — đa số tương đối vẫn là chưa chắc. R13 (đã tách riêng) trả lời *"Chắc chắn không"*.

### Giới hạn phương pháp — cập nhật cho n=17

1. **9/17 (53%) straight-line dải Likert** — tệ hơn đợt 1 (3/6). Toàn bộ Q8a–Q8e chỉ nên đọc trong nhóm 8 người phân biệt được.
2. **Cả 23 phản hồi trong 39 phút** (15:45–16:24). Vẫn là một lần phát tới nhóm sẵn có — đúng cái bẫy mục 2 ghi trước.
3. **13/17 (76%) là năm 4 trở lên.** Mẫu vẫn lệch nặng về sinh viên cuối khoá, tức người đã sống sót qua hệ thống.
4. **Mâu thuẫn nội tại ở 4 dòng:** R8 (Q12 *"Tôi không muốn AI can thiệp"* nhưng Q14 *"Chắc chắn có"*); R23 (Hoàn toàn không đồng ý cả 5 mục Likert nhưng Q9 = 4 và Q14 *"Chắc chắn có"*); R20 (Q5 có *"Chờ giảng viên đến hỗ trợ"* nhưng Q7 *"Dưới 5 phút"*); R13 (Q13 nêu 3 lo ngại rồi chọn cả *"Tôi không có lo ngại"*).
5. **2/17 tự khai "Tôi thường chủ động hỏi giảng viên"** (R14, R19) — theo dòng bắt buộc ở mục 2, đây là nhóm bị loại trừ khỏi phạm vi. Giữ trong phép đếm làm đối chứng, nhưng đánh dấu.
6. **Vẫn chưa hỏi giảng viên nào.** Ô `Tangible` phía người ra quyết định vẫn trắng sau 23 phản hồi.
7. **Cổng 1 phải chạy lại** trên toàn bộ số liệu n=17. Bản chạy trước là trên n=6.

### Điều đợt 2 bác của chính agent — lần thứ hai

Ở vòng 2 agent tự sửa mình rằng đóng khung "im lặng có chủ ý" là sai vì ba cơ chế đồng hạng 3/6. **Lần tự sửa đó cũng sai** — nó dựng trên ba con số 3/6 trên n=6. Trên n=17, cụm xã hội dẫn đầu 65%, và lý do đơn lẻ được nêu nhiều nhất trong cả khảo sát là *"Sợ câu hỏi của mình quá đơn giản"* (53%).

Bài học ghi lại, không xoá: **ở n=6, mọi tỷ lệ đều là ba người, và ba người đủ để đảo một kết luận theo bất kỳ chiều nào.** Agent đã hai lần rút kết luận cấu trúc từ những con số đó — một lần để dựng cách đóng khung, một lần để phá nó. Cả hai lần đều vượt quá thẩm quyền của dữ liệu.

Điều này **không** đảo lựa chọn cơ chế C của người dùng: cụm cung vẫn 53%, và nó vẫn là cụm duy nhất mà chi phí được người ra quyết định cảm nhận trong phòng. Nhưng nó có nghĩa là C được chọn **cùng hạng** với A, không phải **thay cho** A.

### Đã đọc / đã tra

Chạy research nhanh ngày 30/07/2026, 6 truy vấn + 4 lần mở nguồn trực tiếp.

**Mở được và đọc được:**
- Columbia EPIC — *Why Do Students Avoid Seeking Help When They Do Not Understand?* → nguồn duy nhất cho ra một con số kiểm được (78% / 45%) kèm citation đầy đủ.
- arXiv 2503.07928 — StudyChat dataset (PDF, 2.1MB, đã tải).

**Không mở được — HTTP 403:**
- oro.open.ac.uk/86454 (Open University, Herodotou et al. 2023) — con số 42%/366 **chưa phân giải về bài gốc**.
- tandfonline.com/doi/full/10.1080/2331186X.2024.2404780 (bối cảnh Việt Nam) — **chưa phân giải**.

**Không tra được:**
- Dữ liệu LMS thật, log truy cập, lịch sử nộp bài — không tồn tại trong phạm vi project này.
- Số thắc mắc thật trong lớp Ứng dụng AI so với số nêu ra — chưa có phép đo nào.
- Giảng viên môn Ứng dụng AI có coi việc mất tín hiệu là mất mát hay không — **chưa phỏng vấn ai ngoài chính người dùng**.

**Đã phân giải lại** (cổng 1) — chạy 30/07/2026, lượt riêng, chỉ đọc. **Verdict: `fail`.**

Mở `lms-du-lieu-khong-hanh-dong.survey-sv-2026-07-30.tsv` và đếm lại thủ công từng claim ở nhãn cao nhất:

- **Khớp chính xác 12/12 claim từ khảo sát** — Q4 (24/6=4.0), Q5 (AI: R3,R4,R5,R6,R7 = 5/6 · GV: R4,R7 = 2/6), Q6 (ngại: R1,R3,R4 · mô tả lỗi: R3,R4,R5 · lớp đông: R4,R6,R7 — mỗi nhóm 3/6), Q7 (R1,R7), Q3 (GitHub: R3,R4,R6,R7 · LMS: R1,R3,R5,R7), Q8b (2 đồng ý / 4 trung lập), Q14 (1/3/2), Q11 (R1,R5,R6 = 3/6), Q9 (23/6=3.83), straight-line (R5,R7 HTĐY×5 · R6 Trung lập×5), 5/6 năm 4+.
- **Hạ nhãn:** dòng 2 (Peeters) `observed` → `reported` — hai lớp trung gian, chưa mở bài gốc.
- **Rời bảng:** dòng 8 — không tác giả, không năm, không cỡ mẫu.
- **`inconclusive`:** dòng 3b (StudyChat) — không có câu trích, không có số.
- **Sửa một câu nói quá:** dòng 17 — "thấp nhất nhóm" → "đồng thấp nhất".
- **Phát hiện thêm:** dòng 18b (R4 hoàn toàn ngoài LMS).

Lý do verdict là `fail` chứ không phải `pass`: hai dòng không giữ được nhãn khi mở nguồn ra đọc lại, và một câu bị nói quá. Chỗ đổ vỡ nằm **toàn bộ ở nguồn ngoài** — đúng chỗ tôi phải tin vào một lớp trung gian thay vì tự đếm.

Điều cổng này không làm được, ghi rõ để không ai nhầm: nó tách khỏi *bước* soạn thảo, không tách khỏi *người* soạn thảo — cùng một model viết cả hai. Nó bắt được nguồn thiếu và nguồn không phân giải được. **Nó không bắt được một nguồn bị đọc sai.**

**Điều kiện dừng thu thập.** Sàn 5 nỗi đau / 2 nhóm: đạt. Saturation: **chưa đạt** — vòng 1 sinh 10 ứng viên, vòng 2 sinh 12, vòng 3 sinh 6; chưa có hai vòng liên tiếp nào sinh 0. Lớp ứng viên chắc chắn còn sinh thêm là **phía giảng viên**, và nó chỉ mở khi phỏng vấn được một giảng viên. Mục 3 đóng lại vì hết nguồn lực trong phạm vi project môn học, **không** vì đã bão hoà. Ghi vào phép tính dừng ở mục 7.

## 4. Lọc rồi mới xếp hạng ✅

Bộ lọc là CỔNG, điểm số chỉ là THỨ TỰ. Không đảo ngược. 28 dòng ở mục 3 gộp thành 9 ứng viên cấp cao.

### Bốn bộ lọc — chạy trước, không chấm điểm

| # | Ứng viên | Important<br>*không giải thì sao?* | Tangible<br>*chi phí cảm ngay, bởi người quyết?* | Unsatisfied<br>*đang hack quanh nó?* | Lucrative<br>*ai trả giá thật hôm nay?* | Qua? |
|---|---|---|---|---|---|---|
| **P1** | **Phân bổ sai thời gian hỗ trợ trong lab đông** — quy tắc hiện hành là "ai hỏi được thì được giúp trước" | Người cần nhất không được giúp trong khi nguồn lực chảy đi nơi khác; Peeters gợi ý hậu quả tới đậu/trượt | SV: **có** — R4 chờ >20 phút, R1+R7 thường không được hỗ trợ. GV: cảm được trong phòng nhưng **chưa hỏi ai** → `assumed` | **Rất mạnh** — 5/6 dùng ChatGPT, 1/6 bỏ bài. Workaround mạnh nhất trong cả tài liệu | Thời gian, và **bỏ bài** (walking away = một cái giá thật). Không ai trả bằng tiền | ✅ |
| **P2** | **Cầu tự triệt tiêu** — người kẹt nặng nhất rời hàng đợi, nên lớp trông ổn | Bỏ bài lặp lại thì phần đó không bao giờ học được, và cộng dồn | SV: **có** (R1). GV: **không thể** — bản chất của nó là vô hình với người phân bổ | Workaround chính là **bỏ**. Đúng dạng "walking away" | R1 đang trả, bằng cách bỏ bài | ✅ (Tangible chỉ qua một phía) |
| **P7** | **Cùng một lỗi giải thích lại nhiều lần** — thời gian hằng số bị tiêu vào việc lặp | Trực tiếp là hiệu suất phân bổ, đúng trục đã chọn | GV: giải thích lần thứ tám trong một buổi là cảm giác rất cụ thể — nhưng **`assumed`, chưa hỏi GV nào** | Chưa biết GV có hack quanh không (dừng lớp giải thích chung?) — `assumed` | GV trả bằng thời gian | ✅ (yếu — mọi ô đều `assumed`) |
| **P6** | Phản hồi trên bài đã nộp đến muộn — chỉ biết sai khi được chấm | Vừa phải: Q8d 3/6 đồng ý | SV cảm ngay. GV trả bằng thời gian chấm | Một phần đã được lấp: ChatGPT kiểm bài được | GV trả bằng thời gian chấm | ⚠️ qua, nhưng **nằm ngoài cơ chế C** → cần kích hoạt điều kiện sửa phạm vi ở mục 2 |
| **P3** | Không diễn đạt được lỗi nên không hỏi được ai | Chặn cả việc hỏi lẫn việc tự tìm | SV cảm ngay | **TRƯỢT** | — | ❌ |
| **P4** | Chi phí xã hội của việc hỏi công khai | Peeters 78%/45% | SV cảm ngay, GV không | **TRƯỢT** | — | ❌ |
| **P5** | **Tín hiệu thoát khỏi mọi kênh nhà trường thấy được** → không có dữ liệu để phân tích | Mọi tầng phân tích đều mù nếu không giải | **TRƯỢT** | **TRƯỢT** | — | ❌ |
| **P8** | Giảng viên không biết mình đã bỏ sót ai | Phân bổ sai là vô hình với người phân bổ | **TRƯỢT** — cùng lý do P5 | Không ai hack quanh cái mình không thấy | — | ❌ |
| **P9** | Nhà trường không xác định được nguyên nhân kết quả / tỷ lệ bỏ học | Có thể quan trọng | Không tiếp cận được để biết | Không biết | Không biết | ❌ |

### Chấm điểm — chỉ cho ứng viên sống sót

S = severity, F = frequency, I = impact, mỗi trục 1–5, mỗi điểm phải có mốc neo và nguồn.

| Ứng viên | S | Neo cho S | F | Neo cho F | I | Neo cho I | Tổng |
|---|---|---|---|---|---|---|---|
| **P1** | 4 | Mất trọn một buổi lab; R4 chờ >20 phút; 2/6 *"Thường không nhận được hỗ trợ"* | 4 | Tần suất kẹt trung bình **4.0/5**, mỗi buổi thực hành (Q4) | 4 | Chạm cả hai nhóm trong phạm vi; Peeters nối tới đậu/trượt | **12** |
| **P2** | 5 | Bỏ hoàn toàn phần bài đó, cộng dồn sang buổi sau; R1 kẹt 5/5 | 2 | Chỉ **1/6** khai bỏ bài (Q5) — nhưng 1/6 trong lớp 40 là ~7 người | 3 | Nặng cho người đó, và làm mù giảng viên | **10** |
| **P7** | 2 | Không ai bị hại nặng — chỉ tiêu thời gian | 4 | Mỗi buổi lab (`assumed`, chưa hỏi GV) | 3 | Giải phóng thời gian hằng số → gián tiếp giúp P1 | **9** |
| **P6** | 2 | Biết sai muộn; Q8d 3/6 | 3 | Mỗi lần nộp bài | 3 | Chạm cả SV và GV | **8** |

**Thứ tự: P1 (12) > P2 (10) > P7 (9) > P6 (8).**

Điểm số ở đây **chỉ là thứ tự**, và tôi nói rõ nó mua được ít đến mức nào: ba phán đoán thứ tự cộng lại trông có vẻ đo lường, thực chất không. Cái quyết định là bốn bộ lọc phía trên. P1 đứng đầu không vì tổng 12, mà vì nó là ứng viên duy nhất có **workaround mạnh, đang chạy, đo được** (5/6 ChatGPT, 1/6 bỏ bài) — bằng chứng mạnh nhất về nhu cầu thật.

### Hai hướng khác nhau về bản chất — cổng 2

| Ứng viên | Hướng 1 | Hướng 2 | Hướng 3 (nếu có) |
|---|---|---|---|
| **P1** | **Hạ chi phí phát tín hiệu** — làm việc "tôi đang kẹt" biểu đạt được mà không phải trả giá công khai | **Bỏ hẳn việc phát tín hiệu** — làm trạng thái kẹt tự bộc lộ từ chính công việc đang làm, không cần ai nói gì | **Đổi cấu trúc buổi học** — ghép cặp sinh viên, hoặc thiết kế bài sao cho thời gian hằng số không cần phân bổ theo yêu cầu |
| **P2** | **Làm việc rời hàng đợi để lại dấu vết** — đo được người đã bỏ, thay vì họ biến mất | **Giảm lý do bỏ** — chia bài nhỏ hơn để một chỗ kẹt không chặn toàn bộ phần còn lại | — |
| **P7** | **Gộp** — nhận ra lỗi trùng và xử lý một lần cho cả lớp | **Chặn trước** — sửa tài liệu/đề bài để lỗi đó không phát sinh nữa | — |
| **P6** | **Rút ngắn vòng chấm** | **Làm bài tự kiểm được** — test case, checker: sinh viên biết mình sai mà không cần ai chấm | — |

### Đã loại — append-only, không xoá dòng

| Ứng viên | Trượt ở đâu | Lý do | Đảo ngược (nếu có) |
|---|---|---|---|
| **P3** — không diễn đạt được lỗi | **Unsatisfied** | Đây là lần cắt sạch nhất trong cả tài liệu. ChatGPT **không phải hack tạm bợ** cho nỗi đau này — nó là giải pháp **thắng**: dán nguyên thông báo lỗi vào là xong, không cần diễn đạt gì. Nỗi đau còn tồn tại nhưng **không còn chưa được thoả mãn** | — |
| **P4** — chi phí xã hội của việc hỏi công khai | **Unsatisfied** | Cùng cơ chế: ChatGPT xoá sạch chi phí xã hội cho phần **nội dung**. Phần còn lại — mất kênh với giảng viên — thì trượt `Tangible`: Q8b chỉ 2/6 đồng ý mình từng bị chậm tiến độ, 4/6 trung lập | Đảo ngược nếu phỏng vấn giảng viên cho thấy mất kênh gây chi phí cụ thể phía họ |
| **P5** — tín hiệu thoát khỏi hệ thống | **Tangible**, rồi **Unsatisfied** | **Đây chính là cách đóng khung ở mục 0** (*"LMS chỉ lưu dữ liệu nhưng không phân tích"*), và nó trượt đúng bộ lọc bị bỏ qua nhiều nhất. Không ai cảm nhận được một tín hiệu **chưa từng nhận**: giảng viên không biết mình đang thiếu gì, nên cũng không ai hack quanh nó. Cơ chế thì thật; nhưng ở dạng một *vấn đề để giải*, nó không làm ai chuyển động | Đảo ngược nếu một giảng viên nói được cụ thể họ đã ra quyết định sai vì thiếu tín hiệu đó |
| **P8** — GV không biết mình bỏ sót ai | **Tangible** | Cùng lỗi vô hình như P5 | Cùng điều kiện như P5 |
| **P9** — nhà trường | Không lọc được | Zero nguồn, không tiếp cận được trong phạm vi project. Ba dòng ở mục 0 về nhà trường không có gì đỡ | Đảo ngược nếu có quyền truy cập dữ liệu cấp trường |
| **Dòng 8** — 35% germane cognitive load | Cổng 1 | Không tác giả, không năm, không cỡ mẫu | Đảo ngược nếu tìm lại được bài gốc |
| **R2** — phản hồi khảo sát 15:48:18 | Phạm vi (mục 2) | "Năm 10", chưa từng học môn thực hành, nhận bài qua Telegram, khi kẹt thì *"Hỏi claude"* | — |

## 5. Bằng chứng phản chứng ✅

Mười một mục, mỗi mục nêu tên cụ thể. Bốn mục đầu **không** gạt được sang bên — chúng làm kết luận ở mục 7 thành có điều kiện.

### Không gạt được — làm yếu trực tiếp cách đóng khung

**1. Chi phí cụ thể không được xác nhận (Q8b).** *"Tôi từng bị chậm tiến độ vì không được hỗ trợ kịp thời"*: chỉ **2/6 đồng ý, 4/6 trung lập** — và cả 2 người đồng ý đều là người straight-line toàn dải Likert (R5, R7), nên hai phiếu đó gần như không mang thông tin. Đây là bài kiểm `Tangible` phía sinh viên và nó **gần như trắng**. Không gạt được: nỗi đau P1 đứng được nhờ hành vi (Q5, Q7), không nhờ chi phí tự khai. Một nỗi đau có workaround mạnh nhưng không có chi phí tự khai là một nỗi đau **người ta chịu được**.

**2. Nhu cầu yếu (Q14).** Nếu triển khai thử: **1/6 "Chắc chắn có"**, 3/6 "Có thể có", 2/6 "Chưa chắc chắn". Người duy nhất chắc chắn là R4 — người đã hỏi cả 5 kênh, tức người **ít gặp rào cản nhất**, không phải người trong phạm vi mục 2. Không gạt được.

**3. Chưa hỏi giảng viên nào.** `Tangible` phía người ra quyết định là một ô trống. Toàn bộ P1 phía giảng viên, cùng P7 và P8, đều `assumed`. Đây là lỗ hổng lớn nhất và nó không được che.

**4. Lõi của cách đóng khung là `assumed` theo lựa chọn của người dùng.** Dòng 23 — quy tắc phân bổ ưu tiên người hỏi được — chưa từng được quan sát. Người dùng chấp nhận nhãn `assumed` ngày 30/07/2026. Nó suy ra từ Q6 + Q7, hợp lý, nhưng chưa ai đếm một buổi lab nào.

### Gạt được sang bên — kèm lý do

**5. Open University: dashboard cảnh báo phần lớn không được dùng.** Herodotou et al. (2023), 366 giảng viên, 3 năm sau triển khai: **chỉ 42% dùng thường xuyên**; rào cản là thêm việc và không tích hợp workflow. **Gạt vì:** đây là bằng chứng chống lại một **giải pháp** (dashboard cho giảng viên), không chống lại **vấn đề**. P1 có ba hướng ở cổng 2 và hai trong ba không cần dashboard nào. Nhưng nó giết chết hướng đi mặc định trong mục 0, nên phải đứng ở đây. *Bài gốc trả 403 — chưa phân giải.*

**6. Dashboard không dịch chuyển kết quả cuối.** *Journal of Learning Analytics*: chỉ giúp duy trì động lực ở nhóm **đã có động lực cao**, không tác động lên outcome cuối kỳ. **Gạt vì:** cùng lý do như (5) — và nó củng cố việc chọn hướng không-dashboard.

**7. Tính năng chủ lực ở mục 0 gần như không ai chọn (Q11).** *Cảnh báo giảng viên khi cả lớp gặp khó* chỉ **1/6**; *gợi ý cá nhân* **1/6**; trong khi *AI chấm sơ bộ + GV duyệt* được **3/6**. **Gạt vì:** Q11 là câu hỏi solution-space, chỉ dùng được để phản chứng chứ không để chứng minh — và ở đây nó đang làm đúng việc phản chứng: nó bác giải pháp gốc, không bác P1. Hệ quả thật: nhu cầu tự khai số một (**P6 — phản hồi nhanh trên bài đã nộp**) là một vấn đề **khác**, nằm ngoài cơ chế C, và muốn theo nó thì phải kích hoạt điều kiện sửa phạm vi.

**8. R1 sợ chính loại giải pháp mà vấn đề này gợi ra.** Người cần giúp nhất là người duy nhất lo *"Giảng viên sử dụng dữ liệu để đánh giá hoặc gây áp lực"*. **Gạt vì:** nó không bác vấn đề — nó là **ràng buộc thiết kế bắt buộc**: bất kỳ hướng nào hoạt động bằng cách phơi sinh viên khó khăn ra trước giảng viên đều đẩy ngược vào chính người nó muốn giúp. Ghi thành ràng buộc, không thành lý do dừng.

**9. Tiền đề "LMS có dữ liệu" là sai (Q3).** GitHub/GitLab 4/6, Teams 2/6, Zalo/Messenger/Discord 2/6, và **R4 không dùng LMS trường một chút nào**. **Gạt vì:** nó bác chữ "LMS" trong ý tưởng gốc, không bác nỗi đau. Nhưng nó xoá luôn giả định rằng chỉ cần cắm một tầng phân tích vào LMS là thấy được việc học thực hành.

**10. Peeters et al. (2020) yếu hơn nó trông.** Tương quan chứ không nhân quả — người hay đặt câu hỏi rất có thể vốn đã học tốt hơn; 3 lớp **toán phổ thông**, không phải đại học; 18 sinh viên trong phần phỏng vấn; và tới tay tài liệu này qua hai lớp trung gian. **Gạt vì:** nó chỉ được dùng để chứng minh nỗi đau *tồn tại và có gắn với kết quả*, không dùng để định lượng gì.

**11. Khảo sát bị lệch mẫu đúng như mục 2 đã cảnh báo trước.** Cả 7 phản hồi trong **14 phút** — một lần phát tới nhóm sẵn có; **5/6 là năm 4 trở lên**, tức người đã sống sót qua hệ thống, không phải nhóm rủi ro nhất; **3/6 straight-line** toàn dải Likert. **Gạt vì:** phần đáng tin là Q4–Q7 (hành vi đã xảy ra) và chúng nhất quán với nhau. Nhưng mọi tỷ lệ trong tài liệu này là **đếm đầu người trên n=6**, không phải thống kê.

### Khả năng vẫn còn mở và chưa loại được

**Nếu vấn đề thật đúng là thiếu cung, và cung không tăng được, thì có thể không tồn tại giải pháp nào trong phạm vi.** Câu trả lời đúng khi đó là đổi thiết kế môn học — chia nhóm, đổi cách ra bài, ghép cặp sinh viên — chứ không phải thêm một tầng công nghệ. Cách đóng khung "phân bổ sai" ở mục 2 là một lập luận rằng vẫn còn dư địa mà không cần thêm người; **lập luận đó chưa được kiểm.** Nếu nó sai, kết luận đúng là `KHÔNG ĐÁNG GIẢI` cho hướng AI.

## 6. Phát biểu vấn đề ⏳

- **A** — [ai] cần [nhu cầu, dạng động từ] vì [insight bất ngờ]
- **B** —
- **C** —

**Chọn:** — vì:

**Các phát biểu còn lại thua vì:**

**Hồi cứu tiên nghiệm** (cổng 3) — một năm sau, cách đóng khung này hoá ra sai; sai ở đâu:

**Người dùng viết lại bằng chữ của chính mình** (cổng 3 — viết lại, không phải phê duyệt):

## 7. Falsifier & điều kiện dừng ⏳

**Nếu đây không phải vấn đề thật, dấu hiệu tương lai cụ thể nào sẽ cho ta biết:**

**Những giả định phải đúng thì vấn đề này mới đáng giải:**

**Giả định rủi ro nhất** (vừa gánh nặng vừa chưa được chứng minh):

**Phép thử rẻ nhất:** — **kết quả nào thì coi như huỷ:**

**Dừng thu thập vì:** đã dùng `<n>` nguồn; hai vòng gần nhất sinh thêm `<k>` ứng viên mới; cố ý bỏ qua:

**Biết là đã giải được khi:**

**Kết luận:** `ĐI TIẾP` / `KHÔNG ĐÁNG GIẢI` — vì:

**Bước kế** (một việc nghiên cứu — thường là phép thử rẻ nhất; không phải spec, không phải build)**:**

## 8. Giải pháp đã park ⏳

Không phải sản phẩm của tài liệu này. Mọi ý tưởng giải pháp bật ra trong lúc chạy — của người dùng hay của agent, kể cả những cái ở mục 0 — cất ở đây và chỉ mở ra ở Step 4.

| Ý tưởng | Ai nêu | Có trúng vấn đề đã chốt không? |
|---------|--------|--------------------------------|

> Chốt xong mục 7 → viết bản tinh gọn `<slug>.PROBLEM_RESEARCH.md`.
