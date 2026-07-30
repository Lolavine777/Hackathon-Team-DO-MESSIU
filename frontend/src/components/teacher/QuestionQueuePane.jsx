import Card, { CardTitle } from '../ui/Card.jsx'
import EmptyState from '../ui/EmptyState.jsx'
import QuestionItem from './QuestionItem.jsx'
import { useSession } from '../../state/SessionContext.jsx'
import { useToast } from '../ui/Toast.jsx'
import { IconCheckCircle } from '../../lib/icons.js'

const WEIGHT = { group: 0, anonymous: 1, private: 2 }

/** Hàng đợi câu hỏi, ưu tiên nhóm câu được nhiều học viên đồng tình. */
export default function QuestionQueuePane({ onAnswer }) {
  const { questions } = useSession()
  const toast = useToast()

  const pending = [...questions]
    .filter((q) => q.status !== 'answered')
    .sort((a, b) => WEIGHT[a.scope] - WEIGHT[b.scope] || b.echo - a.echo)
  const answered = questions.filter((q) => q.status === 'answered')

  return (
    <>
      <Card>
        <CardTitle eyebrow="Ưu tiên theo nhu cầu">Hàng đợi câu hỏi · {pending.length}</CardTitle>

        {pending.length ? (
          pending.map((q, i) => (
            <QuestionItem
              key={q.id}
              item={q}
              selected={i === 0}
              onAnswer={onAnswer}
              onPin={() => toast('Đã ghim câu hỏi cho lớp.')}
              onPrioritize={() => toast('Đã đánh dấu ưu tiên — sẽ nhắc lại cuối buổi.')}
            />
          ))
        ) : (
          <EmptyState icon={IconCheckCircle} title="Đã xử lý hết câu hỏi" />
        )}
      </Card>

      {answered.length ? (
        <Card>
          <CardTitle eyebrow="Lịch sử">Đã trả lời · {answered.length}</CardTitle>
          {answered.map((q) => (
            <QuestionItem key={q.id} item={q} />
          ))}
        </Card>
      ) : null}
    </>
  )
}
