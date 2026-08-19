import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Building2, Users, Home as HomeIcon, CreditCard, LayoutDashboard, UserCheck } from 'lucide-react'
import * as usersApi from '@/api/users'
import DashboardShell from '@/components/dashboard/DashboardShell'

const MENU_ITEMS = [
  { to: '/dashboard/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/dashboard/admin/landlords', label: 'Landlords', icon: Building2 },
  { to: '/dashboard/admin/tenants', label: 'Tenants', icon: Users },
  { to: '/dashboard/admin/properties', label: 'Properties', icon: HomeIcon },
  { to: '/dashboard/admin/payments', label: 'Payments', icon: CreditCard },
]

export default function AdminLayout() {
  const location = useLocation()
  const [pendingCount, setPendingCount] = useState(null)

  useEffect(() => {
    usersApi
      .listLandlords()
      .then((landlords) => {
        setPendingCount(landlords.filter((l) => l.status === 'pending').length)
      })
      .catch(() => setPendingCount(0))
  }, [location.pathname])

  const count = pendingCount ?? 0
  const promoCard = {
    title: 'New Landlord Requests',
    description:
      count === 0
        ? 'No landlords awaiting verification.'
        : `${count} landlord${count === 1 ? '' : 's'} awaiting verification before they can list.`,
    href: '/dashboard/admin/landlords',
    cta: 'Review',
    icon: UserCheck,
  }

  return (
    <DashboardShell roleLabel="Admin" menuItems={MENU_ITEMS} promoCard={promoCard}>
      <Outlet />
    </DashboardShell>
  )
}
