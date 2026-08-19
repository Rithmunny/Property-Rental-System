import { Link } from 'react-router-dom'
import { useProperties } from '@/context/PropertiesContext'
import { useRequests } from '@/context/RequestsContext'
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

export default function TenantRequests() {
  const { properties } = useProperties()
  const { requests, loading, error } = useRequests()

  return (
    <div>
      <PageHeader title="Requests" subtitle="Viewings and rent requests you've sent" />

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
            {requests.map((r) => {
              const property = properties.find((p) => p.id === r.propertyId)
              const status = REQUEST_STATUS[r.status] ?? REQUEST_STATUS.pending
              return (
                <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 p-3">
                  <div>
                    <p className="font-medium text-gray-900">{property?.title ?? 'Unknown property'}</p>
                    <p className="text-sm text-gray-500">
                      {REQUEST_KIND[r.kind] ?? 'Rent'} &middot;{' '}
                      {r.kind === 'viewing' && r.viewingDate
                        ? `Viewing ${r.viewingDate} at ${r.viewingTime}`
                        : `Requested ${r.requestedDate}`}
                      {r.note ? ` · ${r.note}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/dashboard/tenant/messages?propertyId=${r.propertyId}`}
                      className="rounded-full border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      Message
                    </Link>
                    <StatusPill label={status.label} tone={status.tone} />
                  </div>
                </div>
              )
            })}

            {requests.length === 0 && (
              <div className="px-3 py-10 text-center">
                <p className="text-sm text-gray-500">
                  No requests yet. Find a home, request a viewing, or send a rent request.
                </p>
                <Link
                  to="/rent"
                  className="mt-3 inline-block text-sm font-semibold text-forest hover:underline"
                >
                  Browse listings
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
