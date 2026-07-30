import { useState } from 'react'
import Card, { CardTitle } from '../ui/Card.jsx'
import Button from '../ui/Button.jsx'
import Chip from '../ui/Chip.jsx'

/**
 * Hint theo đúng lỗi mình mắc, mở dần từng tầng — không đưa đáp án cuối.
 * Chỉ hiển thị cho học viên đã chọn đúng phương án gây hiểu nhầm này.
 */
export default function HintCard({ hint }) {
  const [level, setLevel] = useState(1)
  const tiers = hint.tiers.slice(0, level)
  const hasMore = level < hint.tiers.length

  return (
    <Card tone="highlight">
      <CardTitle eyebrow="Gợi ý riêng">Giảng viên gửi gợi ý cho lựa chọn {hint.optionKey}</CardTitle>

      <Chip tone="warning" className="mb-2">
        {hint.label}
      </Chip>

      <ol className="grid gap-2">
        {tiers.map((text, i) => (
          <li key={text} className="rounded-2xl bg-[#F7FAFD] px-3 py-2.5 text-[13px] leading-relaxed">
            <span className="mr-1.5 font-extrabold text-primary">Tầng {i + 1}.</span>
            {text}
          </li>
        ))}
      </ol>

      {hasMore ? (
        <Button size="sm" variant="ghost" className="mt-3" onClick={() => setLevel(level + 1)}>
          Vẫn chưa rõ — mở gợi ý sâu hơn
        </Button>
      ) : (
        <p className="mt-3 text-[11px] text-muted">
          Đã mở hết gợi ý. Hãy thử giải thích lại bằng lời của bạn trước khi xem đáp án.
        </p>
      )}
    </Card>
  )
}
