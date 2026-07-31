import IconButton from '../ui/IconButton.jsx'
import { TextField } from '../ui/Field.jsx'
import { IconCheck, IconDelete } from '../../lib/icons.js'

/** Một phương án trong trình soạn: nội dung, đánh dấu đáp án đúng, nhãn lỗi nhận thức. */
export default function CheckpointEditorOption({ option, index, canDelete, onChange, onPick, onDelete }) {
  const key = String.fromCharCode(65 + index)

  return (
    <div
      className={[
        'rounded-2xl border p-2.5',
        option.correct ? 'border-success/40 bg-[#F3FBF7]' : 'border-line bg-white',
      ].join(' ')}
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPick}
          title="Đặt làm đáp án đúng"
          className={[
            'flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[11px] font-extrabold transition',
            option.correct
              ? 'border-success bg-success text-white'
              : 'border-line bg-white text-muted hover:border-primary hover:text-primary',
          ].join(' ')}
        >
          {option.correct ? <IconCheck size={13} weight="bold" /> : key}
        </button>

        <input
          className="field flex-1 py-1.5 text-[13px]"
          value={option.text}
          placeholder={`Nội dung phương án ${key}`}
          onChange={(event) => onChange({ text: event.target.value })}
        />

        <IconButton size="sm" disabled={!canDelete} onClick={onDelete} aria-label="Xoá phương án">
          <IconDelete size={15} />
        </IconButton>
      </div>

      {!option.correct ? (
        <div className="mt-2 pl-8">
          <TextField
            label="Lỗi nhận thức đứng sau phương án này"
            className="py-1.5 text-[12px]"
            value={option.misconceptionLabel}
            placeholder="Ví dụ: Coi tính năng là job"
            onChange={(event) => onChange({ misconceptionLabel: event.target.value })}
          />
        </div>
      ) : null}
    </div>
  )
}
