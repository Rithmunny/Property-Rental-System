import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  Bell,
  Search,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { useAlerts } from '@/context/AlertsContext'
import BrandLogo from '@/components/common/BrandLogo'
import ThemeToggle from '@/components/common/ThemeToggle'
import { dashboardPath } from '@/utils/dashboard'

const ROLE_LABELS = {
  tenant: 'Tenant',
  landlord: 'Landlord',
  admin: 'Admin',
  super_admin: 'Super Admin',
}

export default function DashboardShell({ roleLabel, title, subtitle, actions, menuItems, promoCard, children }) {
  const { user, logout } = useAuth()
  const { showToast } = useToast()
  const { alerts, unreadCount, markSeen } = useAlerts()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [alertsOpen, setAlertsOpen] = useState(false)
  const alertsRef = useRef(null)
  const [activeHref, setActiveHref] = useState(() => menuItems.find((item) => item.href)?.href)

  const badgeLabel = roleLabel || ROLE_LABELS[user?.role] || 'User'

  useEffect(() => {
    if (!alertsOpen) return
    const onPointer = (e) => {
      if (alertsRef.current && !alertsRef.current.contains(e.target)) setAlertsOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    return () => document.removeEventListener('mousedown', onPointer)
  }, [alertsOpen])

  useEffect(() => {
    const sections = menuItems
      .filter((item) => item.href)
      .map((item) => document.getElementById(item.href.replace('#', '')))
      .filter(Boolean)
    if (sections.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting)
        if (visible) setActiveHref(`#${visible.target.id}`)
      },
      { rootMargin: '-15% 0px -70% 0px', threshold: 0 }
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [menuItems])

  const settingsTo = `${dashboardPath(user?.role)}/settings`

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const comingSoon = () => showToast('Coming soon')

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
      isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
    }`

  return (
    <div className="flex min-h-screen bg-muted">
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-border bg-card p-5 transition-transform lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center text-lg font-bold text-foreground">
            <BrandLogo className="h-9 w-auto" />
          </Link>
          <button className="lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close menu">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <p className="mt-8 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Menu</p>
        <nav className="mt-2 flex flex-col gap-1">
          {menuItems.map((item) =>
            item.to ? (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMobileOpen(false)}
                className={navLinkClass}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ) : (
              <a
                key={item.href}
                href={item.href}
                onClick={() => {
                  setMobileOpen(false)
                  setActiveHref(item.href)
                }}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  activeHref === item.href
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </a>
            )
          )}
        </nav>

        <p className="mt-6 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">General</p>
        <nav className="mt-2 flex flex-col gap-1">
          <NavLink
            to={settingsTo}
            onClick={() => setMobileOpen(false)}
            className={navLinkClass}
          >
            <Settings className="h-4 w-4" />
            Settings
          </NavLink>
          <button
            type="button"
            onClick={comingSoon}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <HelpCircle className="h-4 w-4" />
            Help
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </nav>

        {promoCard && (
          <div className="mt-auto overflow-hidden rounded-2xl bg-foreground p-5">
            <p className="text-sm font-semibold text-background">{promoCard.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-background/70">{promoCard.description}</p>
            {promoCard.href.startsWith('#') ? (
              <a
                href={promoCard.href}
                onClick={() => setMobileOpen(false)}
                className="mt-4 flex w-fit items-center gap-1.5 rounded-full bg-background px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted"
              >
                <promoCard.icon className="h-3.5 w-3.5" />
                {promoCard.cta}
              </a>
            ) : (
              <Link
                to={promoCard.href}
                onClick={() => setMobileOpen(false)}
                className="mt-4 flex w-fit items-center gap-1.5 rounded-full bg-background px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted"
              >
                <promoCard.icon className="h-3.5 w-3.5" />
                {promoCard.cta}
              </Link>
            )}
          </div>
        )}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-border bg-card px-4 py-3 sm:px-6 lg:px-8">
          <button className="lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu className="h-5 w-5 text-muted-foreground" />
          </button>

          <button
            type="button"
            onClick={comingSoon}
            className="hidden max-w-xs flex-1 items-center gap-2 rounded-full border border-border px-4 py-2 text-left text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground sm:flex"
          >
            <Search className="h-4 w-4" />
            Search
          </button>

          <div className="ml-auto flex items-center gap-3 sm:gap-4">
            <ThemeToggle />
            <div className="relative" ref={alertsRef}>
              <button
                type="button"
                onClick={() => setAlertsOpen((open) => !open)}
                aria-label="Notifications"
                className="relative text-muted-foreground hover:text-foreground"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                    {unreadCount}
                  </span>
                )}
              </button>
              {alertsOpen && (
                <div className="absolute right-0 z-50 mt-2 w-80 rounded-2xl border border-border bg-card p-3 shadow-lg">
                  <p className="text-sm font-semibold text-foreground">Listing alerts</p>
                  {alerts.length === 0 ? (
                    <p className="mt-2 text-sm text-muted-foreground">No new matches right now.</p>
                  ) : (
                    <div className="mt-2 flex max-h-72 flex-col gap-3 overflow-y-auto">
                      {alerts.map(({ search, matches }) => (
                        <div key={search.id} className="rounded-xl bg-muted p-2.5">
                          {matches.slice(0, 3).map((property) => (
                            <Link
                              key={property.id}
                              to={`/listings/${property.id}`}
                              onClick={() => setAlertsOpen(false)}
                              className="block py-1 text-sm text-foreground hover:text-primary"
                            >
                              {property.title}
                            </Link>
                          ))}
                          <button
                            type="button"
                            onClick={() => markSeen(search.id)}
                            className="mt-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
                          >
                            Mark as seen
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {user?.role === 'tenant' && (
                    <Link
                      to="/dashboard/tenant/alerts"
                      onClick={() => setAlertsOpen(false)}
                      className="mt-3 block text-center text-xs font-semibold text-primary hover:underline"
                    >
                      Manage saved searches
                    </Link>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {(user?.name || 'U').charAt(0).toUpperCase()}
              </span>
              <div className="hidden sm:block">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{user?.name}</p>
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-secondary-foreground">
                    {badgeLabel}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-secondary-foreground sm:hidden">
                {badgeLabel}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {title && (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">{title}</h1>
                {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
              </div>
              {actions}
            </div>
          )}

          <div className={title ? 'mt-6' : ''}>{children}</div>
        </main>
      </div>
    </div>
  )
}
