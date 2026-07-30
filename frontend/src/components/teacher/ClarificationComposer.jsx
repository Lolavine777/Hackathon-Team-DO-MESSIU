import { useState } from 'react'
import Card, { CardTitle } from '../ui/Card.jsx'
import Button from '../ui/Button.jsx'
import Callout from '../ui/Callout.jsx'
import { TextArea, TextField } from '../ui/Field.jsx'
import { useSession } from '../../state/SessionContext.jsx'
import { useToast } from '../ui/Toast.jsx'

/** Soạn thẻ giải thích và đăng cho học viên đang xem trang hiện tại. */
export default function ClarificationComposer() {
  const { page, publishClarification, session } = useSession()
  const toast = useToast()
  const [title, setTitle] = useState('Phân biệt Job và Solution')
  const [body, setBody] = useState(
    'Job là tiến bộ người dùng muốn đạt được; solution là cách hiện tại họ đang dùng để đạt tiến bộ đó.'
  )
  const [sent, setSent] = useState(false)

  const publish = () => {
    if (!title.trim() || !body.trim()) return toast('Cần cả tiêu đề và nội dung.')
    publishClarification({ title: title.trim(), body: body.trim() })
    setSent(true)
    toast('Clarification card đã được đăng.')
  }

  return (
    <Card>
      <CardTitle eyebrow="Cho cả lớp">Đăng clarification card</CardTitle>

      <div className="grid gap-2.5">
        <TextField label="Tiêu đề" value={title} onChange={(e) => setTitle(e.target.value)} />
        <TextArea label="Nội dung" rows={4} value={body} onChange={(e) => setBody(e.target.value)} />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" onClick={publish}>
          Đăng lên Trang {page}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => toast('Đã lưu nháp.')}>
          Lưu nháp
        </Button>
      </div>

      {sent ? (
        <Callout tone="success" className="mt-3">
          Giải thích đã được gửi đến {session.online} học viên đang theo dõi Trang {page}.
        </Callout>
      ) : null}
    </Card>
  )
}
