import Card, { CardTitle } from '../ui/Card.jsx'
import BarStat from '../ui/BarStat.jsx'
import Chip from '../ui/Chip.jsx'
import { useSession } from '../../state/SessionContext.jsx'

/** Lỗi nhận thức phổ biến — dựa trên mapping do đội học thuật định nghĩa. */
export default function MisconceptionCard() {
  const { run, thresholds } = useSession()

  if (!run || run.status !== 'closed') return null
  const list = run.aggregate?.misconceptions ?? []
  if (!list.length) return null

  const clusterAt = thresholds.misconception_cluster ?? 25

  return (
    <Card>
      <CardTitle eyebrow="Chẩn đoán">Lớp đang nhầm ở đâu</CardTitle>

      <div className="grid gap-1">
        {list.map((item) => (
          <BarStat
            key={`${item.optionKey}-${item.code}`}
            label={`${item.optionKey} · ${item.label}`}
            count={item.count}
            total={run.aggregate.responded}
            tone={item.ratio >= clusterAt ? 'wrong' : 'neutral'}
            badge={item.ratio >= clusterAt ? <Chip tone="hot">Cụm lỗi</Chip> : null}
          />
        ))}
      </div>

      <p className="mt-3 text-[11px] text-muted">
        Một phương án sai chiếm ≥ {clusterAt}% được coi là cụm hiểu nhầm — nên giải thích trúng
        điểm đó thay vì giảng lại toàn bộ.
      </p>
    </Card>
  )
}
