import Card, { CardTitle } from '../ui/Card.jsx'
import Chip from '../ui/Chip.jsx'
import Callout from '../ui/Callout.jsx'
import { useSession } from '../../state/SessionContext.jsx'
import { RECOVERY_TONE } from '../../lib/decision.js'

function Column({ title, data }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-3">
      <div className="mb-2 text-[11px] font-extrabold uppercase tracking-wide text-muted">{title}</div>
      <div className="text-2xl font-extrabold text-primary">{Math.round(data.correctRate)}%</div>
      <div className="text-[11px] font-bold text-muted">trả lời đúng</div>
      <div className="mt-2 grid gap-0.5 text-[12px] text-[#425268]">
        <span>{Math.round(data.misconceptionRate)}% mắc lỗi phổ biến</span>
        <span>{Math.round(data.lowConfidenceRate)}% không chắc</span>
      </div>
    </div>
  )
}

/** So sánh trước / sau can thiệp trên cùng learning outcome. */
export default function RecoveryCard() {
  const { run, recoveries, history } = useSession()

  const parentId = run?.parentRunId
  const recovery = parentId ? recoveries[parentId] : null
  if (!recovery || run.status !== 'closed') return null

  const parent = history.find((h) => h.id === parentId)

  return (
    <Card tone="highlight">
      <CardTitle eyebrow="Đo hiệu quả can thiệp">Kết quả phục hồi</CardTitle>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Chip tone={recovery.status === 'RECOVERED' ? 'success' : recovery.status === 'PARTIAL' ? 'warning' : 'hot'}>
          {recovery.label}
        </Chip>
        <Chip tone="neutral">
          {recovery.delta >= 0 ? '+' : ''}
          {recovery.delta} điểm %
        </Chip>
        {parent ? <Chip tone="default">{parent.learningOutcome.id}</Chip> : null}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Column title="Trước can thiệp" data={recovery.before} />
        <Column title="Sau can thiệp" data={recovery.after} />
      </div>

      <Callout tone={RECOVERY_TONE[recovery.status]} className="mt-3">
        {recovery.status === 'RECOVERED'
          ? 'Cải thiện rõ rệt — có thể tiếp tục bài.'
          : recovery.status === 'PARTIAL'
            ? 'Có cải thiện nhưng chưa đủ — cân nhắc thêm một ví dụ trước khi đi tiếp.'
            : 'Chưa cải thiện — nên đổi cách giải thích thay vì lặp lại cách cũ.'}
        {recovery.note ? ` ${recovery.note}` : ''}
      </Callout>
    </Card>
  )
}
