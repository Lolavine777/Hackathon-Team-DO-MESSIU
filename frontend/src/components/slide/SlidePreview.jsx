import { SLIDES } from '../../data/mockData.js'
import { IconShapeCircle } from '../../lib/icons.js'

const FALLBACK = {
  eyebrow: 'JTBD PLAYBOOK',
  title: 'Strategyn JTBD Playbook',
  subtitle: 'Nội dung slide của trang này.',
  note: ['Chưa có ghi chú giảng dạy cho trang này.'],
}

/** Bản dựng slide (dùng khi trình duyệt không nhúng được PDF, hoặc để xem nhanh). */
export default function SlidePreview({ page, materialName, showNote = false }) {
  const slide = SLIDES[page] ?? FALLBACK

  return (
    <div className="min-h-[560px] bg-gradient-to-b from-[#FFFDF8] to-[#FCFBF6] p-7">
      <div className="flex justify-between border-b border-[#ECE5D8] pb-3 text-[11px] font-extrabold tracking-wide text-[#8195AA]">
        <span>Trang {page}</span>
        <span className="truncate pl-4">{materialName}</span>
      </div>

      <div className={`mt-6 grid gap-6 ${showNote ? 'lg:grid-cols-[1.15fr_.85fr]' : ''}`}>
        <div className="relative min-h-[400px] overflow-hidden rounded-[22px] bg-gradient-to-br from-[#CFE6DA] to-[#AFCFC0] p-8 shadow-[0_12px_25px_rgba(55,104,87,.14)]">
          <div className="text-[11px] font-extrabold text-[#2F5145]">{slide.eyebrow}</div>
          <h1 className="mb-2 mt-24 text-[34px] font-extrabold leading-tight text-[#17342A]">
            {slide.title}
          </h1>
          <p className="max-w-lg leading-relaxed text-[#3D5B50]">{slide.subtitle}</p>
          <div className="absolute bottom-7 left-8 text-xs text-[#3D5B50]">
            Nguồn: Strategyn JTBD Playbook
          </div>
          <div className="pointer-events-none absolute inset-0 grid -rotate-[24deg] place-items-center text-2xl font-black tracking-[.13em] text-[rgba(27,72,83,.10)]">
            VLEARN MATERIAL
          </div>
        </div>

        {showNote ? (
          <aside className="rounded-[18px] border border-dashed border-[#BED0E0] bg-white/60 p-5 leading-relaxed text-[#55677A]">
            <strong className="text-primary">Gợi ý giảng dạy</strong>
            <ul className="mt-3 space-y-2 text-[13px]">
              {slide.note.map((line) => (
                <li key={line} className="flex gap-2">
                  <IconShapeCircle className="mt-1.5 shrink-0 text-primary" size={6} weight="fill" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 text-[11px] text-muted">Ghi chú này chỉ giảng viên nhìn thấy.</div>
          </aside>
        ) : null}
      </div>
    </div>
  )
}
