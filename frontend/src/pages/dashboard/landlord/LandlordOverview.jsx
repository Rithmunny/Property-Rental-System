import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, CheckCircle2, DollarSign, Send, Plus, FileText } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useProperties } from '@/context/PropertiesContext'
import { useRequests } from '@/context/RequestsContext'
import * as rentalsApi from '@/api/rentals'
import * as paymentsApi from '@/api/payments'
import { isLandlordListing } from '@/utils/dashboard'
import StatCard from '@/components/dashboard/StatCard'
import PageHeader from '@/components/dashboard/PageHeader'
import StatusPill from '@/components/dashboard/StatusPill'
import PaymentMethodBadge from '@/components/dashboard/PaymentMethodBadge'
import PaymentDonut from '@/components/dashboard/PaymentDonut'
import SkeletonRow from '@/components/common/SkeletonRow'

const STATUS_STYLES = {
  active: { label: 'Active', tone: 'positive' },
  paid: { label: 'Paid', tone: 'positive' },
  'ending soon': { label: 'Ending Soon', tone: 'warning' },
  pending: { label: 'Pending', tone: 'warning' },
  expired: { label: 'Expired', tone: 'neutral' },
}

export default function LandlordOverview() {
  const { user } = useAuth()
  const { properties } = useProperties()
  const { inbox, loading: requestsLoading } = useRequests()
  const [contracts, setContracts] = useState([])
  const [paymentData, setPaymentData] = useState(null)
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    Promise.all([rentalsApi.listContracts(), paymentsApi.getPayments('landlord')])
      .then(([c, p]) => {
        setContracts(c)
        setPaymentData(p)
      })
      .finally(() => setDataLoading(false))
  }, [])

  const loading = dataLoading || requestsLoading
  const tenants = paymentData?.tenants ?? []
  const reminders = paymentData?.reminders ?? []
  const listings = properties.filter((p) => isLandlordListing(p, user?.name))
  const activeContracts = contracts.filter((c) => c.status === 'active').length
  const monthlyRevenue = tenants.reduce((sum, t) => sum + t.rent, 0)
  const pendingRequests = inbox.filter((r) => r.status === 'pending').length
  const abaCount = tenants.filter((t) => t.paymentMethod === 'aba').length
  const cashCount = tenants.length - abaCount
  const maxPrice = Math.max(...listings.map((p) => p.price), 1)

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Manage your listings, contracts, and payments."
        actions={
          <Link
            to="/dashboard/landlord/listings"
            className="flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add Listing
          </Link>
        }
      />

      {loading ? (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-border bg-card p-5">
              <div className="h-4 w-20 rounded bg-gray-200" />
              <div className="mt-3 h-8 w-16 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard icon={Building2} label="Total Listings" value={listings.length} />
          <StatCard icon={CheckCircle2} label="Active Contracts" value={activeContracts} />
          <StatCard icon={DollarSign} label="Monthly Revenue" value={`$${monthlyRevenue}`} />
          <StatCard icon={Send} label="Pending Requests" value={pendingRequests} />
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 lg:col-span-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">My Listings</h3>
            <Link to="/dashboard/landlord/listings" className="text-xs font-semibold text-primary hover:underline">
              View all
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">Monthly rent across your listings</p>

          {loading ? (
            <div className="mt-5 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse space-y-2">
                  <div className="h-4 w-full rounded bg-gray-200" />
                  <div className="h-2 w-full rounded-full bg-gray-200" />
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-5 flex flex-col gap-4">
              {listings.slice(0, 3).map((p) => (
                <div key={p.id}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="truncate font-medium text-muted-foreground">{p.title}</span>
                    <span className="shrink-0 font-semibold text-foreground">${p.price}</span>
                  </div>
                  <div className="mt-1.5 h-2 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-forest"
                      style={{ width: `${(p.price / maxPrice) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 lg:col-span-1">
          <h3 className="font-semibold text-foreground">Payment Reminders</h3>
          <p className="text-sm text-muted-foreground">Upcoming rent due dates</p>

          {loading ? (
            <div className="mt-4 space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <SkeletonRow key={i} />
              ))}
            </div>
          ) : (
            <div className="mt-4 flex flex-col gap-3">
              {reminders.map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-xl bg-muted px-3.5 py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{r.tenant}</p>
                    <p className="text-xs text-muted-foreground">{r.property}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">${r.amount}</p>
                    <p className="text-xs text-amber-600">Due {r.dueDate}</p>
                  </div>
                </div>
              ))}
              {reminders.length === 0 && (
                <p className="py-4 text-center text-sm text-muted-foreground">No upcoming payments due.</p>
              )}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 lg:col-span-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Contracts</h3>
            <Link to="/dashboard/landlord/contracts" className="text-xs font-semibold text-primary hover:underline">
              View all
            </Link>
          </div>

          {loading ? (
            <div className="mt-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonRow key={i} />
              ))}
            </div>
          ) : (
            <div className="mt-3 flex flex-col divide-y divide-gray-100">
              {contracts.map((c) => {
                const property = properties.find((p) => p.id === c.propertyId)
                const status = STATUS_STYLES[c.status]
                return (
                  <div key={c.id} className="flex items-center justify-between py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sage/60 text-forest">
                        <FileText className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{property?.title}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {c.tenant} &middot; ends {c.endDate}
                        </p>
                      </div>
                    </div>
                    <StatusPill label={status.label} tone={status.tone} />
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Tenants</h3>
            <Link to="/dashboard/landlord/tenants" className="text-xs font-semibold text-primary hover:underline">
              View all
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">Contact and payment status for each renter</p>

          {loading ? (
            <div className="mt-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonRow key={i} />
              ))}
            </div>
          ) : (
            <div className="mt-3 flex flex-col divide-y divide-gray-100">
              {tenants.map((t) => {
                const property = properties.find((p) => p.id === t.propertyId)
                const status = STATUS_STYLES[t.status]
                return (
                  <div key={t.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sage/60 text-sm font-semibold text-forest">
                        {t.name.charAt(0)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{t.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{property?.title}</p>
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
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 lg:col-span-1">
          <h3 className="font-semibold text-foreground">Payment Methods</h3>
          <p className="text-sm text-muted-foreground">How tenants are paying</p>
          {loading ? (
            <div className="mt-4 flex justify-center">
              <div className="h-40 w-40 animate-pulse rounded-full bg-gray-200" />
            </div>
          ) : (
            <PaymentDonut aba={abaCount} cash={cashCount} />
          )}
        </div>
      </div>
    </div>
  )
}
