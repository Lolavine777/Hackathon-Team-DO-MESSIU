import Card, { CardTitle } from '../ui/Card.jsx'
import Button from '../ui/Button.jsx'
import { useToast } from '../ui/Toast.jsx'

/** Thẻ giải thích do giảng viên / trợ giảng đăng cho cả lớp. */
export default function ClarificationCard({ item, onGoToSlide }) {
  const toast = useToast()

  return (
    <Card tone="highlight">
      <CardTitle eyebrow="Đã ghim lên slide">Phản hồi từ trợ giảng</CardTitle>
      <strong className="text-[14px]">{item.title}</strong>
      <p className="my-2.5 text-[13px] leading-relaxed text-[#425268]">{item.body}</p>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="ghost" onClick={() => onGoToSlide?.(item.page)}>
          Xem trên slide (trang {item.page})
        </Button>
        <Button size="sm" variant="danger" onClick={() => toast('Cảm ơn phản hồi của bạn.')}>
          Đã hiểu
        </Button>
      </div>
    </Card>
  )
}
