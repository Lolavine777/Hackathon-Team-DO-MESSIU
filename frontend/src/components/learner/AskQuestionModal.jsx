import { useState } from 'react'
import Modal from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'
import Callout from '../ui/Callout.jsx'
import { TextArea, RadioRow } from '../ui/Field.jsx'
import { useSession } from '../../state/SessionContext.jsx'
import { useToast } from '../ui/Toast.jsx'
import { categoryList } from '../../lib/helpCategories.js'

export default function AskQuestionModal({ open, onClose, onSent }) {
  const { material, page, askQuestion, helpCategories } = useSession()
  const toast = useToast()
  const [text, setText] = useState('')
  const [scope, setScope] = useState('private')
  const [category, setCategory] = useState(null)

  const categories = categoryList(helpCategories)

  const send = () => {
    const value = text.trim()
    if (!value) return toast('Hãy nhập nội dung câu hỏi.')
    if (categories.length && !category) return toast('Hãy chọn loại vấn đề bạn đang gặp.')

    askQuestion({ text: value, scope, category })
    setText('')
    setCategory(null)
    onClose?.()
    onSent?.()
    toast('Đã gửi yêu cầu hỗ trợ cho trợ giảng.')
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Cần hỗ trợ"
      subtitle="Mô tả ngắn chỗ đang vướng — trợ giảng thấy ngay trên màn hình."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={send}>Gửi yêu cầu</Button>
        </>
      }
    >
      <Callout tone="info" title="Ngữ cảnh được đính kèm tự động:">
        {material.name} · Trang {page}
      </Callout>

      <div className="mt-4">
        <TextArea
          label="Bạn đang vướng ở đâu?"
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ví dụ: Em không hiểu vì sao job statement lại không có tên giải pháp..."
        />
      </div>

      {categories.length ? (
        <div className="mt-4">
          <span className="mb-1.5 block text-[11px] font-extrabold text-muted">Loại vấn đề</span>
          <div className="grid gap-2 sm:grid-cols-3">
            {categories.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setCategory(id)}
                aria-pressed={category === id}
                className={[
                  'flex items-center gap-2 rounded-2xl border px-3 py-2.5 text-[12px] font-extrabold transition',
                  category === id
                    ? 'border-[#8DB5D9] bg-[#EAF3FC] text-primary'
                    : 'border-line bg-white text-muted hover:text-ink',
                ].join(' ')}
              >
                <Icon size={16} weight={category === id ? 'fill' : 'regular'} />
                <span className="truncate">{label}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-4 grid gap-2">
        <RadioRow name="visibility" checked={scope === 'private'} onChange={() => setScope('private')}>
          Chỉ trợ giảng thấy
        </RadioRow>
        <RadioRow name="visibility" checked={scope === 'anonymous'} onChange={() => setScope('anonymous')}>
          Cho phép hiển thị ẩn danh với lớp nếu câu hỏi hữu ích
        </RadioRow>
      </div>
    </Modal>
  )
}
