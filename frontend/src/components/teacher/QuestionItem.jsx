import Chip from '../ui/Chip.jsx'
import Button from '../ui/Button.jsx'
import { IconCheckCircle } from '../../lib/icons.js'

const SCOPE_LABEL = {
  group: 'Nhóm câu tương tự',
  anonymous: 'Ẩn danh',
  private: 'Riêng tư',
}

export default function QuestionItem({ item, selected = false, onAnswer, onPin, onPrioritize }) {
  return (
    <div
      className={[
        'mt-2.5 rounded-2xl border bg-white p-3 transition hover:-translate-y-px hover:shadow-soft',
        selected ? 'border-[#8DB5D9] bg-[#F4F9FD]' : 'border-line',
      ].join(' ')}
    >
      <div className="mb-2 flex items-center justify-between gap-3 text-[11px] text-muted">
        <span className="truncate font-bold">
          {SCOPE_LABEL[item.scope] ?? item.author}
          {item.echo ? ` · ${item.echo} người đồng ý` : ''}
        </span>
        <span className="shrink-0">Trang {item.page}</span>
      </div>

      <p className="text-[13px] font-bold leading-relaxed">{item.text}</p>

      {item.status === 'answered' ? (
        <Chip tone="success" className="mt-2.5">
          <IconCheckCircle size={13} weight="fill" />
          Đã trả lời
        </Chip>
      ) : (
        <div className="mt-2.5 flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => onAnswer?.(item)}>
            {item.scope === 'private' ? 'Trả lời riêng' : 'Trả lời chung'}
          </Button>
          {onPin ? (
            <Button size="sm" variant="outline" onClick={() => onPin(item)}>
              Ghim cho lớp
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
