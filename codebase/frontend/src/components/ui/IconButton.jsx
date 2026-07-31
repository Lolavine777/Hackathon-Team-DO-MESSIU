const SIZES = {
  sm: 'h-9 w-9 text-sm',
  md: 'h-10 w-10 text-base',
  lg: 'h-11 w-11 text-lg',
}

export default function IconButton({ size = 'md', active = false, className = '', children, ...props }) {
  return (
    <button
      className={[
        'grid place-items-center rounded-xl border border-line bg-white text-primary shadow-soft',
        'transition hover:-translate-y-px hover:shadow-card active:translate-y-px',
        'disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-soft',
        active ? 'bg-[#EAF3FC] border-[#AAC8E5]' : '',
        SIZES[size] ?? SIZES.md,
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  )
}
