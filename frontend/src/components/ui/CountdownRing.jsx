/** Đồng hồ đếm ngược của quiz đang mở (kiểu Kahoot). */
export default function CountdownRing({ remaining, total, size = 54 }) {
  const stroke = 6
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const ratio = total > 0 ? Math.max(0, Math.min(1, remaining / total)) : 0
  const color = ratio > 0.5 ? '#134D8B' : ratio > 0.2 ? '#F59E0B' : '#C72127'

  return (
    <svg width={size} height={size} className="-rotate-90 shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E7EEF6" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c - c * ratio}
        style={{ transition: 'stroke-dashoffset 1s linear' }}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        className="rotate-90 origin-center fill-ink text-[15px] font-extrabold"
      >
        {Math.max(0, Math.ceil(remaining))}
      </text>
    </svg>
  )
}
