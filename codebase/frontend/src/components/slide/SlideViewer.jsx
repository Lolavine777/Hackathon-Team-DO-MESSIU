import { lazy, Suspense, useCallback, useState } from 'react'
import SlideToolbar from './SlideToolbar.jsx'
import SlidePreview from './SlidePreview.jsx'
import SlidePinLayer from './SlidePinLayer.jsx'
import Button from '../ui/Button.jsx'
import Callout from '../ui/Callout.jsx'
import IconButton from '../ui/IconButton.jsx'
import { useSession } from '../../state/SessionContext.jsx'
import { IconNext, IconPresent, IconPrev } from '../../lib/icons.js'

// pdf.js nặng gần bằng cả phần còn lại của app — chỉ tải khi thật sự mở tài liệu.
const PdfDocument = lazy(() => import('./PdfDocument.jsx'))

/** Khung xem tài liệu dùng chung cho cả học viên và giảng viên. */
export default function SlideViewer({ tools = [], footerRight }) {
  const { material, page, setPage } = useSession()
  const [mode, setMode] = useState('pdf')
  const [zoom, setZoom] = useState(100)
  // Lỗi được gắn với đúng URL gây ra nó. Nhờ vậy khi `/api/session` trả về và URL
  // đổi từ rỗng thành đường dẫn thật, lần hỏng cũ tự hết hiệu lực thay vì khoá luôn
  // khung xem ở "Bản dựng".
  const [failure, setFailure] = useState(null)

  const clamp = useCallback(
    (next) => setPage(Math.min(material.pages, Math.max(1, next))),
    [material.pages, setPage]
  )
  const failed = useCallback(
    (err) => {
      console.error('[SlideViewer] không mở được PDF:', err)
      setFailure({ url: material.url, message: err?.message ?? String(err) })
    },
    [material.url]
  )

  // Chưa có cấu hình thì chưa có URL — đưa chuỗi rỗng cho pdf.js là hỏng chắc chắn.
  const pending = !material.url
  const broken = Boolean(failure) && failure.url === material.url
  const asPdf = mode === 'pdf' && !broken && !pending
  const retry = () => {
    setFailure(null)
    setMode('pdf')
  }

  return (
    <section className="grid h-full min-h-0 grid-rows-[auto_1fr_auto] overflow-hidden rounded-[22px] border border-line bg-white shadow-card">
      <SlideToolbar
        mode={broken ? 'preview' : mode}
        onModeChange={(next) => (next === 'pdf' ? retry() : setMode(next))}
        zoom={zoom}
        onZoom={(d) => setZoom((z) => Math.min(200, Math.max(50, z + d)))}
        tools={tools}
      />

      {pending ? (
        <div className="grid min-h-0 place-items-center bg-[#EAF0F6] text-[13px] font-bold text-muted">
          Đang tải thông tin tài liệu…
        </div>
      ) : asPdf ? (
        <div className="relative min-h-0">
          <Suspense fallback={<div className="min-h-0 bg-[#EAF0F6]" />}>
            <PdfDocument
              url={material.url}
              pages={material.pages}
              page={page}
              zoom={zoom}
              onPageChange={clamp}
              onError={failed}
            />
          </Suspense>
          <SlidePinLayer />
        </div>
      ) : (
        <div className="relative min-h-0 overflow-auto bg-[#EAF0F6] p-4">
          {/* Không im lặng nuốt lỗi: nếu chỉ tự rơi về bản dựng thì nút "PDF gốc"
              trông như bấm không ăn, và không còn đường nào tới file gốc. */}
          {broken ? (
            <Callout tone="warning" title="Không mở được PDF trong trang:" className="mx-auto mb-3 max-w-[980px] bg-white">
              <span className="font-mono text-[12px]">{failure.message}</span>
              <br />
              Bản dựng bên dưới vẫn giữ đúng số trang nên checkpoint, câu hỏi và ghim không lệch.{' '}
              <button type="button" onClick={retry} className="font-extrabold text-primary underline">
                Thử mở lại
              </button>{' '}
              hoặc{' '}
              <a href={material.url} target="_blank" rel="noreferrer" className="font-extrabold text-primary underline">
                mở tài liệu trong tab mới
              </a>
              .
            </Callout>
          ) : null}
          <div
            className="mx-auto overflow-hidden rounded-[18px] border border-[#D4DEE8] bg-[#FFFDF8] shadow-[0_18px_36px_rgba(19,77,139,.14)]"
            style={{ width: `${zoom}%`, maxWidth: zoom <= 100 ? 980 : 'none' }}
          >
            <SlidePreview page={page} materialName={material.name} />
          </div>
          <SlidePinLayer />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 border-t border-line bg-white px-3.5 py-2.5">
        <Button variant="ghost" size="sm" onClick={() => clamp(page - 1)} disabled={page <= 1}>
          <IconPrev />
          Trang trước
        </Button>
        <Button variant="ghost" size="sm" onClick={() => clamp(page + 1)} disabled={page >= material.pages}>
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
            onChange={(e) => clamp(Number(e.target.value) || 1)}
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
