import { IconEmpty } from '../../lib/icons.js'

/** `icon` là một component icon Phosphor, ví dụ `icon={IconWaiting}`. */
export default function EmptyState({ icon: Icon = IconEmpty, title, hint }) {
  return (
    <div className="px-4 py-10 text-center text-muted">
      <div className="mb-2 flex justify-center opacity-60">
        <Icon size={30} weight="duotone" />
      </div>
      <div className="text-sm font-bold text-ink/70">{title}</div>
      {hint ? <div className="mt-1 text-xs">{hint}</div> : null}
    </div>
  )
}
