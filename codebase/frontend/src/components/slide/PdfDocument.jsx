import { useEffect, useRef, useState } from 'react'
import PdfPage from './PdfPage.jsx'
import Spinner from '../ui/Spinner.jsx'
import { loadDocument } from '../../lib/pdf.js'
import usePageScrollSync from '../../state/usePageScrollSync.js'

const NEARBY = 2 // số trang vẽ thật ở mỗi bên trang đang xem

/**
 * Khung đọc PDF do app tự vẽ (pdf.js) thay vì nhúng trình xem của trình duyệt.
 * Nhờ tự vẽ mới biết người dùng đang kéo tới trang nào — đó là thứ mà checkpoint,
 * pulse và câu hỏi đều bám theo.
 */
export default function PdfDocument({ url, pages, page, zoom, onPageChange, onError }) {
  const scroller = useRef(null)
  const nodes = useRef([])
  const [doc, setDoc] = useState(null)
  const [ratio, setRatio] = useState(0.5625)
  const [box, setBox] = useState(0)

  useEffect(() => {
    if (!url) return undefined // chưa biết tài liệu thì chờ, đừng gọi pdf.js với chuỗi rỗng
    let alive = true
    loadDocument(url)
      .then(async (pdf) => {
        // Slide trong một bộ luôn cùng khổ giấy, nên lấy tỉ lệ trang 1 làm chuẩn
        // để dựng sẵn khung trống cho 47 trang còn lại.
        const viewport = (await pdf.getPage(1)).getViewport({ scale: 1 })
        if (!alive) return
        setRatio(viewport.height / viewport.width)
        setDoc(pdf)
      })
      .catch((err) => alive && onError?.(err))
    return () => {
      alive = false
    }
  }, [url, onError])

  useEffect(() => {
    const root = scroller.current
    if (!root) return undefined
    const measure = () => setBox(Math.max(240, root.clientWidth - 32))
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(root)
    return () => observer.disconnect()
  }, [])

  const count = doc?.numPages ?? pages ?? 1
  const width = Math.round((box * zoom) / 100)
  usePageScrollSync({ scroller, nodes, page, onPageChange, ready: Boolean(doc && box) })

  return (
    // `h-full` là bắt buộc: khung này nằm lồng trong một ô lưới chứ không phải chính ô đó,
    // nên nếu để cao tự nhiên thì nó dài bằng cả 48 trang và `overflow-auto` không bao giờ
    // có gì để cuộn — trang bị cắt cụt ở đáy khung.
    <div ref={scroller} className="relative h-full min-h-0 overflow-auto bg-[#EAF0F6] p-4">
      {!doc ? (
        // Đè lên chứ không chen vào dòng chảy: khung trống các trang đã dựng sẵn,
        // chèn thêm một khối nữa là vị trí cuộn nhảy ngay khi tài liệu mở xong.
        <div className="pointer-events-none absolute inset-x-0 top-6 z-10 flex items-center justify-center gap-2 text-[13px] font-bold text-muted">
          <Spinner />
          Đang mở tài liệu…
        </div>
      ) : null}

      <div className="grid gap-4">
        {Array.from({ length: count }, (_, index) => index + 1).map((number) => (
          <PdfPage
            key={number}
            doc={doc}
            number={number}
            width={width}
            ratio={ratio}
            render={Boolean(doc) && Math.abs(number - page) <= NEARBY}
            nodeRef={(el) => {
              nodes.current[number - 1] = el
            }}
          />
        ))}
      </div>
    </div>
  )
}
