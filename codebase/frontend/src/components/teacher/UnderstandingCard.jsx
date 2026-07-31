import Card, { CardTitle } from '../ui/Card.jsx'
import Metric from '../ui/Metric.jsx'
import Button from '../ui/Button.jsx'
import Callout from '../ui/Callout.jsx'
import { useSession } from '../../state/SessionContext.jsx'
import { pulseSummary } from '../../lib/decision.js'
import { useToast } from '../ui/Toast.jsx'

/** Tổng hợp mức độ hiểu bài theo pulse của lớp. */
export default function UnderstandingCard() {
  const { pulse, page, online, resetPulse } = useSession()
  const toast = useToast()
  const { total, struggling } = pulseSummary(pulse)

  const tone = struggling >= 40 ? 'danger' : struggling >= 25 ? 'warning' : 'success'
  const detail =
    total === 0
      ? 'Learning Pulse đã được gửi cho lớp. Kết quả sẽ cập nhật theo thời gian thực.'
      : `${struggling}% học viên đang mơ hồ hoặc bị kẹt trên ${total} phản hồi (${online} máy đang trong lớp). ` +
        (struggling >= 40
          ? 'Nên dừng lại, giải thích ngắn rồi mở quiz kiểm tra.'
          : struggling >= 25
            ? 'Nên kiểm tra nhanh bằng 1 quiz trước khi chuyển slide.'
            : 'Lớp đang theo kịp, có thể tiếp tục.')

  return (
    <Card>
      <CardTitle eyebrow="Live pulse">Mức độ hiểu · Trang {page}</CardTitle>

      <div className="grid grid-cols-3 gap-2">
        <Metric tone="good" value={pulse.understand} label="Đã hiểu" />
        <Metric tone="mid" value={pulse.unclear} label="Hơi mơ hồ" />
        <Metric tone="bad" value={pulse.stuck} label="Đang bị kẹt" />
      </div>

      <Callout tone={tone} title="Gợi ý can thiệp:" className="mt-3">
        {detail}
      </Callout>

      <Button
        size="sm"
        variant="ghost"
        className="mt-3"
        onClick={() => {
          resetPulse()
          toast(`Đã gửi lại Learning Pulse của trang ${page} tới ${online} học viên đang trong lớp.`)
        }}
      >
        Gửi lại Learning Pulse
      </Button>
    </Card>
  )
}
