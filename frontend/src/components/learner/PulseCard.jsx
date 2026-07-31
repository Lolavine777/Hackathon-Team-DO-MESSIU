import Card, { CardTitle } from '../ui/Card.jsx'
import { useSession } from '../../state/SessionContext.jsx'
import { useToast } from '../ui/Toast.jsx'
import { IconCheckCircle, IconStuck, IconUnclear } from '../../lib/icons.js'

const OPTIONS = [
  {
    value: 'understand',
    label: 'Đã hiểu',
    icon: IconCheckCircle,
    on: 'bg-[#EAF8F2] border-[#88D6B5] text-[#14724C]',
  },
  {
    value: 'unclear',
    label: 'Hơi mơ hồ',
    icon: IconUnclear,
    on: 'bg-[#FFF7E8] border-[#F3C879] text-[#9B6718]',
  },
  {
    value: 'stuck',
    label: 'Đang bị kẹt',
    icon: IconStuck,
    on: 'bg-[#FFF0F1] border-[#E9A2A5] text-secondary',
  },
]

const MESSAGES = {
  understand: 'Đã ghi nhận: bạn đã hiểu phần này.',
  unclear: 'Đã ghi nhận: phần này hơi mơ hồ.',
  stuck: 'Đã ghi nhận: bạn đang bị kẹt. Bạn có thể hỏi riêng trợ giảng.',
}

/** Nhịp hiểu bài — học viên tự đánh giá, giảng viên thấy tổng hợp realtime. */
export default function PulseCard() {
  const { pulse, myPulse, page, sendPulse } = useSession()
  const toast = useToast()

  return (
    <Card>
      {/* Phiếu gắn với đúng trang đang xem, nên nói rõ là trang nào. */}
      <CardTitle eyebrow={`Pulse · Trang ${page}`}>Bạn hiểu phần này thế nào?</CardTitle>

      <div className="grid grid-cols-3 gap-2">
        {OPTIONS.map((o) => (
          <button
            key={o.value}
            onClick={() => {
              sendPulse(o.value)
              toast(MESSAGES[o.value])
            }}
            className={[
              'flex flex-col items-center gap-1 rounded-2xl border px-2 py-3 text-[12px] font-bold transition',
              'hover:-translate-y-px hover:shadow-soft',
              myPulse === o.value ? o.on : 'border-line bg-white text-ink',
            ].join(' ')}
          >
            <o.icon size={19} weight={myPulse === o.value ? 'fill' : 'bold'} />
            {o.label}
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-[12px] text-muted">
        <span>{pulse.understand} đã hiểu</span>
        <span>{pulse.unclear} hơi mơ hồ</span>
        <span>{pulse.stuck} đang bị kẹt</span>
      </div>
    </Card>
  )
}
