import Button from '../ui/Button.jsx'
import { IconBroadcast, IconMeToo, IconPin, IconUnpin } from '../../lib/icons.js'

const KIND = {
  clarification: {
    Icon: IconBroadcast,
    eyebrow: 'Trợ giảng giải thích',
    frame: 'border-[#9FD3B6] bg-[#F3FBF6]',
    badge: 'bg-[#DFF2E7] text-[#1F6B45]',
  },
  question: {
    Icon: IconPin,
    eyebrow: 'Một bạn trong lớp đang vướng',
    frame: 'border-[#EFC488] bg-[#FFFAF0]',
    badge: 'bg-[#FBEBD2] text-[#8A5A16]',
  },
}

/** Một mục đang dán trên slide — cả lớp cùng nhìn thấy ở đúng trang đó. */
export default function SlidePin({ pin, role, echoed, onEcho, onUnpin, onDismiss }) {
  const kind = KIND[pin.kind] ?? KIND.clarification
  const isQuestion = pin.kind === 'question'

  return (
    <div
      className={`pointer-events-auto rounded-2xl border px-3.5 py-3 shadow-[0_10px_24px_rgba(19,77,139,.16)] backdrop-blur-sm ${kind.frame}`}
    >
      <div className="flex items-center gap-2 text-[11px] font-extrabold text-[#55677A]">
        <kind.Icon size={14} weight="fill" />
        <span className="truncate">{kind.eyebrow}</span>
        {isQuestion && pin.echo ? (
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] ${kind.badge}`}>
            {pin.echo} bạn cũng gặp
          </span>
        ) : null}
      </div>

      {!isQuestion ? <strong className="mt-1 block text-[13px]">{pin.title}</strong> : null}
      <p className="mt-1 text-[13px] font-bold leading-relaxed text-ink">{pin.body}</p>

      <div className="mt-2.5 flex flex-wrap gap-2">
        {role === 'teacher' ? (
          <Button size="sm" variant="ghost" onClick={() => onUnpin(pin)}>
            <IconUnpin size={14} />
            Bỏ ghim
          </Button>
        ) : isQuestion ? (
          <Button size="sm" variant={echoed ? 'ghost' : 'outline'} disabled={echoed} onClick={() => onEcho(pin)}>
            <IconMeToo size={14} weight="fill" />
            {echoed ? 'Đã ghi nhận' : 'Tôi cũng gặp'}
          </Button>
        ) : (
          <Button size="sm" variant="ghost" onClick={() => onDismiss(pin)}>
            Đã hiểu
          </Button>
        )}
      </div>
    </div>
  )
}
