import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import { useProperties } from '@/context/PropertiesContext'
import * as rentalsApi from '@/api/rentals'
import PageHeader from '@/components/dashboard/PageHeader'
import StatusPill from '@/components/dashboard/StatusPill'
import TelegramIcon from '@/components/common/TelegramIcon'
import SkeletonRow from '@/components/common/SkeletonRow'

export default function TenantMyRental() {
  const { properties } = useProperties()
  const [rental, setRental] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    rentalsApi
      .getCurrentRental()
      .then(setRental)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div>
        <PageHeader title="My Rental" subtitle="Your current lease details" />
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-2 sm:p-3">
          <SkeletonRow />
          <SkeletonRow />
        </div>
      </div>
    )
  }

  if (error || !rental) {
    return (
      <div>
        <PageHeader title="My Rental" subtitle="Your current lease details" />
        <div className="mt-10 text-center">
          <p className="text-sm text-gray-500">
            {error || 'No active rental on file yet.'}
          </p>
          {!error && (
            <Link
              to="/rent"
              className="mt-3 inline-block text-sm font-semibold text-forest hover:underline"
            >
              Browse listings
            </Link>
          )}
        </div>
      </div>
    )
  }

  const property = properties.find((p) => p.id === rental.propertyId)

  if (!property) {
    return (
      <div>
        <PageHeader title="My Rental" subtitle="Your current lease details" />
        <p className="mt-6 text-center text-sm text-gray-500">Property details unavailable.</p>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="My Rental" subtitle="Your current lease details" />

      <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="h-56 w-full">
          <img src={property.image} alt={property.title} className="h-full w-full object-cover" />
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{property.title}</h2>
              <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                <MapPin className="h-4 w-4" />
                {property.address}, {property.city}
              </p>
            </div>
            <StatusPill label="Active Lease" tone="positive" />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-sm text-gray-500">Rent</p>
              <p className="text-lg font-semibold text-gray-900">${rental.rent}/mo</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Deposit</p>
              <p className="text-lg font-semibold text-gray-900">${rental.deposit}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Lease Start</p>
              <p className="text-lg font-semibold text-gray-900">{rental.startDate}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Lease Ends</p>
              <p className="text-lg font-semibold text-gray-900">{rental.endDate}</p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-gray-50 p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-forest text-sm font-semibold text-white">
                {rental.landlord.charAt(0)}
              </span>
              <div>
                <p className="font-medium text-gray-900">{rental.landlord}</p>
                <p className="text-sm text-gray-500">Landlord</p>
              </div>
            </div>
            <a
              href={`https://t.me/${rental.landlordTelegram.replace('@', '')}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-forest hover:text-forest"
            >
              <TelegramIcon className="h-4 w-4" />
              Message on Telegram
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
