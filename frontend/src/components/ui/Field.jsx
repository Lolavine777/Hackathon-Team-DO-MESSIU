function Label({ children }) {
  if (!children) return null
  return <span className="mb-1.5 block text-[11px] font-extrabold text-muted">{children}</span>
}

export function TextField({ label, className = '', ...props }) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <input className={`field ${className}`} {...props} />
    </label>
  )
}

export function TextArea({ label, className = '', rows = 4, ...props }) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <textarea rows={rows} className={`field resize-y ${className}`} {...props} />
    </label>
  )
}

export function SelectField({ label, options = [], className = '', ...props }) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <select className={`field ${className}`} {...props}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export function RadioRow({ name, checked, onChange, children }) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5 text-[13px] text-[#4B5F73]">
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        className="mt-0.5 accent-[#134D8B]"
      />
      <span>{children}</span>
    </label>
  )
}
