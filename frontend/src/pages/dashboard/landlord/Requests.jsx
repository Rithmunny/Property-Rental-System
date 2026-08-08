import { useState } from 'react'
import { useProperties } from '../../../context/PropertiesContext'
import { useRequests } from '../../../context/RequestsContext'
import PageHeader from '../../../components/dashboard/PageHeader'
import StatusPill from '../../../components/dashboard/StatusPill'

const REQUEST_STATUS = {
  pending: { label: 'Pending', tone: 'warning' },
  accepted: { label: 'Accepted', tone: 'positive' },
  declined: { label: 'Declined', tone: 'neutral' },
}

export default function LandlordRequests() {
  const { properties } = useProperties()
  const { inbox, loading, error, updateStatus } = useRequests()
  const [updatingId, setUpdatingId] = useState(null)

  const handleStatus = async (id, status) => {
    setUpdatingId(id)
    try {
      await updateStatus(id, status)
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div>
      <PageHeader title="Incoming Requests" subtitle="Tenants who want to rent your properties" />

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-2 sm:p-3">
        {loading ? (
          <p className="py-6 text-center text-sm text-gray-500">Loading requests…</p>
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
                      {r.tenantName ?? 'Tenant'} &middot; Requested {r.requestedDate}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusPill label={status.label} tone={status.tone} />
                    {r.status === 'pending' && (
                      <div className="ml-2 flex gap-2">
                        <button
                          onClick={() => handleStatus(r.id, 'accepted')}
                          disabled={updatingId === r.id}
                          className="rounded-full bg-forest px-3 py-1.5 text-xs font-semibold text-white hover:bg-forest-dark disabled:opacity-60"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleStatus(r.id, 'declined')}
                          disabled={updatingId === r.id}
                          className="rounded-full border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
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
              <p className="py-6 text-center text-sm text-gray-500">
                No incoming requests yet.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
