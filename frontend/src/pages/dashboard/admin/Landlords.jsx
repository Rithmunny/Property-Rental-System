import { useEffect, useState } from 'react'
import * as usersApi from '../../../api/users'
import PageHeader from '../../../components/dashboard/PageHeader'
import StatusPill from '../../../components/dashboard/StatusPill'
import TelegramIcon from '../../../components/dashboard/TelegramIcon'

const LANDLORD_STATUS = {
  active: { label: 'Active', tone: 'positive' },
  pending: { label: 'Pending Review', tone: 'warning' },
  suspended: { label: 'Suspended', tone: 'neutral' },
}

export default function AdminLandlords() {
  const [landlords, setLandlords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    usersApi
      .listLandlords()
      .then(setLandlords)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <PageHeader title="Landlords" subtitle="Property owners on the platform" />

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-2 sm:p-3">
        {loading ? (
          <p className="py-6 text-center text-sm text-gray-500">Loading landlords…</p>
        ) : (
          <div className="flex flex-col divide-y divide-gray-100">
            {landlords.map((l) => {
              const status = LANDLORD_STATUS[l.status] ?? LANDLORD_STATUS.active
              return (
                <div key={l.id} className="flex flex-wrap items-center justify-between gap-3 p-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sage/60 text-sm font-semibold text-forest">
                      {l.name.charAt(0)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-gray-900">{l.name}</p>
                      <p className="truncate text-sm text-gray-500">
                        {l.listings} listing{l.listings === 1 ? '' : 's'}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <StatusPill label={status.label} tone={status.tone} />
                    <a
                      href={`https://t.me/${l.telegram.replace('@', '')}`}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Message ${l.name} on Telegram`}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:border-forest hover:text-forest"
                    >
                      <TelegramIcon className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              )
            })}

            {landlords.length === 0 && (
              <p className="py-6 text-center text-sm text-gray-500">No landlords registered yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
