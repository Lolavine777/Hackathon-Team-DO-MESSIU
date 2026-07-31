const TONES = {
  good: 'bg-[#ECF8F2] text-[#14724C] border-[#B9E4D1]',
  mid: 'bg-[#FFF7E8] text-[#966416] border-[#F1D08E]',
  bad: 'bg-[#FFF0F1] text-[#A61E24] border-[#EAB1B4]',
  info: 'bg-[#EDF4FB] text-primary border-[#CFE0EF]',
}

export default function Metric({ value, label, hint, tone = 'info' }) {
  return (
    <div className={`rounded-2xl border px-2 py-3 text-center ${TONES[tone] ?? TONES.info}`}>
      <strong className="block text-2xl leading-none">{value}</strong>
      <span className="mt-1.5 block text-[11px] font-extrabold">{label}</span>
      {hint ? <span className="mt-1 block text-[10px] font-semibold opacity-70">{hint}</span> : null}
    </div>
  )
}
