const TONES = {
  info: 'bg-[#EDF4FB] border-l-primary text-[#41556A]',
  success: 'bg-[#EAF8F2] border-l-success text-[#156C49]',
  warning: 'bg-[#FFF7E8] border-l-warning text-[#8A5D14]',
  danger: 'bg-[#FFF0F1] border-l-secondary text-[#9B1E23]',
}

/** Khối gợi ý / nhận định của trợ lý. */
export default function Callout({ tone = 'info', title, className = '', children }) {
  return (
    <div
      className={[
        'rounded-2xl border-l-4 px-3.5 py-3 text-[13px] leading-relaxed',
        TONES[tone] ?? TONES.info,
        className,
      ].join(' ')}
    >
      {title ? <strong className="mr-1.5">{title}</strong> : null}
      {children}
    </div>
  )
}
