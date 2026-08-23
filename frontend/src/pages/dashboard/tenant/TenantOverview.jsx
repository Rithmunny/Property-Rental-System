import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { DollarSign, Clock3, Heart, Send, MapPin } from 'lucide-react'
import { useProperties } from '@/context/PropertiesContext'
import { useSaved } from '@/context/SavedContext'
import { useRequests } from '@/context/RequestsContext'
import * as rentalsApi from '@/api/rentals'
import * as paymentsApi from '@/api/payments'
import PropertyCard from '@/components/common/PropertyCard'
import SkeletonCard from '@/components/common/SkeletonCard'
import SkeletonRow from '@/components/common/SkeletonRow'
import StatCard from '@/components/dashboard/StatCard'
import PageHeader from '@/components/dashboard/PageHeader'
import StatusPill from '@/components/dashboard/StatusPill'
import PaymentMethodBadge from '@/components/dashboard/PaymentMethodBadge'

export default function TenantOverview() {
  const { properties } = useProperties()
  const { savedIds, loading: savedLoading } = useSaved()
  const { requests, loading: requestsLoading } = useRequests()
  const [rental, setRental] = useState(null)
  const [paymentData, setPaymentData] = useState(null)
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    Promise.all([rentalsApi.getCurrentRental(), paymentsApi.getPayments('tenant')])
      .then(([r, p]) => {
        setRental(r)
        setPaymentData(p)
      })
      .finally(() => setDataLoading(false))
  }, [])

  const loading = dataLoading || savedLoading || requestsLoading
  const savedProperties = properties.filter((p) => savedIds.includes(p.id))
  const pendingRequests = requests.filter((r) => r.status === 'pending').length
  const currentRental = paymentData?.currentRental ?? rental
  const nextPayment = paymentData?.nextPayment
  const rentalProperty = currentRental
    ? properties.find((p) => p.id === currentRental.propertyId)
    : null

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Your rental, payments, and saved homes." />

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
          <StatCard
            icon={DollarSign}
            label="Current Rent"
            value={currentRental ? `$${currentRental.rent}/mo` : '—'}
          />
          <StatCard
            icon={Clock3}
            label={nextPayment ? `Due ${nextPayment.dueDate}` : 'Next Payment'}
            value={nextPayment ? `$${nextPayment.amount}` : '—'}
          />
          <StatCard icon={Heart} label="Saved Homes" value={savedProperties.length} />
          <StatCard icon={Send} label="Pending Requests" value={pendingRequests} />
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">My Rental</h3>
            <Link to="/dashboard/tenant/my-rental" className="text-xs font-semibold text-primary hover:underline">
              View all
            </Link>
          </div>

          {loading ? (
            <SkeletonRow />
          ) : rentalProperty && currentRental ? (
            <div className="mt-4 flex flex-col gap-4 sm:flex-row">
              <div className="h-32 w-full shrink-0 overflow-hidden rounded-xl sm:w-44">
                <img src={rentalProperty.image} alt={rentalProperty.title} className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">{rentalProperty.title}</p>
                    <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">
                        {rentalProperty.address}, {rentalProperty.city}
                      </span>
                    </p>
                  </div>
                  <StatusPill label="Active Lease" tone="positive" />
                </div>
                <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Rent</p>
                    <p className="font-semibold text-foreground">${currentRental.rent}/mo</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Deposit</p>
                    <p className="font-semibold text-foreground">${currentRental.deposit}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Lease Ends</p>
                    <p className="font-semibold text-foreground">{currentRental.endDate}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              No active rental yet.{' '}
              <Link to="/rent" className="font-semibold text-primary hover:underline">
                Browse listings
              </Link>{' '}
              to find your next home.
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 lg:col-span-1">
          <h3 className="font-semibold text-foreground">Next Payment</h3>
          {loading ? (
            <div className="mt-4 animate-pulse space-y-3">
              <div className="h-3 w-24 rounded bg-gray-200" />
              <div className="h-10 w-20 rounded bg-gray-200" />
            </div>
          ) : nextPayment && currentRental ? (
            <>
              <p className="text-sm text-muted-foreground">Due {nextPayment.dueDate}</p>
              <p className="mt-4 text-3xl font-bold text-foreground">${nextPayment.amount}</p>
              <div className="mt-4">
                <PaymentMethodBadge method={currentRental.paymentMethod} />
              </div>
            </>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              No upcoming payments.{' '}
              <Link to="/rent" className="font-semibold text-primary hover:underline">
                Browse listings
              </Link>{' '}
              to find a home.
            </p>
          )}

          <Link
            to="/dashboard/tenant/payments"
            className="mt-5 block w-full rounded-full bg-primary px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            View Payments
          </Link>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Saved Homes</h3>
          <Link to="/dashboard/tenant/saved" className="text-xs font-semibold text-primary hover:underline">
            View all
          </Link>
        </div>
        <p className="text-sm text-muted-foreground">Properties you've favorited for later</p>

        {loading ? (
          <div className="mt-5 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : savedProperties.length === 0 ? (
          <p className="mt-5 text-sm text-muted-foreground">
            No saved homes yet.{' '}
            <Link to="/rent" className="font-semibold text-primary hover:underline">
              Browse listings
            </Link>{' '}
            to save your favorites.
          </p>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {savedProperties.slice(0, 4).map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
