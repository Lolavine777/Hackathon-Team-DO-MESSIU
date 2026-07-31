const BASE =
  'inline-flex items-center justify-center gap-2 rounded-xl font-extrabold transition ' +
  'disabled:cursor-not-allowed disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none'

const VARIANTS = {
  primary:
    'text-white bg-gradient-to-b from-primary-light to-primary shadow-btn ' +
    'hover:-translate-y-px active:translate-y-[3px] active:shadow-[0_1px_0_#0F3F73]',
  secondary:
    'text-white bg-gradient-to-b from-[#D83E44] to-secondary shadow-btn-red ' +
    'hover:-translate-y-px active:translate-y-[3px] active:shadow-[0_1px_0_#98191E]',
  ghost:
    'text-primary bg-[#EDF4FB] border border-[#D5E3F0] hover:-translate-y-px hover:shadow-soft',
  outline:
    'text-primary bg-white border border-line hover:-translate-y-px hover:shadow-soft',
  danger: 'text-secondary bg-[#FFF0F1] border border-[#E9B0B3] hover:-translate-y-px',
  quiet: 'text-muted bg-transparent hover:bg-subtle hover:text-ink',
}

const SIZES = {
  sm: 'px-2.5 py-1.5 text-[11px]',
  md: 'px-3.5 py-2.5 text-sm',
  lg: 'px-5 py-3 text-[15px]',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  active = false,
  className = '',
  children,
  ...props
}) {
  return (
    <button
      className={[
        BASE,
        VARIANTS[variant] ?? VARIANTS.primary,
        SIZES[size] ?? SIZES.md,
        active ? 'ring-2 ring-primary/25' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  )
}
