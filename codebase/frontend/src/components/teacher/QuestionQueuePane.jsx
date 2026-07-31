import { useState } from 'react'
import Card, { CardTitle } from '../ui/Card.jsx'
import EmptyState from '../ui/EmptyState.jsx'
import QuestionItem from './QuestionItem.jsx'
import QuestionClustersCard from './QuestionClustersCard.jsx'
import BroadcastModal from './BroadcastModal.jsx'
import ConfirmDialog from '../ui/ConfirmDialog.jsx'
import { useSession } from '../../state/SessionContext.jsx'
import { useToast } from '../ui/Toast.jsx'
import { IconCheckCircle } from '../../lib/icons.js'

const DONE = ['answered', 'resolved']
// Câu đã "vẫn kẹt" phải lên đầu: học viên đọc trả lời rồi mà vẫn chưa thông.
const WEIGHT = { escalated: 0, pending: 1, claimed: 2 }
const SCOPE_WEIGHT = { group: 0, anonymous: 1, private: 2 }

/** Hàng đợi yêu cầu hỗ trợ, kèm bảng gom câu hỏi tương tự của trợ lý. */
export default function QuestionQueuePane({ onAnswer }) {
  const { questions, claimQuestion, pinQuestion } = useSession()
  const toast = useToast()
  const [broadcasting, setBroadcasting] = useState(null)
  const [pinning, setPinning] = useState(null)

  const pending = [...questions]
    .filter((q) => !DONE.includes(q.status))
    .sort(
      (a, b) =>
        (WEIGHT[a.status] ?? 3) - (WEIGHT[b.status] ?? 3) ||
        SCOPE_WEIGHT[a.scope] - SCOPE_WEIGHT[b.scope] ||
        b.echo - a.echo
    )
  const answered = questions.filter((q) => DONE.includes(q.status))

  const claim = (question) =>
    claimQuestion(question.id)
      .then(() => toast('Bạn đang phụ trách câu hỏi này.'))
      .catch((err) => toast(err.message))

  const pin = () => {
    const question = pinning
    setPinning(null)
    pinQuestion(question.id)
      .then(() => toast(`Đã ghim lên Trang ${question.page} — cả lớp cùng nhìn thấy.`))
      .catch((err) => toast(err.message ?? 'Không ghim được câu hỏi.'))
  }

  return (
    <>
      <QuestionClustersCard onAnswer={onAnswer} onBroadcast={setBroadcasting} />

      <Card>
        <CardTitle eyebrow="Ưu tiên theo nhu cầu">Hàng đợi hỗ trợ · {pending.length}</CardTitle>

        {pending.length ? (
          pending.map((q, i) => (
            <QuestionItem
              key={q.id}
              item={q}
              selected={i === 0}
              onAnswer={onAnswer}
              onClaim={claim}
              onPin={setPinning}
              onPrioritize={() => toast('Đã đánh dấu ưu tiên — sẽ nhắc lại cuối buổi.')}
            />
          ))
        ) : (
          <EmptyState icon={IconCheckCircle} title="Đã xử lý hết yêu cầu hỗ trợ" />
        )}
      </Card>

      {answered.length ? (
        <Card>
          <CardTitle eyebrow="Lịch sử">Đã xử lý · {answered.length}</CardTitle>
          {answered.map((q) => (
            <QuestionItem key={q.id} item={q} />
          ))}
        </Card>
      ) : null}

      <BroadcastModal cluster={broadcasting} onClose={() => setBroadcasting(null)} />

      <ConfirmDialog
        open={Boolean(pinning)}
        title={`Ghim lên Trang ${pinning?.page ?? ''}?`}
        confirmLabel="Ghim cho cả lớp"
        warning={
          pinning?.scope === 'private'
            ? 'Đây là yêu cầu riêng tư. Ghim lên slide nghĩa là cả lớp sẽ đọc được nội dung câu hỏi (tên người hỏi vẫn được giấu).'
            : 'Cả lớp sẽ thấy câu hỏi này ngay trên slide và có thể bấm "Tôi cũng gặp".'
        }
        onConfirm={pin}
        onClose={() => setPinning(null)}
      >
        <p className="text-[13px] font-bold leading-relaxed">{pinning?.text}</p>
      </ConfirmDialog>
    </>
  )
}
