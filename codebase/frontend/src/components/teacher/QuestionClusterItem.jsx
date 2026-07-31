import { useState } from 'react'
import Chip from '../ui/Chip.jsx'
import Button from '../ui/Button.jsx'
import { useSession } from '../../state/SessionContext.jsx'
import { categoryMeta } from '../../lib/helpCategories.js'
import {
  IconGroupSize,
  IconExpand,
  IconCollapse,
  IconBroadcast,
  IconCheckCircle,
} from '../../lib/icons.js'

/**
 * Một nhóm câu hỏi đã gom. Bấm vào phần tóm tắt để bung ra đúng những câu gốc
 * học viên đã gửi — trợ giảng luôn đọc được nguyên văn trước khi trả lời.
 */
export default function QuestionClusterItem({ cluster, onAnswer, onBroadcast }) {
  const { questions, helpCategories } = useSession()
  const [open, setOpen] = useState(false)

  const members = cluster.questionIds
    .map((id) => questions.find((q) => q.id === id))
    .filter(Boolean)
  const multiple = cluster.count > 1

  return (
    <div className="mt-2.5 rounded-2xl border border-line bg-white p-3">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-start gap-2.5 text-left"
      >
        <Chip tone={multiple ? 'hot' : 'neutral'} className="mt-0.5 shrink-0">
          <IconGroupSize size={13} weight="fill" />
          {cluster.count}
        </Chip>
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] font-bold leading-relaxed">{cluster.summary}</span>
          <span className="mt-1 block text-[11px] text-muted">
            {cluster.topic ? `${cluster.topic} · ` : ''}
            Trang {cluster.pages.join(', ')} ·{' '}
            {open ? 'Ẩn câu hỏi gốc' : `Xem ${cluster.count} câu hỏi gốc`}
          </span>
        </span>
        {open ? (
          <IconCollapse size={16} className="mt-1 shrink-0 text-muted" />
        ) : (
          <IconExpand size={16} className="mt-1 shrink-0 text-muted" />
        )}
      </button>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {cluster.categories.map((id) => {
          const category = categoryMeta(helpCategories, id)
          return category ? (
            <Chip key={id} tone={category.tone}>
              <category.Icon size={12} weight="fill" />
              {category.label}
            </Chip>
          ) : null
        })}
        {cluster.answered ? (
          <Chip tone="success">
            <IconCheckCircle size={12} weight="fill" />
            Đã trả lời cả nhóm
          </Chip>
        ) : null}
      </div>

      {open ? (
        <div className="mt-2.5 grid gap-2 border-t border-line pt-2.5">
          {members.map((q) => (
            <div key={q.id} className="rounded-xl bg-subtle px-3 py-2.5">
              <div className="mb-1 flex items-center justify-between gap-3 text-[11px] text-muted">
                <span className="truncate font-bold">{q.author}</span>
                <span className="shrink-0">
                  Trang {q.page} · {q.time}
                </span>
              </div>
              <p className="text-[12px] font-bold leading-relaxed">{q.text}</p>
              {onAnswer && q.status !== 'answered' ? (
                <Button size="sm" variant="outline" className="mt-2" onClick={() => onAnswer(q)}>
                  Trả lời riêng bạn này
                </Button>
              ) : null}
            </div>
          ))}
          {members.length < cluster.count ? (
            <p className="text-[11px] text-muted">
              {cluster.count - members.length} câu trong nhóm đã được xử lý ở nơi khác.
            </p>
          ) : null}
        </div>
      ) : null}

      {!cluster.answered ? (
        <Button size="sm" className="mt-2.5" onClick={() => onBroadcast(cluster)}>
          <IconBroadcast size={15} weight="fill" />
          {multiple ? `Giải thích chung cho ${cluster.count} bạn` : 'Giải thích cho cả lớp'}
        </Button>
      ) : null}
    </div>
  )
}
