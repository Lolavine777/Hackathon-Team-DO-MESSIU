export function CardTitle({ children, eyebrow, className = '' }) {
  return (
    <div className={`mb-3 flex items-center justify-between gap-3 ${className}`}>
      <span className="text-sm font-extrabold leading-tight">{children}</span>
      {eyebrow ? (
        <span className="eyebrow inline-flex shrink-0 items-center gap-1">{eyebrow}</span>
      ) : null}
    </div>
  )
}

export default function Card({ tone = 'plain', className = '', children, ...props }) {
  const tones = {
    plain: 'bg-white border-line',
    accent: 'bg-gradient-to-br from-[#F8FBFE] to-[#EEF5FB] border-[#CFE0EF]',
    alert: 'bg-gradient-to-br from-[#FDF4F4] to-white border-[#F1C2C4]',
    highlight: 'bg-white border-line border-l-4 border-l-primary',
  }
  return (
    <section
      className={[
        'mb-3 rounded-xl2 border p-4 shadow-soft',
        tones[tone] ?? tones.plain,
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </section>
  )
}
