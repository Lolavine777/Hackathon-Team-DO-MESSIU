import { IconSpinner } from '../../lib/icons.js'

/** Chờ có xoay — dùng cho tác vụ dài (gọi LLM mất 5–20 giây). */
export default function Spinner({ size = 16, className = '' }) {
  return <IconSpinner className={`animate-spin ${className}`} size={size} weight="bold" />
}
