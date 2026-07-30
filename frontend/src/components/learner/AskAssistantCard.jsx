import Card, { CardTitle } from '../ui/Card.jsx'
import Button from '../ui/Button.jsx'

export default function AskAssistantCard({ onOpen }) {
  return (
    <Card tone="alert">
      <CardTitle eyebrow="Riêng tư">Vẫn chưa rõ?</CardTitle>
      <p className="mb-3 text-[13px] leading-relaxed text-[#56677C]">
        Gửi câu hỏi riêng. Hệ thống tự đính kèm tên tài liệu, trang và phần bạn đang xem.
      </p>
      <Button variant="secondary" className="w-full" onClick={onOpen}>
        Hỏi riêng trợ giảng
      </Button>
    </Card>
  )
}
