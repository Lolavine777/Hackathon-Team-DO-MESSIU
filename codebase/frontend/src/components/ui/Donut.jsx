/** Vòng tròn tỷ lệ (dùng cho tỷ lệ đúng / tỷ lệ tham gia). */
export default function Donut({ value = 0, size = 92, stroke = 11, label, tone }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)))
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const color = tone ?? (pct >= 70 ? '#1F9D68' : pct >= 50 ? '#F59E0B' : '#C72127')

  return (
    <div className="flex flex-col items-center gap-1.5">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#EEF3F8" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * pct) / 100}
          className="transition-[stroke-dashoffset] duration-700"
        />
        <text
          x="50%"
          y="50%"
          dominantBaseline="central"
          textAnchor="middle"
          className="rotate-90 origin-center fill-ink text-[19px] font-extrabold"
        >
          {pct}%
        </text>
      </svg>
      {label ? <span className="text-[11px] font-extrabold text-muted">{label}</span> : null}
    </div>
  )
}
