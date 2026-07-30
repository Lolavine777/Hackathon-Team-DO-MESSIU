const TONES = {
  live: 'bg-success shadow-[0_0_0_5px_rgba(31,157,104,.14)]',
  idle: 'bg-muted shadow-[0_0_0_5px_rgba(113,129,152,.12)]',
  alert: 'bg-secondary shadow-[0_0_0_5px_rgba(199,33,39,.14)]',
}

export default function LiveDot({ tone = 'live', pulse = true, className = '' }) {
  return (
    <span
      className={[
        'inline-block h-2 w-2 shrink-0 rounded-full',
        TONES[tone] ?? TONES.live,
        pulse && tone === 'live' ? 'animate-pulse' : '',
        className,
      ].join(' ')}
    />
  )
}
