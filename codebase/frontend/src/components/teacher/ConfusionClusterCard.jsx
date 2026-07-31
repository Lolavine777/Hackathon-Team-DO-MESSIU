import Card, { CardTitle } from '../ui/Card.jsx'
import Chip from '../ui/Chip.jsx'
import Callout from '../ui/Callout.jsx'
import { useSession } from '../../state/SessionContext.jsx'

const OPEN = ['pending', 'claimed', 'escalated']

/**
 * Điểm khó đang nổi lên, đọc từ dữ liệu thật: nhóm câu hỏi do trợ lý gom (tab Hỗ trợ)
 * và số học viên đã bấm "Tôi cũng gặp" trên từng câu.
 */
export default function ConfusionClusterCard() {
  const { clusters, questions } = useSession()
  const open = questions.filter((q) => OPEN.includes(q.status))
  const echoed = open.filter((q) => q.echo > 0).sort((a, b) => b.echo - a.echo).slice(0, 3)
  const hottest = clusters[0]

  return (
    <Card tone="accent">
      <CardTitle eyebrow="AI gom nhóm">Điểm khó đang nổi lên</CardTitle>

      {!open.length && !clusters.length ? (
        <p className="text-[13px] leading-relaxed text-muted">
          Chưa có vướng mắc nào đang mở. Câu hỏi của học viên sẽ hiện ở đây ngay khi được gửi lên.
        </p>
      ) : null}

      {clusters.length ? (
        <div className="flex flex-wrap gap-2">
          {clusters.slice(0, 4).map((c, i) => (
            <Chip key={c.id} tone={i === 0 ? 'hot' : 'default'}>
              {c.topic || c.summary.slice(0, 32)} · {c.count}
            </Chip>
          ))}
        </div>
      ) : open.length ? (
        <p className="text-[12px] leading-relaxed text-muted">
          {open.length} câu đang chờ xử lý — mở tab <strong>Hỗ trợ</strong> để trợ lý gom thành nhóm.
        </p>
      ) : null}

      {hottest ? (
        <Callout tone="info" className="mt-3">
          {hottest.count} câu hỏi cùng một vấn đề: <strong>“{hottest.summary}”</strong>
        </Callout>
      ) : null}

      {echoed.length ? (
        <ul className="mt-3 space-y-1.5 text-[12px] text-muted">
          {echoed.map((q) => (
            <li key={q.id} className="flex gap-2">
              <strong className="shrink-0 text-secondary">{q.echo} bạn</strong>
              <span className="truncate">cũng gặp: “{q.text}”</span>
            </li>
          ))}
        </ul>
      ) : null}
    </Card>
  )
}
