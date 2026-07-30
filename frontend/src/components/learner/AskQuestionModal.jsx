import { useState } from 'react'
import Modal from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'
import Callout from '../ui/Callout.jsx'
import { TextArea, RadioRow } from '../ui/Field.jsx'
import { useSession } from '../../state/SessionContext.jsx'
import { useToast } from '../ui/Toast.jsx'

export default function AskQuestionModal({ open, onClose, onSent }) {
  const { material, page, askQuestion } = useSession()
  const toast = useToast()
  const [text, setText] = useState('')
  const [scope, setScope] = useState('private')

  const send = () => {
    const value = text.trim()
    if (!value) return toast('Hãy nhập nội dung câu hỏi.')
    askQuestion({ text: value, scope })
    setText('')
    onClose?.()
    onSent?.()
    toast('Đã gửi câu hỏi cho trợ giảng.')
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Hỏi riêng trợ giảng"
      subtitle="Chỉ trợ giảng và bạn nhìn thấy nội dung này."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={send}>Gửi câu hỏi</Button>
        </>
      }
    >
      <Callout tone="info" title="Ngữ cảnh được đính kèm tự động:">
        {material.name} · Trang {page}
      </Callout>

      <div className="mt-4">
        <TextArea
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ví dụ: Em chưa hiểu job statement khác gì user story..."
        />
      </div>

      <div className="mt-4 grid gap-2">
        <RadioRow
          name="visibility"
          checked={scope === 'private'}
          onChange={() => setScope('private')}
        >
          Chỉ trợ giảng thấy
        </RadioRow>
        <RadioRow
          name="visibility"
          checked={scope === 'anonymous'}
          onChange={() => setScope('anonymous')}
        >
          Cho phép hiển thị ẩn danh với lớp nếu câu hỏi hữu ích
        </RadioRow>
      </div>
    </Modal>
  )
}
