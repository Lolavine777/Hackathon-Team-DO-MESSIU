import {
  IconCheck,
  IconShapeCircle,
  IconShapeDiamond,
  IconShapeSparkle,
  IconShapeSquare,
  IconShapeStar,
  IconShapeTriangle,
} from '../../lib/icons.js'

const SHAPES = [
  IconShapeTriangle,
  IconShapeDiamond,
  IconShapeCircle,
  IconShapeSquare,
  IconShapeStar,
  IconShapeSparkle,
]
const ACCENTS = [
  'bg-primary text-white',
  'bg-primary-light text-white',
  'bg-primary-soft text-white',
  'bg-secondary text-white',
  'bg-warning text-white',
  'bg-success text-white',
]

/** Một phương án trả lời — dùng chung cho học viên (chọn) và giảng viên (xem phân bố). */
export default function QuizOption({
  index = 0,
  optionKey,
  text,
  selected = false,
  revealed = false,
  isCorrect = false,
  count = 0,
  total = 0,
  showStats = false,
  disabled = false,
  onClick,
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  const Shape = SHAPES[index % SHAPES.length]

  let frame = 'border-line bg-white hover:border-[#9ABBDD] hover:bg-[#F5F9FD]'
  if (selected && !revealed) frame = 'border-primary bg-[#EAF3FC] ring-2 ring-primary/20'
  if (revealed && isCorrect) frame = 'border-[#72C7A1] bg-[#EAF8F2]'
  if (revealed && selected && !isCorrect) frame = 'border-[#E69B9F] bg-[#FFF0F1]'
  if (revealed && !selected && !isCorrect) frame = 'border-line bg-white opacity-70'

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        'relative w-full overflow-hidden rounded-2xl border p-3 text-left transition',
        'disabled:cursor-default',
        !disabled ? 'hover:-translate-y-px' : '',
        frame,
      ].join(' ')}
    >
      {showStats ? (
        <span
          className={`absolute inset-y-0 left-0 z-0 transition-[width] duration-500 ${
            isCorrect ? 'bg-success/10' : 'bg-primary/[.07]'
          }`}
          style={{ width: `${pct}%` }}
        />
      ) : null}

      <span className="relative z-10 flex items-center gap-3">
        <span
          className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl ${ACCENTS[index % ACCENTS.length]}`}
        >
          <Shape size={15} weight="fill" />
        </span>

        <span className="min-w-0 flex-1 text-[13px] font-semibold leading-snug">
          <span className="mr-1 font-extrabold text-muted">{optionKey}.</span>
          {text}
        </span>

        {showStats ? (
          <span className="shrink-0 text-right">
            <span className="block text-[15px] font-extrabold">{pct}%</span>
            <span className="block text-[10px] font-bold text-muted">{count} chọn</span>
          </span>
        ) : null}

        {revealed && isCorrect && !showStats ? (
          <IconCheck className="shrink-0 text-success" size={18} />
        ) : null}
      </span>
    </button>
  )
}
