import { Brand } from './BrandMark.jsx'
import Button from '../ui/Button.jsx'
import { useSession } from '../../state/SessionContext.jsx'

/** Chặn render màn hình lớp cho tới khi có snapshot đầu tiên từ backend. */
export default function ConnectionGate({ children }) {
  const { ready, error } = useSession()

  if (error) {
    return (
      <div className="grid min-h-screen place-items-center bg-canvas px-6 text-center">
        <div className="max-w-md">
          <Brand className="mb-6 justify-center" />
          <h2 className="text-xl font-extrabold">Không kết nối được tới lớp học</h2>
          <p className="mt-2 text-sm text-muted">
            {error.message ?? 'Lỗi không xác định.'} Kiểm tra backend FastAPI đang chạy tại cổng
            8000 rồi thử lại.
          </p>
          <Button className="mt-5" onClick={() => window.location.reload()}>
            Thử lại
          </Button>
        </div>
      </div>
    )
  }

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center bg-canvas">
        <div className="text-center">
          <Brand className="mb-4 justify-center" />
          <p className="animate-pulse text-sm font-bold text-muted">Đang vào phòng học…</p>
        </div>
      </div>
    )
  }

  return children
}
