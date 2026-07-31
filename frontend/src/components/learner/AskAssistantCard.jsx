import Card, { CardTitle } from '../ui/Card.jsx'
import Button from '../ui/Button.jsx'
import { IconHelp } from '../../lib/icons.js'

export default function AskAssistantCard({ onOpen }) {
  return (
    <Card tone="alert">
      <CardTitle eyebrow="Riêng tư">Đang vướng ở đâu đó?</CardTitle>
      <p className="mb-3 text-[13px] leading-relaxed text-[#56677C]">
        Mô tả ngắn chỗ chưa hiểu và chọn loại vấn đề. Hệ thống tự đính kèm tên tài liệu và trang
        bạn đang xem.
      </p>
      <Button variant="secondary" className="w-full" onClick={onOpen}>
        <IconHelp size={16} weight="fill" />
        Cần hỗ trợ
      </Button>
    </Card>
  )
}
