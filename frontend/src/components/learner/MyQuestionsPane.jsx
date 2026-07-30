import Card, { CardTitle } from '../ui/Card.jsx'
import Chip from '../ui/Chip.jsx'
import EmptyState from '../ui/EmptyState.jsx'
import Callout from '../ui/Callout.jsx'
import { useSession } from '../../state/SessionContext.jsx'
import { IconPending } from '../../lib/icons.js'

export default function MyQuestionsPane() {
  const { myQuestions, material } = useSession()

  if (!myQuestions.length) {
    return (
      <EmptyState
        title="Bạn chưa gửi câu hỏi nào."
        hint="Câu hỏi riêng sẽ được theo dõi tại đây."
      />
    )
  }

  return (
    <>
      {myQuestions.map((q) => (
        <Card key={q.id} className="border-l-4 border-l-warning">
          <CardTitle eyebrow={`Trang ${q.page}`}>
            {q.scope === 'private' ? 'Câu hỏi riêng' : 'Câu hỏi ẩn danh'}
          </CardTitle>

          <div className="text-[14px] leading-relaxed">{q.text}</div>
          <div className="mt-2 text-[12px] text-muted">{material.name}</div>

          {q.status === 'answered' ? (
            <Callout tone="success" title="Trợ giảng đã trả lời:" className="mt-3">
              {q.answer}
            </Callout>
          ) : (
            <Chip tone="warning" className="mt-3">
              <IconPending size={13} />
              Đang chờ trợ giảng phản hồi
            </Chip>
          )}
        </Card>
      ))}
    </>
  )
}
