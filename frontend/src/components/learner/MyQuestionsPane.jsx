import Card, { CardTitle } from '../ui/Card.jsx'
import Chip from '../ui/Chip.jsx'
import Button from '../ui/Button.jsx'
import EmptyState from '../ui/EmptyState.jsx'
import Callout from '../ui/Callout.jsx'
import { useSession } from '../../state/SessionContext.jsx'
import { useToast } from '../ui/Toast.jsx'
import { categoryMeta } from '../../lib/helpCategories.js'
import { IconPending, IconClaim, IconCheckCircle, IconEscalate } from '../../lib/icons.js'

const STATUS = {
  pending: { tone: 'warning', Icon: IconPending, label: 'Đang chờ trợ giảng phản hồi' },
  claimed: { tone: 'default', Icon: IconClaim, label: 'Trợ giảng đang hỗ trợ bạn' },
  resolved: { tone: 'success', Icon: IconCheckCircle, label: 'Bạn đã đánh dấu là đã hiểu' },
  escalated: { tone: 'hot', Icon: IconEscalate, label: 'Đã chuyển lên giảng viên' },
}

export default function MyQuestionsPane() {
  const { myQuestions, material, helpCategories, resolveQuestion } = useSession()
  const toast = useToast()

  if (!myQuestions.length) {
    return (
      <EmptyState
        title="Bạn chưa gửi yêu cầu hỗ trợ nào."
        hint="Bấm “Cần hỗ trợ” ở tab Tương tác lớp khi bạn thấy vướng."
      />
    )
  }

  const resolve = (question, understood) =>
    resolveQuestion(question.id, understood)
      .then(() =>
        toast(understood ? 'Đã đóng yêu cầu hỗ trợ.' : 'Đã chuyển câu hỏi lên giảng viên.')
      )
      .catch((err) => toast(err.message))

  return (
    <>
      {myQuestions.map((q) => {
        const status = STATUS[q.status]
        const category = categoryMeta(helpCategories, q.category)

        return (
          <Card key={q.id} className="border-l-4 border-l-warning">
            <CardTitle eyebrow={`Trang ${q.page}`}>
              {q.scope === 'private' ? 'Yêu cầu riêng' : 'Yêu cầu ẩn danh'}
            </CardTitle>

            {category ? (
              <Chip tone={category.tone} className="mb-2">
                <category.Icon size={13} weight="fill" />
                {category.label}
              </Chip>
            ) : null}

            <div className="text-[14px] leading-relaxed">{q.text}</div>
            <div className="mt-2 text-[12px] text-muted">{material.name}</div>

            {q.status === 'answered' ? (
              <>
                <Callout tone="success" title="Trợ giảng đã trả lời:" className="mt-3">
                  {q.answer}
                </Callout>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => resolve(q, true)}>
                    Đã hiểu
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => resolve(q, false)}>
                    Vẫn kẹt
                  </Button>
                </div>
              </>
            ) : null}

            {status ? (
              <Chip tone={status.tone} className="mt-3">
                <status.Icon size={13} />
                {status.label}
              </Chip>
            ) : null}
          </Card>
        )
      })}
    </>
  )
}
