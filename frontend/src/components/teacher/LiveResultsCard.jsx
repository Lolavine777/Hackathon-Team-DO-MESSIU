import Card, { CardTitle } from '../ui/Card.jsx'
import Donut from '../ui/Donut.jsx'
import Metric from '../ui/Metric.jsx'
import EmptyState from '../ui/EmptyState.jsx'
import QuizOption from '../quiz/QuizOption.jsx'
import { useSession } from '../../state/SessionContext.jsx'
import { CONFIDENCE_LABEL } from '../../lib/decision.js'
import { IconLive, IconWaiting } from '../../lib/icons.js'

/** Phân bố đáp án + mức chắc chắn của lượt checkpoint đang xem. */
export default function LiveResultsCard() {
  const { run } = useSession()

  if (!run) {
    return (
      <Card>
        <CardTitle eyebrow="Realtime">Kết quả checkpoint</CardTitle>
        <EmptyState
          icon={IconWaiting}
          title="Chưa có checkpoint nào được kích hoạt"
          hint="Mở một checkpoint đã soạn sẵn ở trang hiện tại để bắt đầu thu phản hồi."
        />
      </Card>
    )
  }

  const { aggregate, question } = run
  const running = run.status === 'running'
  const confidence = aggregate.confidence ?? {}

  return (
    <Card className={running ? 'ring-2 ring-primary/15' : ''}>
      <CardTitle
        eyebrow={
          running ? (
            <>
              <IconLive size={12} weight="fill" />
              Đang thu
            </>
          ) : (
            'Đã đóng'
          )
        }
      >
        Kết quả · Checkpoint #{run.order}
        {run.kind === 'follow_up' ? ' (kiểm tra lại)' : ''}
      </CardTitle>

      <p className="mb-3 text-[13px] font-bold leading-snug">{question.prompt}</p>

      <div className="mb-3 flex items-center justify-around gap-3 rounded-2xl bg-[#F8FAFD] py-3">
        <Donut value={aggregate.participation} label="Tham gia" tone="#134D8B" />
        <Donut value={aggregate.correctRate} label="Trả lời đúng" />
        <div className="text-center">
          <div className="text-2xl font-extrabold text-primary">{aggregate.responded}</div>
          <div className="mt-1 text-[11px] font-extrabold text-muted">Lượt trả lời</div>
        </div>
      </div>

      <div className="grid gap-2">
        {question.options.map((opt, i) => (
          <QuizOption
            key={opt.key}
            index={i}
            optionKey={opt.key}
            text={opt.text}
            count={aggregate.distribution?.[opt.key] ?? 0}
            total={aggregate.responded}
            showStats
            revealed
            isCorrect={opt.key === aggregate.correctKey}
            disabled
          />
        ))}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <Metric tone="good" value={confidence.sure ?? 0} label={CONFIDENCE_LABEL.sure} />
        <Metric tone="mid" value={confidence.unsure ?? 0} label={CONFIDENCE_LABEL.unsure} />
        <Metric
          tone={aggregate.lowConfidenceRate > 30 ? 'bad' : 'mid'}
          value={confidence.guess ?? 0}
          label={CONFIDENCE_LABEL.guess}
          hint={`${Math.round(aggregate.lowConfidenceRate ?? 0)}% số phản hồi`}
        />
      </div>
    </Card>
  )
}
