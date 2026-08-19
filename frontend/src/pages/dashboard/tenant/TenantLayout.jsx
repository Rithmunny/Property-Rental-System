import { Outlet } from 'react-router-dom'
import { LayoutDashboard, Home as HomeIcon, CreditCard, ClipboardList, Heart, Search, MessageCircle, Bell } from 'lucide-react'
import DashboardShell from '@/components/dashboard/DashboardShell'

const MENU_ITEMS = [
  { to: '/dashboard/tenant', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/dashboard/tenant/my-rental', label: 'My Rental', icon: HomeIcon },
  { to: '/dashboard/tenant/payments', label: 'Payments', icon: CreditCard },
  { to: '/dashboard/tenant/requests', label: 'Requests', icon: ClipboardList },
  { to: '/dashboard/tenant/messages', label: 'Messages', icon: MessageCircle },
  { to: '/dashboard/tenant/alerts', label: 'Alerts', icon: Bell },
  { to: '/dashboard/tenant/saved', label: 'Saved Homes', icon: Heart },
]

const PROMO_CARD = {
  title: 'Find Your Next Home',
  description: 'Browse verified rentals across the country and save your favorites.',
  href: '/rent',
  cta: 'Browse Rentals',
  icon: Search,
}

export default function TenantLayout() {
  return (
    <DashboardShell roleLabel="Tenant" menuItems={MENU_ITEMS} promoCard={PROMO_CARD}>
      <Outlet />
    </DashboardShell>
  )
}
