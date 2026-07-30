import Button from '../ui/Button.jsx'
import IconButton from '../ui/IconButton.jsx'
import { IconZoomIn, IconZoomOut } from '../../lib/icons.js'

/**
 * Thanh công cụ của khung slide.
 * `tools` = mảng { id, label, onClick, variant } để mỗi role tự cắm hành động riêng.
 */
export default function SlideToolbar({ mode, onModeChange, zoom, onZoom, tools = [], right }) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-line bg-white/95 px-3.5 py-2.5">
      <div className="flex rounded-xl border border-line bg-white p-0.5">
        {[
          { id: 'pdf', label: 'PDF gốc' },
          { id: 'preview', label: 'Bản dựng' },
        ].map((m) => (
          <button
            key={m.id}
            onClick={() => onModeChange(m.id)}
            className={[
              'rounded-[10px] px-3 py-1.5 text-[12px] font-extrabold transition',
              mode === m.id ? 'bg-[#EAF3FC] text-primary' : 'text-muted hover:text-ink',
            ].join(' ')}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="mx-1 h-7 w-px bg-line" />

      <div className="flex items-center gap-1">
        <IconButton size="sm" onClick={() => onZoom(-10)} title="Thu nhỏ">
          <IconZoomOut size={17} />
        </IconButton>
        <span className="w-12 text-center text-[12px] font-extrabold text-muted">{zoom}%</span>
        <IconButton size="sm" onClick={() => onZoom(10)} title="Phóng to">
          <IconZoomIn size={17} />
        </IconButton>
      </div>

      {tools.length ? <div className="mx-1 h-7 w-px bg-line" /> : null}

      {tools.map((t) => (
        <Button key={t.id} size="sm" variant={t.variant ?? 'ghost'} onClick={t.onClick} disabled={t.disabled}>
          {t.label}
        </Button>
      ))}

      <div className="flex-1" />
      {right}
    </div>
  )
}
