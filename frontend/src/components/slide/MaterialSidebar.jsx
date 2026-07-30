import { useState } from 'react'
import { COURSE_TREE } from '../../data/mockData.js'
import { useSession } from '../../state/SessionContext.jsx'
import {
  IconChapter,
  IconCheck,
  IconCollapse,
  IconDoc,
  IconExpand,
  IconLibrary,
} from '../../lib/icons.js'

function DocItem({ doc, page }) {
  return (
    <div
      className={[
        'mx-2.5 mb-2.5 flex cursor-pointer items-center gap-3 rounded-2xl border bg-white p-3 transition',
        'hover:-translate-y-px hover:shadow-soft',
        doc.active
          ? 'border-[#9FC2E7] shadow-[inset_4px_0_0_#134D8B,0_6px_16px_rgba(19,77,139,.08)]'
          : 'border-line',
      ].join(' ')}
    >
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] bg-[#EDF4FB] text-primary">
        <IconDoc size={17} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-bold">{doc.name}</div>
        <div className="mt-0.5 text-[11px] text-muted">
          {doc.pages} trang{doc.active ? ` · đang xem trang ${page}` : ''}
        </div>
      </div>
      {doc.active ? <IconCheck className="shrink-0 text-primary" /> : null}
    </div>
  )
}

export default function MaterialSidebar() {
  const { page } = useSession()
  const [open, setOpen] = useState(() => new Set(['day01']))

  const toggle = (id) =>
    setOpen((s) => {
      const next = new Set(s)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  return (
    <aside className="hidden min-h-0 overflow-y-auto border-r border-line bg-white px-4 py-5 xl:block">
      <div className="flex items-start gap-3 border-b border-line pb-4">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#EDF4FB] text-primary">
          <IconLibrary size={19} />
        </div>
        <div>
          <div className="text-[16px] font-extrabold">Học liệu môn học</div>
          <div className="mt-0.5 text-xs text-muted">Chương, slide và tài liệu đã upload</div>
        </div>
      </div>

      {COURSE_TREE.map((day) => {
        const expanded = open.has(day.id)
        return (
          <section
            key={day.id}
            className="mt-4 overflow-hidden rounded-2xl border border-line bg-[#F8FAFD] shadow-soft"
          >
            <button
              onClick={() => toggle(day.id)}
              className="flex w-full items-center justify-between px-4 py-3.5 text-left"
            >
              <div>
                <strong className="flex items-center gap-1.5 text-[14px]">
                  <IconChapter className="text-primary" size={15} />
                  {day.label}
                </strong>
                <div className="mt-0.5 text-[11px] text-muted">{day.meta}</div>
              </div>
              {day.status ? (
                <span className="rounded-full bg-[#E6F0FA] px-2.5 py-1.5 text-[10px] font-extrabold text-primary">
                  {day.status}
                </span>
              ) : (
                <span className="text-muted">{expanded ? <IconCollapse /> : <IconExpand />}</span>
              )}
            </button>

            {expanded && day.docs.length
              ? day.docs.map((doc) => <DocItem key={doc.id} doc={doc} page={page} />)
              : null}
          </section>
        )
      })}
    </aside>
  )
}
