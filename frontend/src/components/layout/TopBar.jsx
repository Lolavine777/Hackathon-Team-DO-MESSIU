import { Brand } from './BrandMark.jsx'
import IconButton from '../ui/IconButton.jsx'
import { useAuth } from '../../state/AuthContext.jsx'
import { IconLogout } from '../../lib/icons.js'

export default function TopBar({ title, subtitle, icon, badge, actions }) {
  const { user, logout } = useAuth()

  return (
    <header className="z-30 flex h-[72px] shrink-0 items-center gap-4 border-b border-line bg-white px-5 shadow-[0_3px_12px_rgba(19,77,139,.05)]">
      <Brand className="shrink-0 border-r border-line pr-4" />

      <div className="flex min-w-0 flex-1 items-center gap-3">
        {icon ? (
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#EDF4FB] text-primary">
            {icon}
          </div>
        ) : null}
        <div className="min-w-0">
          <div className="truncate text-[15px] font-extrabold">{title}</div>
          {subtitle ? <div className="mt-0.5 truncate text-xs text-muted">{subtitle}</div> : null}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2.5">
        {badge}
        {actions}
        {user ? (
          <div className="hidden items-center gap-2.5 border-l border-line pl-3 md:flex">
            <div className="text-right">
              <div className="text-[13px] font-bold leading-tight">{user.name}</div>
              <div className="text-[11px] capitalize text-muted">{user.role}</div>
            </div>
            <IconButton size="sm" title="Đăng xuất" onClick={logout}>
              <IconLogout size={18} />
            </IconButton>
          </div>
        ) : null}
      </div>
    </header>
  )
}
