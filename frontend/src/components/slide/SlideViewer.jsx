import { useState } from 'react'
import SlideToolbar from './SlideToolbar.jsx'
import SlidePreview from './SlidePreview.jsx'
import Button from '../ui/Button.jsx'
import IconButton from '../ui/IconButton.jsx'
import { useSession } from '../../state/SessionContext.jsx'
import { IconNext, IconPresent, IconPrev } from '../../lib/icons.js'

/** Khung xem tài liệu dùng chung cho cả học viên và giảng viên. */
export default function SlideViewer({ tools = [], showNote = false, footerRight }) {
  const { material, page, setPage } = useSession()
  const [mode, setMode] = useState('pdf')
  const [zoom, setZoom] = useState(100)

  const go = (delta) => setPage(Math.min(material.pages, Math.max(1, page + delta)))

  return (
    <section className="grid min-h-0 grid-rows-[auto_1fr_auto] overflow-hidden rounded-[22px] border border-line bg-white shadow-card">
      <SlideToolbar
        mode={mode}
        onModeChange={setMode}
        zoom={zoom}
        onZoom={(d) => setZoom((z) => Math.min(200, Math.max(50, z + d)))}
        tools={tools}
      />

      <div className="min-h-0 overflow-auto bg-[#EAF0F6] p-4">
        <div
          className="mx-auto overflow-hidden rounded-[18px] border border-[#D4DEE8] bg-[#FFFDF8] shadow-[0_18px_36px_rgba(19,77,139,.14)]"
          style={{ width: `${zoom}%`, maxWidth: zoom <= 100 ? 980 : 'none' }}
        >
          {mode === 'pdf' ? (
            <object
              key={`${material.url}-${page}`}
              data={`${material.url}#page=${page}&view=FitH&toolbar=0`}
              type="application/pdf"
              className="block h-[640px] w-full bg-white"
            >
              <SlidePreview page={page} materialName={material.name} showNote={showNote} />
            </object>
          ) : (
            <SlidePreview page={page} materialName={material.name} showNote={showNote} />
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-line bg-white px-3.5 py-2.5">
        <Button variant="ghost" size="sm" onClick={() => go(-1)} disabled={page <= 1}>
          <IconPrev />
          Trang trước
        </Button>
        <Button variant="ghost" size="sm" onClick={() => go(1)} disabled={page >= material.pages}>
          Trang sau
          <IconNext />
        </Button>

        <div className="flex items-center gap-2 pl-2 text-[12px] font-bold text-muted">
          <span>Trang</span>
          <input
            type="number"
            min={1}
            max={material.pages}
            value={page}
            onChange={(e) => setPage(Math.min(material.pages, Math.max(1, Number(e.target.value) || 1)))}
            className="w-16 rounded-lg border border-line px-2 py-1 text-center font-extrabold text-primary outline-none"
          />
          <span>/ {material.pages}</span>
        </div>

        <div className="flex-1" />
        {footerRight ?? (
          <span className="text-[12px] font-bold text-muted">
            Ngữ cảnh tương tác: <strong className="text-primary">Trang {page}</strong>
          </span>
        )}
        <IconButton size="sm" title="Trình chiếu">
          <IconPresent size={18} />
        </IconButton>
      </div>
    </section>
  )
}
