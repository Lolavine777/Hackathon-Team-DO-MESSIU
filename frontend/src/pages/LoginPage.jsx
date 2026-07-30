import { useState } from 'react'
import { Brand } from '../components/layout/BrandMark.jsx'
import Button from '../components/ui/Button.jsx'
import { TextField } from '../components/ui/Field.jsx'
import { ACCOUNTS, CLASS_INFO } from '../data/mockData.js'
import { useAuth } from '../state/AuthContext.jsx'
import { IconCheck } from '../lib/icons.js'

const ROLES = [
  { id: 'learner', label: 'Học viên', hint: 'Trả lời quiz, gửi pulse, hỏi riêng trợ giảng' },
  { id: 'teacher', label: 'Giảng viên', hint: 'Kích hoạt quiz, xem kết quả realtime của lớp' },
]

const PRINCIPLES = [
  ['Nhìn thấy', 'Toàn bộ 160 học viên đều phản hồi, không chỉ 10–15 bạn xung phong.'],
  ['Hiểu đúng', 'Tỷ lệ tham gia, phân bố đáp án và tỷ lệ đúng ngay trong buổi học.'],
  ['Hành động kịp thời', 'Trợ lý đề xuất nên tiếp tục hay giải thích lại.'],
]

export default function LoginPage() {
  const { login } = useAuth()
  const [role, setRole] = useState('learner')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const account = ACCOUNTS.find((a) => a.role === role)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await login(role)
    } catch {
      setError('Không kết nối được tới máy chủ lớp học. Kiểm tra backend đang chạy ở cổng 8000.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_.95fr]">
      <section className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-primary-deep via-primary to-primary-light p-12 text-white lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{
            backgroundImage: 'radial-gradient(#ffffff 1.2px, transparent 1.2px)',
            backgroundSize: '22px 22px',
          }}
        />
        <div className="relative">
          <div className="flex items-center gap-3 text-3xl font-extrabold">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/15">V</div>
            VLearn
          </div>
          <p className="mt-2 text-sm text-white/70">Trợ lý hỗ trợ tương tác Lecture</p>
        </div>

        <div className="relative max-w-lg">
          <h1 className="text-[40px] font-extrabold leading-[1.15]">
            Vòng phản hồi realtime cho lớp {CLASS_INFO.enrolled} học viên
          </h1>
          <p className="mt-4 leading-relaxed text-white/75">
            Quiz do đội ngũ giảng dạy soạn sẵn, gắn với từng slide. Giảng viên kích hoạt đúng lúc —
            cả lớp cùng trả lời nhanh.
          </p>

          <div className="mt-8 grid gap-3">
            {PRINCIPLES.map(([title, desc]) => (
              <div key={title} className="rounded-2xl border border-white/15 bg-white/10 p-4">
                <div className="text-sm font-extrabold">{title}</div>
                <div className="mt-1 text-[13px] text-white/70">{desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative text-xs text-white/50">Tích hợp vào LMS · MVP demo</div>
      </section>

      <section className="flex items-center justify-center bg-canvas px-6 py-12">
        <form onSubmit={submit} className="w-full max-w-md">
          <Brand className="mb-8 lg:hidden" />

          <h2 className="text-2xl font-extrabold">Đăng nhập</h2>
          <p className="mt-1.5 text-sm text-muted">Chọn vai trò để vào phòng học {CLASS_INFO.code}.</p>

          <div className="mt-6 grid gap-2.5">
            {ROLES.map((r) => (
              <button
                type="button"
                key={r.id}
                onClick={() => setRole(r.id)}
                className={[
                  'rounded-2xl border p-4 text-left transition',
                  role === r.id
                    ? 'border-primary bg-white ring-2 ring-primary/20 shadow-soft'
                    : 'border-line bg-white hover:border-primary/40',
                ].join(' ')}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold">{r.label}</span>
                  <span
                    className={[
                      'grid h-5 w-5 place-items-center rounded-full border-2 text-white',
                      role === r.id ? 'border-primary bg-primary' : 'border-line text-transparent',
                    ].join(' ')}
                  >
                    <IconCheck size={11} weight="bold" />
                  </span>
                </div>
                <div className="mt-1 text-[12px] text-muted">{r.hint}</div>
              </button>
            ))}
          </div>

          <div className="mt-5 grid gap-3">
            <TextField label="Email" value={account.email} readOnly />
            <TextField label="Mật khẩu" type="password" defaultValue="demo1234" readOnly />
          </div>

          <Button type="submit" size="lg" className="mt-6 w-full" disabled={busy}>
            {busy ? 'Đang vào lớp…' : 'Sign in'}
          </Button>

          {error ? (
            <p className="mt-3 rounded-xl bg-[#FFF0F1] px-3 py-2 text-center text-[12px] font-semibold text-secondary">
              {error}
            </p>
          ) : null}

          <p className="mt-4 text-center text-[12px] text-muted">
            Bản demo — tài khoản được điền sẵn theo vai trò.
          </p>
        </form>
      </section>
    </div>
  )
}
