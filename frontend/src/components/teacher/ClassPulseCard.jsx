import Card, { CardTitle } from '../ui/Card.jsx'
import Button from '../ui/Button.jsx'
import Chip from '../ui/Chip.jsx'
import Callout from '../ui/Callout.jsx'
import { useSession } from '../../state/SessionContext.jsx'
import { useToast } from '../ui/Toast.jsx'
import { ACTION_VARIANT, SIGNAL_LABEL, STATUS_CHIP, STATUS_TONE } from '../../lib/decision.js'
import { IconEvidence, IconThumbsDown, IconThumbsUp } from '../../lib/icons.js'

/**
 * Class Pulse: kết luận của rule engine + bằng chứng + tối đa 3 hành động.
 * Giảng viên luôn là người quyết định; mọi lựa chọn đều được ghi log.
 */
export default function ClassPulseCard() {
  const { run, runAction, launchFollowUp, sendFeedback } = useSession()
  const toast = useToast()

  if (!run || run.status !== 'closed' || !run.decision) return null

  const { decision, actions, feedback } = run
  const taken = new Set(actions.map((a) => a.code))

  const choose = async (action) => {
    try {
      await runAction(action.code)
      if (action.code === 'RUN_FOLLOW_UP') {
        await launchFollowUp()
        toast('Đã mở câu kiểm tra lại cho cả lớp.')
      } else {
        toast(`Đã ghi nhận: ${action.label}`)
      }
    } catch (err) {
      toast(err.message ?? 'Không thực hiện được hành động.')
    }
  }

  const rate = async (helpful) => {
    await sendFeedback(helpful)
    toast(helpful ? 'Cảm ơn — đã ghi nhận insight hữu ích.' : 'Đã đánh dấu insight chưa chính xác.')
  }

  return (
    <Card tone={decision.status === 'STRUGGLING' ? 'alert' : 'plain'}>
      <CardTitle eyebrow="Trợ lý lớp học">Class Pulse · Checkpoint #{run.order}</CardTitle>

      <div className="mb-2.5 flex flex-wrap items-center gap-2">
        <Chip tone={STATUS_CHIP[decision.status]}>{decision.statusLabel}</Chip>
        <Chip tone="neutral">{SIGNAL_LABEL[decision.signal]}</Chip>
        <Chip tone="neutral">Độ tin cậy {Math.round(decision.confidence * 100)}%</Chip>
      </div>

      <Callout tone={STATUS_TONE[decision.status]}>{decision.summary}</Callout>

      <ul className="mt-3 grid gap-1.5">
        {decision.evidence.map((line) => (
          <li key={line} className="flex gap-2 text-[12px] text-[#425268]">
            <IconEvidence className="mt-px shrink-0 text-primary" size={14} weight="fill" />
            <span>{line}</span>
          </li>
        ))}
      </ul>

      {decision.recommendedActions.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {decision.recommendedActions.map((action) => (
            <Button
              key={action.code}
              size="sm"
              variant={ACTION_VARIANT[action.code] ?? 'ghost'}
              active={taken.has(action.code)}
              onClick={() => choose(action)}
            >
              {action.label}
              {action.minutes ? ` · ${action.minutes}′` : ''}
            </Button>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-[12px] font-semibold text-muted">
          Chưa đề xuất hành động khi tín hiệu chưa đủ — hãy gia hạn hoặc mở lại checkpoint.
        </p>
      )}

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-3">
        <span className="text-[11px] text-muted">
          Kết luận từ rule engine · {actions.length} hành động đã ghi log
        </span>
        <div className="flex gap-1.5">
          <Button size="sm" variant="quiet" active={feedback === true} onClick={() => rate(true)}>
            <IconThumbsUp size={13} weight={feedback === true ? 'fill' : 'bold'} />
            Hợp lý
          </Button>
          <Button size="sm" variant="quiet" active={feedback === false} onClick={() => rate(false)}>
            <IconThumbsDown size={13} weight={feedback === false ? 'fill' : 'bold'} />
            Chưa chính xác
          </Button>
        </div>
      </div>
    </Card>
  )
}
