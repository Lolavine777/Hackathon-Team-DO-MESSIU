import Card, { CardTitle } from '../ui/Card.jsx'
import BarStat from '../ui/BarStat.jsx'
import Chip from '../ui/Chip.jsx'
import EmptyState from '../ui/EmptyState.jsx'
import { useSession } from '../../state/SessionContext.jsx'
import { IconGoToSlide, IconNoStats } from '../../lib/icons.js'

/** Checkpoint có tỷ lệ đúng thấp nhất trong buổi — xếp hạng để quay lại giải thích. */
export default function WeakQuestionsCard() {
  const { history, setPage, thresholds } = useSession()

  if (!history.length) {
    return (
      <Card>
        <CardTitle eyebrow="Tổng hợp">Nội dung lớp nắm yếu nhất</CardTitle>
        <EmptyState
          icon={IconNoStats}
          title="Chưa có checkpoint nào kết thúc"
          hint="Sau khi đóng một checkpoint, thống kê sẽ xuất hiện ở đây."
        />
      </Card>
    )
  }

  const weakAt = thresholds.uncertain_correct ?? 65
  const ranked = [...history].sort((a, b) => a.aggregate.correctRate - b.aggregate.correctRate)

  return (
    <Card>
      <CardTitle eyebrow="Tổng hợp">Nội dung lớp nắm yếu nhất</CardTitle>

      <div className="grid gap-3">
        {ranked.map((item) => (
          <div key={item.id} className="rounded-2xl border border-line p-3">
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
              <Chip tone="neutral">
                #{item.order}
                {item.kind === 'follow_up' ? ' · lại' : ''}
              </Chip>
              <Chip as="button" tone="default" onClick={() => setPage(item.page)} title="Mở trang slide">
                Trang {item.page}
                <IconGoToSlide size={13} />
              </Chip>
              {item.aggregate.correctRate < weakAt ? <Chip tone="hot">Cần giảng lại</Chip> : null}
            </div>

            <p className="text-[13px] font-bold leading-snug">{item.question.prompt}</p>

            <div className="mt-2">
              <BarStat
                label="Trả lời đúng"
                count={item.aggregate.correctCount}
                total={item.aggregate.responded}
                tone={item.aggregate.correctRate >= weakAt ? 'correct' : 'wrong'}
              />
              {item.aggregate.misconceptions?.[0] ? (
                <BarStat
                  label={`Nhầm nhiều nhất: ${item.aggregate.misconceptions[0].label}`}
                  count={item.aggregate.misconceptions[0].count}
                  total={item.aggregate.responded}
                  tone="wrong"
                />
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
