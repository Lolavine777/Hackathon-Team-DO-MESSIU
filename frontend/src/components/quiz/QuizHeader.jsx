import Chip from '../ui/Chip.jsx'
import CountdownRing from '../ui/CountdownRing.jsx'
import { IconCheckCircle, IconClose, IconLive } from '../../lib/icons.js'

const STATUS_CHIP = {
  running: { tone: 'hot', label: 'ĐANG MỞ', icon: IconLive },
  closed: { tone: 'success', label: 'ĐÃ ĐÓNG', icon: IconCheckCircle },
  cancelled: { tone: 'neutral', label: 'ĐÃ HUỶ', icon: IconClose },
}

/** Đầu checkpoint: trạng thái, trang gắn kèm, đồng hồ đếm ngược. */
export default function QuizHeader({ run, showCountdown = true }) {
  if (!run) return null
  const status = STATUS_CHIP[run.status] ?? STATUS_CHIP.closed
  const StatusIcon = status.icon

  return (
    <div className="flex items-start gap-3">
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Chip tone={status.tone}>
            <StatusIcon size={13} weight="fill" />
            {status.label}
          </Chip>
          <Chip tone="default">Trang {run.page}</Chip>
          <Chip tone="neutral">
            Checkpoint #{run.order}
            {run.kind === 'follow_up' ? ' · Kiểm tra lại' : ''}
          </Chip>
          {run.scoringMode === 'ungraded' ? <Chip tone="neutral">Không tính điểm</Chip> : null}
        </div>
        <p className="text-[14px] font-extrabold leading-snug">{run.question.prompt}</p>
      </div>

      {showCountdown && run.status === 'running' ? (
        <CountdownRing remaining={run.remainingSec} total={run.windowSec} />
      ) : null}
    </div>
  )
}
