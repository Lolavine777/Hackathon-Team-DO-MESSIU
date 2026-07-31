import { useState } from 'react'
import SlidePin from './SlidePin.jsx'
import { useSession } from '../../state/SessionContext.jsx'
import { useToast } from '../ui/Toast.jsx'
import { IconCollapse, IconExpand, IconPin } from '../../lib/icons.js'

/**
 * Lớp ghim nằm đè lên slide: giải thích của trợ giảng và vướng mắc được đưa lên
 * cho cả lớp cùng soi. Chỉ hiện những ghim thuộc đúng trang đang xem.
 */
export default function SlidePinLayer() {
  const { pins, page, role, echoQuestion, unpinNote } = useSession()
  const toast = useToast()
  const [hidden, setHidden] = useState([])
  const [echoed, setEchoed] = useState([])
  const [open, setOpen] = useState(true)

  const visible = pins.filter((pin) => pin.page === page && !hidden.includes(pin.id))
  if (!visible.length) return null

  const echo = (pin) => {
    setEchoed((ids) => [...ids, pin.id])
    echoQuestion(pin.refId)
      .then(() => toast('Đã ghi nhận — trợ giảng thấy được bao nhiêu bạn cùng vướng.'))
      .catch((err) => toast(err.message ?? 'Không ghi nhận được.'))
  }

  const unpin = (pin) =>
    unpinNote(pin.id)
      .then(() => toast('Đã bỏ ghim khỏi slide.'))
      .catch((err) => toast(err.message ?? 'Không bỏ ghim được.'))

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 grid gap-2 p-3">
      <button
        onClick={() => setOpen((v) => !v)}
        className="pointer-events-auto justify-self-start inline-flex items-center gap-1.5 rounded-full border border-line bg-white/95 px-2.5 py-1 text-[11px] font-extrabold text-primary shadow-soft"
      >
        <IconPin size={13} weight="fill" />
        {visible.length} ghim trên trang {page}
        {open ? <IconCollapse size={13} /> : <IconExpand size={13} />}
      </button>

      {open
        ? visible.map((pin) => (
            <SlidePin
              key={pin.id}
              pin={pin}
              role={role}
              echoed={echoed.includes(pin.id)}
              onEcho={echo}
              onUnpin={unpin}
              onDismiss={(p) => setHidden((ids) => [...ids, p.id])}
            />
          ))
        : null}
    </div>
  )
}
