import { useEffect, useState } from 'react'
import Modal from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'
import Callout from '../ui/Callout.jsx'
import { TextField, TextArea } from '../ui/Field.jsx'
import { useSession } from '../../state/SessionContext.jsx'
import { useToast } from '../ui/Toast.jsx'

/**
 * Giải thích một lần cho cả nhóm: nội dung lên màn hình lớp và mọi câu hỏi
 * trong nhóm được đánh dấu đã trả lời. Bản nháp của trợ lý luôn sửa được trước khi gửi.
 */
export default function BroadcastModal({ cluster, onClose }) {
  const { broadcastCluster, page } = useSession()
  const toast = useToast()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (!cluster) return
    setTitle(cluster.topic || cluster.summary.slice(0, 60))
    setBody(cluster.suggestedAnswer || '')
  }, [cluster])

  const send = () => {
    if (!title.trim()) return toast('Hãy nhập tiêu đề.')
    if (!body.trim()) return toast('Hãy nhập nội dung giải thích.')

    setSending(true)
    broadcastCluster(cluster.id, { title: title.trim(), body: body.trim() })
      .then(() => {
        toast(`Đã giải thích chung cho ${cluster.count} bạn.`)
        onClose?.()
      })
      .catch((err) => toast(err.message))
      .finally(() => setSending(false))
  }

  return (
    <Modal
      open={Boolean(cluster)}
      onClose={onClose}
      title="Giải thích cho cả nhóm"
      subtitle="Nội dung sẽ hiện trên màn hình lớp và đóng mọi câu hỏi trong nhóm."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={send} disabled={sending}>
            {sending ? 'Đang gửi…' : 'Gửi cho lớp'}
          </Button>
        </>
      }
    >
      <Callout tone="info" title={`${cluster?.count ?? 0} bạn đang hỏi:`}>
        {cluster?.summary}
      </Callout>

      {cluster?.suggestedAnswer ? (
        <Callout tone="warning" title="Bản nháp của trợ lý —" className="mt-2">
          hãy đọc lại và sửa cho đúng ý bạn trước khi gửi.
        </Callout>
      ) : null}

      <div className="mt-4 grid gap-3">
        <TextField
          label="Tiêu đề"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ví dụ: Phân biệt job statement và user story"
        />
        <TextArea
          label={`Nội dung giải thích (gắn vào trang ${page})`}
          rows={6}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Viết giải thích ngắn, đúng chỗ cả nhóm đang vướng..."
        />
      </div>
    </Modal>
  )
}
