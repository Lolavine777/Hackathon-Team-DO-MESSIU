import Chip from '../ui/Chip.jsx'
import Button from '../ui/Button.jsx'
import { useSession } from '../../state/SessionContext.jsx'
import { categoryMeta } from '../../lib/helpCategories.js'
import { IconCheckCircle, IconClaim, IconEscalate, IconPin } from '../../lib/icons.js'

const SCOPE_LABEL = {
  group: 'Nhóm câu tương tự',
  anonymous: 'Ẩn danh',
  private: 'Riêng tư',
}

export default function QuestionItem({ item, selected = false, onAnswer, onClaim, onPin, onPrioritize }) {
  const { helpCategories } = useSession()
  const category = categoryMeta(helpCategories, item.category)
  const escalated = item.status === 'escalated'

  return (
    <div
      className={[
        'mt-2.5 rounded-2xl border bg-white p-3 transition hover:-translate-y-px hover:shadow-soft',
        escalated ? 'border-[#E7A2A5] bg-[#FFF7F7]' : selected ? 'border-[#8DB5D9] bg-[#F4F9FD]' : 'border-line',
      ].join(' ')}
    >
      <div className="mb-2 flex items-center justify-between gap-3 text-[11px] text-muted">
        <span className="truncate font-bold">
          {SCOPE_LABEL[item.scope] ?? item.author}
          {item.echo ? ` · ${item.echo} người đồng ý` : ''}
        </span>
        <span className="shrink-0">
          Trang {item.page} · {item.time}
        </span>
      </div>

      <div className="mb-2 flex flex-wrap gap-1.5">
        {category ? (
          <Chip tone={category.tone}>
            <category.Icon size={12} weight="fill" />
            {category.label}
          </Chip>
        ) : null}
        {escalated ? (
          <Chip tone="hot">
            <IconEscalate size={12} weight="fill" />
            Vẫn kẹt · cần giảng viên
          </Chip>
        ) : null}
        {item.status === 'claimed' ? (
          <Chip tone="default">
            <IconClaim size={12} weight="fill" />
            Đang hỗ trợ
          </Chip>
        ) : null}
        {item.pinned ? (
          <Chip tone="warning">
            <IconPin size={12} weight="fill" />
            Đang ghim trên slide
          </Chip>
        ) : null}
      </div>

      <p className="text-[13px] font-bold leading-relaxed">{item.text}</p>

      {item.status === 'answered' ? (
        <Chip tone="success" className="mt-2.5">
          <IconCheckCircle size={13} weight="fill" />
          Đã trả lời
        </Chip>
      ) : item.status === 'resolved' ? (
        <Chip tone="success" className="mt-2.5">
          <IconCheckCircle size={13} weight="fill" />
          Học viên xác nhận đã hiểu
        </Chip>
      ) : (
        <div className="mt-2.5 flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => onAnswer?.(item)}>
            {item.scope === 'private' ? 'Trả lời riêng' : 'Trả lời chung'}
          </Button>
          {onClaim && item.status !== 'claimed' ? (
            <Button size="sm" variant="ghost" onClick={() => onClaim(item)}>
              Nhận hỗ trợ
            </Button>
          ) : null}
          {onPin && !item.pinned ? (
            <Button size="sm" variant="ghost" onClick={() => onPin(item)}>
              <IconPin size={13} weight="fill" />
              Ghim lên slide
            </Button>
          ) : null}
          {onPrioritize ? (
            <Button size="sm" variant="danger" onClick={() => onPrioritize(item)}>
              Đánh dấu ưu tiên
            </Button>
          ) : null}
        </div>
      )}
    </div>
  )
}
