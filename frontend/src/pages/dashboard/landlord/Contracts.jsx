import { useEffect, useState } from 'react'
import { Plus, FileText } from 'lucide-react'
import { useProperties } from '../../../context/PropertiesContext'
import * as rentalsApi from '../../../api/rentals'
import PageHeader from '../../../components/dashboard/PageHeader'
import StatusPill from '../../../components/dashboard/StatusPill'

const STATUS_STYLES = {
  active: { label: 'Active', tone: 'positive' },
  'ending soon': { label: 'Ending Soon', tone: 'warning' },
  expired: { label: 'Expired', tone: 'neutral' },
}

export default function LandlordContracts() {
  const { properties } = useProperties()
  const [contracts, setContracts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    rentalsApi
      .listContracts()
      .then(setContracts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <PageHeader
        title="Contracts"
        subtitle="Rental agreements across your properties"
        actions={
          <button className="flex items-center gap-1.5 rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-forest-dark">
            <Plus className="h-4 w-4" />
            New Contract
          </button>
        }
      />

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white">
        {loading ? (
          <p className="py-6 text-center text-sm text-gray-500">Loading contracts…</p>
        ) : (
          <div className="flex flex-col divide-y divide-gray-100 p-2 sm:p-3">
            {contracts.map((c) => {
              const property = properties.find((p) => p.id === c.propertyId)
              const status = STATUS_STYLES[c.status] ?? STATUS_STYLES.active
              return (
                <div key={c.id} className="flex flex-wrap items-center justify-between gap-4 p-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sage/60 text-forest">
                      <FileText className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-gray-900">{property?.title}</p>
                      <p className="truncate text-sm text-gray-500">Tenant: {c.tenant}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <div>
                      <p className="text-gray-400">Rent</p>
                      <p className="font-medium text-gray-900">${c.rent}/mo</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Deposit</p>
                      <p className="font-medium text-gray-900">${c.deposit}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Start</p>
                      <p className="font-medium text-gray-900">{c.startDate}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">End</p>
                      <p className="font-medium text-gray-900">{c.endDate}</p>
                    </div>
                  </div>

                  <StatusPill label={status.label} tone={status.tone} />
                </div>
              )
            })}

            {contracts.length === 0 && (
              <p className="py-6 text-center text-sm text-gray-500">No contracts on file yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
