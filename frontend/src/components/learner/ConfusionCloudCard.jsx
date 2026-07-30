import Card, { CardTitle } from '../ui/Card.jsx'
import Chip from '../ui/Chip.jsx'
import { useSession } from '../../state/SessionContext.jsx'
import { useToast } from '../ui/Toast.jsx'

/** Các chủ đề lớp đang thấy khó — bấm để xác nhận "tôi cũng chưa hiểu". */
export default function ConfusionCloudCard() {
  const { topics, votedTopics, voteTopic } = useSession()
  const toast = useToast()

  return (
    <Card>
      <CardTitle eyebrow="Live">Điểm khó của lớp</CardTitle>

      <div className="flex flex-wrap gap-2">
        {topics.map((t) => {
          const voted = votedTopics.includes(t.id)
          return (
            <Chip
              key={t.id}
              as="button"
              tone={voted ? 'hot' : 'default'}
              onClick={() => {
                voteTopic(t.id)
                toast(voted ? 'Đã bỏ xác nhận.' : 'Đã ghi nhận: bạn cũng chưa hiểu chủ đề này.')
              }}
            >
              {t.label} · {t.votes}
            </Chip>
          )
        })}
      </div>

      <p className="mt-3 text-[12px] text-muted">
        Bấm vào một chủ đề để xác nhận: “Tôi cũng chưa hiểu”.
      </p>
    </Card>
  )
}
