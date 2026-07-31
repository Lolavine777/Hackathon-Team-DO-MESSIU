import { IconMaterial } from '../../lib/icons.js'

/**
 * Bản dựng thay thế khi trình duyệt không mở được PDF.
 * Không dựng lại nội dung slide — nội dung thật nằm trong tài liệu, không ở đây.
 */
export default function SlidePreview({ page, materialName }) {
  return (
    <div className="min-h-[560px] bg-gradient-to-b from-[#FFFDF8] to-[#FCFBF6] p-7">
      <div className="flex justify-between border-b border-[#ECE5D8] pb-3 text-[11px] font-extrabold tracking-wide text-[#8195AA]">
        <span>Trang {page}</span>
        <span className="truncate pl-4">{materialName}</span>
      </div>

      <div className="mt-6 grid min-h-[400px] place-items-center rounded-[22px] border border-dashed border-[#CFDCE8] bg-white/60 p-8 text-center">
        <div>
          <IconMaterial className="mx-auto text-[#9FB4C8]" size={40} />
          <p className="mt-4 text-[15px] font-extrabold text-primary">
            Không hiển thị được trang {page}
          </p>
          <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-muted">
            Trình duyệt chưa dựng được tài liệu. Mọi tương tác (checkpoint, pulse, câu hỏi, ghim)
            vẫn gắn đúng vào trang này.
          </p>
        </div>
      </div>
    </div>
  )
}
