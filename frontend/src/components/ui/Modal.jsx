import { useEffect } from 'react'
import IconButton from './IconButton.jsx'
import { IconClose } from '../../lib/icons.js'

export default function Modal({ open, onClose, title, subtitle, footer, width = 'max-w-xl', children }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(9,24,43,.5)] p-4 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className={`w-full ${width} animate-fade-in overflow-hidden rounded-[22px] bg-white shadow-pop`}>
        <header className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
          <div className="min-w-0">
            <div className="text-lg font-extrabold">{title}</div>
            {subtitle ? <div className="mt-1 text-xs text-muted">{subtitle}</div> : null}
          </div>
          <IconButton size="sm" onClick={onClose} aria-label="Đóng">
            <IconClose size={18} />
          </IconButton>
        </header>

        <div className="max-h-[65vh] overflow-y-auto px-5 py-5">{children}</div>

        {footer ? (
          <footer className="flex justify-end gap-2 px-5 pb-5">{footer}</footer>
        ) : null}
      </div>
    </div>
  )
}
