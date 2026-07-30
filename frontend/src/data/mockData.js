// Dữ liệu trình bày phía client (cây tài liệu, tiêu đề slide, tài khoản demo).
// Toàn bộ checkpoint, phản hồi và kết luận đều đến từ backend qua /api.

export const CLASS_INFO = { code: 'VL-302', enrolled: 160 }

export const COURSE_TREE = [
  {
    id: 'day01',
    label: 'Day01',
    status: 'STUDYING',
    meta: '2 tài liệu · Published',
    expanded: true,
    docs: [
      { id: 'mat_jtbd_playbook', name: 'Strategyn_JTBD_Playbook.pdf', pages: 48, active: true },
      { id: 'mat_worksheet', name: 'worksheet-jtbd-day-du.md', pages: 6 },
    ],
  },
  { id: 'day02', label: 'Day02', meta: '1 tài liệu · Published', docs: [] },
  { id: 'day03', label: 'Day03', meta: '2 tài liệu · Published', docs: [] },
  { id: 'day04', label: 'Day04', meta: '3 tài liệu · Published', docs: [] },
]

// Tiêu đề + speaker note cho vài trang đầu của playbook.
export const SLIDES = {
  1: {
    eyebrow: 'JTBD PLAYBOOK · DAY 1',
    title: 'Jobs-To-Be-Done Playbook',
    subtitle: 'Khách hàng không mua sản phẩm — họ "thuê" sản phẩm để hoàn thành một job.',
    note: [
      'Mở đầu bằng ví dụ milkshake của Christensen.',
      'Kích hoạt checkpoint #1 sau khi giải thích định nghĩa job.',
      'Nếu tỷ lệ đúng < 65%, giải thích lại trước khi sang Outcome.',
    ],
  },
  2: {
    eyebrow: 'CHƯƠNG 1',
    title: 'Job vs. Solution',
    subtitle: 'Phân biệt nhu cầu cốt lõi và giải pháp đang được dùng để đáp ứng nhu cầu đó.',
    note: [
      'Nhấn mạnh: job ổn định theo thời gian, solution thì không.',
      'Checkpoint #2 gắn ở trang này — lỗi hay gặp là nhầm tính bền vững của job.',
    ],
  },
  3: {
    eyebrow: 'CHƯƠNG 1',
    title: 'Outcome Statement',
    subtitle: 'Cấu trúc: Hướng thay đổi + Đơn vị đo + Đối tượng + Ngữ cảnh.',
    note: [
      'Cho lớp viết thử 1 outcome statement.',
      'Checkpoint #3 kiểm tra cấu trúc câu; chú ý mức độ chắc chắn của lớp.',
    ],
  },
}

export const ACCOUNTS = [
  { role: 'learner', name: 'Học viên demo', email: 'learner@vlearn.edu.vn' },
  { role: 'teacher', name: 'Giảng viên demo', email: 'teacher@vlearn.edu.vn' },
]
