import Chip from '../ui/Chip.jsx'

const TONES = { sure: 'success', unsure: 'warning', guess: 'hot' }

/**
 * Mức độ chắc chắn đi kèm câu trả lời — giúp phát hiện "đúng do đoán".
 */
export default function ConfidencePicker({ levels, value, onChange, disabled = false }) {
  return (
    <div>
      <div className="mb-2 text-[11px] font-extrabold uppercase tracking-wide text-muted">
        Bạn chắc chắn tới mức nào?
      </div>
      <div className="flex flex-wrap gap-2">
        {levels.map((level) => {
          const active = value === level.value
          return (
            <Chip
              key={level.value}
              as="button"
              type="button"
              disabled={disabled}
              tone={active ? (TONES[level.value] ?? 'default') : 'neutral'}
              className={active ? 'ring-2 ring-primary/20' : 'opacity-80'}
              onClick={() => onChange(level.value)}
            >
              {level.label}
            </Chip>
          )
        })}
      </div>
    </div>
  )
}
