import { Outlet } from 'react-router-dom'
import { Building2, Users, Home as HomeIcon, CreditCard, LayoutDashboard, UserCheck } from 'lucide-react'
import DashboardShell from '../../../components/dashboard/DashboardShell'

const MENU_ITEMS = [
  { to: '/dashboard/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/dashboard/admin/landlords', label: 'Landlords', icon: Building2 },
  { to: '/dashboard/admin/tenants', label: 'Tenants', icon: Users },
  { to: '/dashboard/admin/properties', label: 'Properties', icon: HomeIcon },
  { to: '/dashboard/admin/payments', label: 'Payments', icon: CreditCard },
]

const PROMO_CARD = {
  title: 'New Landlord Requests',
  description: '1 landlord is awaiting verification before they can list.',
  href: '/dashboard/admin/landlords',
  cta: 'Review',
  icon: UserCheck,
}

export default function AdminLayout() {
  return (
    <DashboardShell menuItems={MENU_ITEMS} promoCard={PROMO_CARD}>
      <Outlet />
    </DashboardShell>
  )
}
