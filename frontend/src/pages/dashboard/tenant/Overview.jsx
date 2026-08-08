import { Link } from 'react-router-dom'
import { DollarSign, Clock3, Heart, Send, MapPin } from 'lucide-react'
import { useProperties } from '../../../context/PropertiesContext'
import { CURRENT_RENTAL, NEXT_PAYMENT, RENTAL_REQUESTS, SAVED_PROPERTY_IDS } from '../../../data/tenant'
import PropertyCard from '../../../components/common/PropertyCard'
import StatCard from '../../../components/dashboard/StatCard'
import PageHeader from '../../../components/dashboard/PageHeader'
import StatusPill from '../../../components/dashboard/StatusPill'
import PaymentMethodBadge from '../../../components/dashboard/PaymentMethodBadge'

export default function TenantOverview() {
  const { properties } = useProperties()
  const rentalProperty = properties.find((p) => p.id === CURRENT_RENTAL.propertyId)
  const savedProperties = properties.filter((p) => SAVED_PROPERTY_IDS.includes(p.id))
  const pendingRequests = RENTAL_REQUESTS.filter((r) => r.status === 'pending').length

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Your rental, payments, and saved homes." />

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={DollarSign} label="Current Rent" value={`$${CURRENT_RENTAL.rent}/mo`} />
        <StatCard icon={Clock3} label={`Due ${NEXT_PAYMENT.dueDate}`} value={`$${NEXT_PAYMENT.amount}`} />
        <StatCard icon={Heart} label="Saved Homes" value={savedProperties.length} />
        <StatCard icon={Send} label="Pending Requests" value={pendingRequests} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">My Rental</h3>
            <Link to="/dashboard/tenant/my-rental" className="text-xs font-semibold text-forest hover:underline">
              View all
            </Link>
          </div>

          {rentalProperty && (
            <div className="mt-4 flex flex-col gap-4 sm:flex-row">
              <div className="h-32 w-full shrink-0 overflow-hidden rounded-xl sm:w-44">
                <img src={rentalProperty.image} alt={rentalProperty.title} className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900">{rentalProperty.title}</p>
                    <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
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
                    <p className="text-gray-500">Rent</p>
                    <p className="font-semibold text-gray-900">${CURRENT_RENTAL.rent}/mo</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Deposit</p>
                    <p className="font-semibold text-gray-900">${CURRENT_RENTAL.deposit}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Lease Ends</p>
                    <p className="font-semibold text-gray-900">{CURRENT_RENTAL.endDate}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:col-span-1">
          <h3 className="font-semibold text-gray-900">Next Payment</h3>
          <p className="text-sm text-gray-500">Due {NEXT_PAYMENT.dueDate}</p>
          <p className="mt-4 text-3xl font-bold text-gray-900">${NEXT_PAYMENT.amount}</p>

          <div className="mt-4">
            <PaymentMethodBadge method={CURRENT_RENTAL.paymentMethod} />
          </div>

          <Link
            to="/dashboard/tenant/payments"
            className="mt-5 block w-full rounded-full bg-forest px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-forest-dark"
          >
            View Payments
          </Link>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Saved Homes</h3>
          <Link to="/dashboard/tenant/saved" className="text-xs font-semibold text-forest hover:underline">
            View all
          </Link>
        </div>
        <p className="text-sm text-gray-500">Properties you've favorited for later</p>

        <div className="mt-5 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {savedProperties.slice(0, 4).map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      </div>
    </div>
  )
}
