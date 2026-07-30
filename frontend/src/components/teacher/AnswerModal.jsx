import { useEffect, useState } from 'react'
import Modal from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'
import Callout from '../ui/Callout.jsx'
import { TextArea, RadioRow } from '../ui/Field.jsx'
import { useSession } from '../../state/SessionContext.jsx'
import { useToast } from '../ui/Toast.jsx'

export default function AnswerModal({ question, onClose }) {
  const { material, answerQuestion } = useSession()
  const toast = useToast()
  const [text, setText] = useState('')
  const [scope, setScope] = useState('private')

  useEffect(() => {
    if (question) {
      setText('')
      setScope(question.scope === 'private' ? 'private' : 'class')
    }
  }, [question])

  const send = () => {
    const value = text.trim()
    if (!value) return toast('Hãy nhập câu trả lời.')
    answerQuestion(question.id, value)
    onClose?.()
    toast(scope === 'private' ? 'Đã gửi phản hồi riêng.' : 'Đã chia sẻ câu trả lời cho lớp.')
  }

  return (
    <Modal
      open={!!question}
      onClose={onClose}
      title="Trả lời câu hỏi"
      subtitle="Có thể trả lời riêng hoặc chia sẻ ẩn danh cho cả lớp."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={send}>Gửi phản hồi</Button>
        </>
      }
    >
      <Callout tone="info" title="Ngữ cảnh:">
        {material.name} · Trang {question?.page}
      </Callout>

      <p className="my-3 rounded-2xl bg-subtle px-3.5 py-3 text-[13px] font-bold leading-relaxed">
        {question?.text}
      </p>

      <TextArea
        rows={5}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Nhập câu trả lời..."
      />

      <div className="mt-4 grid gap-2">
        <RadioRow name="answerScope" checked={scope === 'private'} onChange={() => setScope('private')}>
          Trả lời riêng học viên đã hỏi
        </RadioRow>
        <RadioRow name="answerScope" checked={scope === 'class'} onChange={() => setScope('class')}>
          Chia sẻ ẩn danh với cả lớp (gắn vào trang {question?.page})
        </RadioRow>
      </div>
    </Modal>
  )
}
