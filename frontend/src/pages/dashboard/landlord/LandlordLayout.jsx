import { Outlet } from 'react-router-dom'
import { Building2, FileText, CreditCard, Users, LayoutDashboard, Plus, Inbox, MessageCircle, Table2 } from 'lucide-react'
import DashboardShell from '@/components/dashboard/DashboardShell'

const MENU_ITEMS = [
  { to: '/dashboard/landlord', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/dashboard/landlord/listings', label: 'Listings', icon: Building2 },
  { to: '/dashboard/landlord/requests', label: 'Requests', icon: Inbox },
  { to: '/dashboard/landlord/messages', label: 'Messages', icon: MessageCircle },
  { to: '/dashboard/landlord/contracts', label: 'Contracts', icon: FileText },
  { to: '/dashboard/landlord/payments', label: 'Payments', icon: CreditCard },
  { to: '/dashboard/landlord/sheet', label: 'Sheet', icon: Table2 },
  { to: '/dashboard/landlord/tenants', label: 'Tenants', icon: Users },
]

const PROMO_CARD = {
  title: 'List a New Property',
  description: 'Reach more tenants by adding another rental to your portfolio.',
  href: '/dashboard/landlord/listings',
  cta: 'Add Listing',
  icon: Plus,
}

export default function LandlordLayout() {
  return (
    <DashboardShell roleLabel="Landlord" menuItems={MENU_ITEMS} promoCard={PROMO_CARD}>
      <Outlet />
    </DashboardShell>
  )
}
