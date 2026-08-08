import { useProperties } from '../../../context/PropertiesContext'
import { useRequests } from '../../../context/RequestsContext'
import PageHeader from '../../../components/dashboard/PageHeader'
import StatusPill from '../../../components/dashboard/StatusPill'

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
      <PageHeader title="Rental Requests" subtitle="Properties you've requested to rent" />

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-2 sm:p-3">
        {loading ? (
          <p className="py-6 text-center text-sm text-gray-500">Loading requests…</p>
        ) : (
          <div className="flex flex-col divide-y divide-gray-100">
            {requests.map((r) => {
              const property = properties.find((p) => p.id === r.propertyId)
              const status = REQUEST_STATUS[r.status] ?? REQUEST_STATUS.pending
              return (
                <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 p-3">
                  <div>
                    <p className="font-medium text-gray-900">{property?.title ?? 'Unknown property'}</p>
                    <p className="text-sm text-gray-500">Requested {r.requestedDate}</p>
                  </div>
                  <StatusPill label={status.label} tone={status.tone} />
                </div>
              )
            })}

            {requests.length === 0 && (
              <p className="py-6 text-center text-sm text-gray-500">
                No rental requests yet. Browse listings and request a property to rent.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
