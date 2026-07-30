import Card, { CardTitle } from '../ui/Card.jsx'
import Chip from '../ui/Chip.jsx'
import Callout from '../ui/Callout.jsx'
import { useSession } from '../../state/SessionContext.jsx'

/** Các chủ đề khó được trợ lý gom nhóm từ câu hỏi và phản hồi của lớp. */
export default function ConfusionClusterCard() {
  const { topics, questions } = useSession()
  const hottest = [...topics].sort((a, b) => b.votes - a.votes)[0]
  const grouped = questions.find((q) => q.scope === 'group')

  return (
    <Card tone="accent">
      <CardTitle eyebrow="AI gom nhóm">Điểm khó đang nổi lên</CardTitle>

      <div className="flex flex-wrap gap-2">
        {[...topics]
          .sort((a, b) => b.votes - a.votes)
          .map((t, i) => (
            <Chip key={t.id} tone={i === 0 ? 'hot' : 'default'}>
              {t.label} · {t.votes}
            </Chip>
          ))}
      </div>

      {grouped ? (
        <Callout tone="info" className="mt-3">
          {grouped.echo} câu hỏi tương tự đã được gom thành:{' '}
          <strong>“{grouped.text}”</strong>
        </Callout>
      ) : null}

      {hottest ? (
        <p className="mt-2.5 text-[12px] text-muted">
          Chủ đề cần ưu tiên làm rõ: <strong className="text-secondary">{hottest.label}</strong>
        </p>
      ) : null}
    </Card>
  )
}
