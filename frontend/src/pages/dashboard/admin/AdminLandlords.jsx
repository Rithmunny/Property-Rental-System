import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import * as usersApi from '@/api/users'
import { useToast } from '@/context/ToastContext'
import PageHeader from '@/components/dashboard/PageHeader'
import StatusPill from '@/components/dashboard/StatusPill'
import TelegramIcon from '@/components/common/TelegramIcon'
import SkeletonRow from '@/components/common/SkeletonRow'

const LANDLORD_STATUS = {
  active: { label: 'Active', tone: 'positive' },
  pending: { label: 'Pending Review', tone: 'warning' },
  suspended: { label: 'Suspended', tone: 'neutral' },
}

export default function AdminLandlords() {
  const { showToast } = useToast()
  const [landlords, setLandlords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)

  const refresh = useCallback(() => {
    setLoading(true)
    setError(null)
    return usersApi
      .listLandlords()
      .then(setLandlords)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const handleStatus = async (id, status) => {
    setUpdatingId(id)
    try {
      await usersApi.updateLandlordStatus(id, status)
      showToast(status === 'active' ? 'Landlord approved' : 'Landlord suspended')
      await refresh()
    } catch (err) {
      showToast(err.message || 'Could not update landlord')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div>
      <PageHeader title="Landlords" subtitle="Property owners on the platform" />

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <div className="mt-6 rounded-2xl border border-border bg-card p-2 sm:p-3">
        {loading ? (
          <div>
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
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
                      <p className="truncate font-medium text-foreground">{l.name}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        {l.listings} listing{l.listings === 1 ? '' : 's'}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <StatusPill label={status.label} tone={status.tone} />
                    <a
                      href={`https://t.me/${l.telegram.replace('@', '')}`}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Message ${l.name} on Telegram`}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                      <TelegramIcon className="h-4 w-4" />
                    </a>
                    {(l.status === 'pending' || l.status === 'suspended') && (
                      <button
                        type="button"
                        disabled={updatingId === l.id}
                        onClick={() => handleStatus(l.id, 'active')}
                        className="min-h-9 rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                      >
                        Approve
                      </button>
                    )}
                    {l.status === 'active' && (
                      <button
                        type="button"
                        disabled={updatingId === l.id}
                        onClick={() => handleStatus(l.id, 'suspended')}
                        className="min-h-9 rounded-full border border-border px-3.5 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted disabled:opacity-60"
                      >
                        Suspend
                      </button>
                    )}
                  </div>
                </div>
              )
            })}

            {landlords.length === 0 && (
              <div className="px-3 py-10 text-center">
                <p className="text-sm text-muted-foreground">No landlords registered yet.</p>
                <Link
                  to="/dashboard/admin"
                  className="mt-3 inline-block text-sm font-semibold text-primary hover:underline"
                >
                  Back to overview
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
