import { useCallback, useEffect, useRef } from 'react'

const SETTLE_MS = 160 // cuộn dừng bao lâu thì mới chốt số trang
const QUIET_MS = 500 // khoảng lặng sau khi tự nhảy trang, để không báo ngược ra ngoài

/**
 * Nối hai chiều giữa vị trí cuộn và số trang đang dạy:
 * kéo slide → đổi số trang, và đổi số trang (nút, ô nhập, giảng viên lật slide) → nhảy tới slide đó.
 *
 * `nodes` là ref tới mảng DOM của từng trang; vùng cuộn phải `position: relative`
 * thì `offsetTop` mới đo được theo đúng hệ toạ độ của `scrollTop`.
 */
export default function usePageScrollSync({ scroller, nodes, page, onPageChange, ready }) {
  const visible = useRef(1)
  const quietUntil = useRef(0)
  const timer = useRef(null)

  const nearestPage = useCallback(() => {
    const root = scroller.current
    if (!root) return null
    const middle = root.scrollTop + root.clientHeight / 2
    let best = null
    let bestGap = Infinity
    nodes.current.forEach((node, index) => {
      if (!node) return
      const gap = Math.abs(node.offsetTop + node.offsetHeight / 2 - middle)
      if (gap < bestGap) {
        bestGap = gap
        best = index + 1
      }
    })
    return best
  }, [nodes, scroller])

  useEffect(() => {
    const root = scroller.current
    if (!root) return undefined

    const onScroll = () => {
      const found = nearestPage()
      if (found) visible.current = found
      if (Date.now() < quietUntil.current) return
      // Chỉ báo khi tay đã dừng: cuộn từ trang 1 tới 20 là một lần đổi trang, không phải 20 lần.
      clearTimeout(timer.current)
      timer.current = setTimeout(() => {
        if (visible.current && visible.current !== page) onPageChange(visible.current)
      }, SETTLE_MS)
    }

    root.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      root.removeEventListener('scroll', onScroll)
      clearTimeout(timer.current)
    }
  }, [nearestPage, onPageChange, page, scroller])

  useEffect(() => {
    const root = scroller.current
    const node = nodes.current[page - 1]
    if (!root || !node || visible.current === page) return
    quietUntil.current = Date.now() + QUIET_MS
    root.scrollTo({ top: Math.max(0, node.offsetTop - 12) })
    visible.current = page
  }, [nodes, page, ready, scroller])
}
