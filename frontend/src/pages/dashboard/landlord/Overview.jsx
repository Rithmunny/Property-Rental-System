import { Link } from 'react-router-dom'
import { Building2, CheckCircle2, DollarSign, Clock3, Plus, FileText } from 'lucide-react'
import { useProperties } from '../../../context/PropertiesContext'
import { CONTRACTS, TENANTS, PAYMENT_REMINDERS } from '../../../data/landlord'
import StatCard from '../../../components/dashboard/StatCard'
import PageHeader from '../../../components/dashboard/PageHeader'
import StatusPill from '../../../components/dashboard/StatusPill'
import PaymentMethodBadge from '../../../components/dashboard/PaymentMethodBadge'
import PaymentDonut from '../../../components/dashboard/PaymentDonut'

const STATUS_STYLES = {
  active: { label: 'Active', tone: 'positive' },
  paid: { label: 'Paid', tone: 'positive' },
  'ending soon': { label: 'Ending Soon', tone: 'warning' },
  pending: { label: 'Pending', tone: 'warning' },
  expired: { label: 'Expired', tone: 'neutral' },
}

const LANDLORD_PROPERTY_IDS = [1, 2, 3]

export default function LandlordOverview() {
  const { properties } = useProperties()

  const listings = properties.filter((p) => LANDLORD_PROPERTY_IDS.includes(p.id) || p.landlordOwned)
  const activeContracts = CONTRACTS.filter((c) => c.status === 'active').length
  const monthlyRevenue = TENANTS.reduce((sum, t) => sum + t.rent, 0)
  const pendingPayments = TENANTS.filter((t) => t.status === 'pending').length
  const abaCount = TENANTS.filter((t) => t.paymentMethod === 'aba').length
  const cashCount = TENANTS.length - abaCount
  const maxPrice = Math.max(...listings.map((p) => p.price), 1)

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Manage your listings, contracts, and payments."
        actions={
          <Link
            to="/dashboard/landlord/listings"
            className="flex items-center gap-1.5 rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-forest-dark"
          >
            <Plus className="h-4 w-4" />
            Add Listing
          </Link>
        }
      />

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={Building2} label="Total Listings" value={listings.length} />
        <StatCard icon={CheckCircle2} label="Active Contracts" value={activeContracts} />
        <StatCard icon={DollarSign} label="Monthly Revenue" value={`$${monthlyRevenue}`} />
        <StatCard icon={Clock3} label="Pending Payments" value={pendingPayments} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:col-span-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">My Listings</h3>
            <Link to="/dashboard/landlord/listings" className="text-xs font-semibold text-forest hover:underline">
              View all
            </Link>
          </div>
          <p className="text-sm text-gray-500">Monthly rent across your listings</p>

          <div className="mt-5 flex flex-col gap-4">
            {listings.slice(0, 3).map((p) => (
              <div key={p.id}>
                <div className="flex items-center justify-between text-sm">
                  <span className="truncate font-medium text-gray-700">{p.title}</span>
                  <span className="shrink-0 font-semibold text-gray-900">${p.price}</span>
                </div>
                <div className="mt-1.5 h-2 rounded-full bg-gray-100">
                  <div
                    className="h-2 rounded-full bg-forest"
                    style={{ width: `${(p.price / maxPrice) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:col-span-1">
          <h3 className="font-semibold text-gray-900">Payment Reminders</h3>
          <p className="text-sm text-gray-500">Upcoming rent due dates</p>

          <div className="mt-4 flex flex-col gap-3">
            {PAYMENT_REMINDERS.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-xl bg-gray-50 px-3.5 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{r.tenant}</p>
                  <p className="text-xs text-gray-500">{r.property}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">${r.amount}</p>
                  <p className="text-xs text-amber-600">Due {r.dueDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:col-span-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Contracts</h3>
            <Link to="/dashboard/landlord/contracts" className="text-xs font-semibold text-forest hover:underline">
              View all
            </Link>
          </div>

          <div className="mt-3 flex flex-col divide-y divide-gray-100">
            {CONTRACTS.map((c) => {
              const property = properties.find((p) => p.id === c.propertyId)
              const status = STATUS_STYLES[c.status]
              return (
                <div key={c.id} className="flex items-center justify-between py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sage/60 text-forest">
                      <FileText className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">{property?.title}</p>
                      <p className="truncate text-xs text-gray-500">
                        {c.tenant} &middot; ends {c.endDate}
                      </p>
                    </div>
                  </div>
                  <StatusPill label={status.label} tone={status.tone} />
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Tenants</h3>
            <Link to="/dashboard/landlord/tenants" className="text-xs font-semibold text-forest hover:underline">
              View all
            </Link>
          </div>
          <p className="text-sm text-gray-500">Contact and payment status for each renter</p>

          <div className="mt-3 flex flex-col divide-y divide-gray-100">
            {TENANTS.map((t) => {
              const property = properties.find((p) => p.id === t.propertyId)
              const status = STATUS_STYLES[t.status]
              return (
                <div key={t.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sage/60 text-sm font-semibold text-forest">
                      {t.name.charAt(0)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">{t.name}</p>
                      <p className="truncate text-xs text-gray-500">{property?.title}</p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <PaymentMethodBadge method={t.paymentMethod} />
                    <StatusPill label={status.label} tone={status.tone} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:col-span-1">
          <h3 className="font-semibold text-gray-900">Payment Methods</h3>
          <p className="text-sm text-gray-500">How tenants are paying</p>
          <PaymentDonut aba={abaCount} cash={cashCount} />
        </div>
      </div>
    </div>
  )
}
