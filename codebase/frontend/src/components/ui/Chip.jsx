const TONES = {
  default: 'border-[#B8CDE2] bg-[#EDF4FB] text-primary',
  hot: 'border-[#E7A2A5] bg-[#FFF0F1] text-secondary',
  success: 'border-[#B7E4D0] bg-[#EAF8F2] text-[#14724C]',
  warning: 'border-[#F1D08E] bg-[#FFF7E8] text-[#966416]',
  neutral: 'border-line bg-subtle text-muted',
}

export default function Chip({ tone = 'default', as = 'span', className = '', children, ...props }) {
  const Tag = as
  return (
    <Tag
      className={[
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[11px] font-extrabold',
        as === 'button' ? 'transition hover:-translate-y-px hover:shadow-soft' : '',
        TONES[tone] ?? TONES.default,
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </Tag>
  )
}
