import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useProperties } from '@/context/PropertiesContext'
import { useRequests } from '@/context/RequestsContext'
import { useToast } from '@/context/ToastContext'
import PageHeader from '@/components/dashboard/PageHeader'
import StatusPill from '@/components/dashboard/StatusPill'
import SkeletonRow from '@/components/common/SkeletonRow'

const REQUEST_KIND = {
  rent: 'Rent',
  viewing: 'Viewing',
}

const REQUEST_STATUS = {
  pending: { label: 'Pending', tone: 'warning' },
  accepted: { label: 'Accepted', tone: 'positive' },
  declined: { label: 'Declined', tone: 'neutral' },
}

export default function LandlordRequests() {
  const { properties } = useProperties()
  const { inbox, loading, error, updateStatus } = useRequests()
  const { showToast } = useToast()
  const [updatingId, setUpdatingId] = useState(null)

  const handleStatus = async (id, status) => {
    const current = inbox.find((r) => r.id === id)
    const kind = current?.kind === 'viewing' ? 'viewing' : 'rent'
    setUpdatingId(id)
    try {
      await updateStatus(id, status)
      if (status === 'accepted') {
        showToast(kind === 'viewing' ? 'Viewing confirmed' : 'Request accepted — contract stub created')
      } else {
        showToast('Request declined')
      }
    } catch (err) {
      showToast(err.message || 'Could not update request')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div>
      <PageHeader title="Incoming Requests" subtitle="Viewing and rent requests from tenants" />

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-2 sm:p-3">
        {loading ? (
          <div>
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-gray-100">
            {inbox.map((r) => {
              const property = properties.find((p) => p.id === r.propertyId)
              const status = REQUEST_STATUS[r.status] ?? REQUEST_STATUS.pending
              return (
                <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 p-3">
                  <div>
                    <p className="font-medium text-gray-900">{property?.title ?? 'Unknown property'}</p>
                    <p className="text-sm text-gray-500">
                      {REQUEST_KIND[r.kind] ?? 'Rent'} &middot; {r.tenantName ?? 'Tenant'} &middot;{' '}
                      {r.kind === 'viewing' && r.viewingDate
                        ? `Viewing ${r.viewingDate} at ${r.viewingTime}`
                        : `Requested ${r.requestedDate}`}
                      {r.note ? ` · ${r.note}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/dashboard/landlord/messages?propertyId=${r.propertyId}&tenant=${encodeURIComponent(r.tenantEmail || '')}`}
                      className="rounded-full border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      Message
                    </Link>
                    <StatusPill label={status.label} tone={status.tone} />
                    {r.status === 'pending' && (
                      <div className="ml-0 flex w-full gap-2 sm:ml-2 sm:w-auto">
                        <button
                          onClick={() => handleStatus(r.id, 'accepted')}
                          disabled={updatingId === r.id}
                          className="min-h-10 flex-1 rounded-full bg-forest px-4 py-2 text-xs font-semibold text-white hover:bg-forest-dark disabled:opacity-60 sm:flex-none sm:py-1.5"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleStatus(r.id, 'declined')}
                          disabled={updatingId === r.id}
                          className="min-h-10 flex-1 rounded-full border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60 sm:flex-none sm:py-1.5"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}

            {inbox.length === 0 && (
              <div className="px-3 py-10 text-center">
                <p className="text-sm text-gray-500">
                  No incoming requests yet. Keep your listings up to date so tenants can find you.
                </p>
                <Link
                  to="/dashboard/landlord/listings"
                  className="mt-3 inline-block text-sm font-semibold text-forest hover:underline"
                >
                  Manage listings
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
