export default function Tabs({ items, value, onChange, className = '' }) {
  return (
    <div
      className={`grid gap-2 bg-white px-3 pt-2.5 ${className}`}
      style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
      role="tablist"
    >
      {items.map((item) => {
        const active = item.id === value
        return (
          <button
            key={item.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.id)}
            className={[
              'truncate rounded-xl px-2 py-2.5 text-[13px] font-extrabold transition',
              active ? 'bg-[#EAF3FC] text-primary' : 'text-muted hover:text-ink',
            ].join(' ')}
          >
            {item.label}
            {item.badge != null ? (
              <span className={active ? 'text-primary/70' : 'text-muted'}> · {item.badge}</span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
