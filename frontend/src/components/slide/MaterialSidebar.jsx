import { useSession } from '../../state/SessionContext.jsx'
import { IconCheck, IconDoc, IconLibrary } from '../../lib/icons.js'

/**
 * Học liệu của phiên đang mở. Chỉ liệt kê tài liệu backend thực sự đang phục vụ —
 * cây môn học đầy đủ sẽ do LMS cung cấp khi tích hợp.
 */
export default function MaterialSidebar() {
  const { material, page, session } = useSession()

  return (
    <aside className="hidden min-h-0 overflow-y-auto border-r border-line bg-white px-4 py-5 xl:block">
      <div className="flex items-start gap-3 border-b border-line pb-4">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#EDF4FB] text-primary">
          <IconLibrary size={19} />
        </div>
        <div className="min-w-0">
          <div className="text-[16px] font-extrabold">Học liệu buổi học</div>
          <div className="mt-0.5 truncate text-xs text-muted">{session.title ?? 'Đang tải…'}</div>
        </div>
      </div>

      <section className="mt-4 overflow-hidden rounded-2xl border border-line bg-[#F8FAFD] shadow-soft">
        <div className="px-4 py-3.5 text-[11px] font-extrabold uppercase tracking-wide text-muted">
          Đang chiếu
        </div>

        <div className="mx-2.5 mb-2.5 flex items-center gap-3 rounded-2xl border border-[#9FC2E7] bg-white p-3 shadow-[inset_4px_0_0_#134D8B,0_6px_16px_rgba(19,77,139,.08)]">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] bg-[#EDF4FB] text-primary">
            <IconDoc size={17} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-bold">{material.name}</div>
            <div className="mt-0.5 text-[11px] text-muted">
              {material.pages} trang · đang xem trang {page}
            </div>
          </div>
          <IconCheck className="shrink-0 text-primary" />
        </div>
      </section>

      <p className="mt-4 px-1 text-[11px] leading-relaxed text-muted">
        Checkpoint, câu hỏi và ghim đều gắn theo số trang của tài liệu này.
      </p>
    </aside>
  )
}
