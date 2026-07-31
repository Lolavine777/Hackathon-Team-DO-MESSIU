import { useEffect, useRef } from 'react'

/**
 * Một trang PDF vẽ ra canvas.
 * Ngoài vùng đang xem chỉ giữ khung trống đúng chiều cao — 48 canvas cùng lúc là quá nặng,
 * mà bỏ hẳn khung thì thanh cuộn nhảy loạn khi trang được vẽ thêm.
 */
export default function PdfPage({ doc, number, width, ratio, render, nodeRef }) {
  const canvas = useRef(null)
  const height = Math.round(width * ratio)

  useEffect(() => {
    if (!doc || !render || !width) return undefined
    let cancelled = false
    let task = null

    doc.getPage(number).then((pdfPage) => {
      if (cancelled || !canvas.current) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const base = pdfPage.getViewport({ scale: 1 })
      const viewport = pdfPage.getViewport({ scale: (width / base.width) * dpr })
      const el = canvas.current
      el.width = viewport.width
      el.height = viewport.height
      el.style.height = `${Math.round(viewport.height / dpr)}px`
      task = pdfPage.render({ canvasContext: el.getContext('2d'), viewport })
      task.promise.catch(() => {}) // huỷ giữa chừng khi cuộn nhanh là chuyện bình thường
    })

    return () => {
      cancelled = true
      task?.cancel()
    }
  }, [doc, number, width, render])

  return (
    <div
      ref={nodeRef}
      data-page={number}
      className="relative mx-auto overflow-hidden rounded-lg bg-white shadow-[0_3px_12px_rgba(19,77,139,.12)]"
      style={{ width }}
    >
      {render ? (
        <canvas ref={canvas} className="block w-full" style={{ height }} />
      ) : (
        <div className="grid place-items-center text-[12px] font-bold text-muted" style={{ height }}>
          Trang {number}
        </div>
      )}
      <span className="absolute right-2 top-2 rounded-md bg-black/40 px-1.5 py-0.5 text-[10px] font-extrabold text-white">
        {number}
      </span>
    </div>
  )
}
