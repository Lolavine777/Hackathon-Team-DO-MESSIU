const TONES = {
  correct: 'bg-success',
  wrong: 'bg-secondary',
  neutral: 'bg-primary-soft',
  primary: 'bg-primary',
}

/** Một dòng phân bố đáp án: nhãn - thanh tỷ lệ - số liệu. */
export default function BarStat({ label, count, total, tone = 'neutral', suffix, badge }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0

  return (
    <div className="py-1.5">
      <div className="mb-1 flex items-center justify-between gap-3 text-[12px]">
        <span className="flex min-w-0 items-center gap-2 font-bold text-ink">
          <span className="truncate">{label}</span>
          {badge}
        </span>
        <span className="shrink-0 font-extrabold text-muted">
          {pct}% {suffix ?? `· ${count}`}
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-subtle">
        <div
          className={`h-full origin-left rounded-full transition-[width] duration-500 ${TONES[tone] ?? TONES.neutral}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
