import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import * as usersApi from '@/api/users'
import PageHeader from '@/components/dashboard/PageHeader'
import StatusPill from '@/components/dashboard/StatusPill'
import TelegramIcon from '@/components/common/TelegramIcon'
import SkeletonRow from '@/components/common/SkeletonRow'

const TENANT_STATUS = {
  active: { label: 'Active', tone: 'positive' },
  pending: { label: 'Pending', tone: 'warning' },
  suspended: { label: 'Suspended', tone: 'neutral' },
}

export default function AdminTenants() {
  const [tenants, setTenants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    usersApi
      .listTenants()
      .then(setTenants)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <PageHeader title="Tenants" subtitle="Renters on the platform" />

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
            {tenants.map((t) => {
              const status = TENANT_STATUS[t.status] ?? TENANT_STATUS.active
              return (
                <div key={t.id} className="flex flex-wrap items-center justify-between gap-3 p-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sage/60 text-sm font-semibold text-forest">
                      {t.name.charAt(0)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{t.name}</p>
                      <p className="truncate text-sm text-muted-foreground">{t.telegram}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <StatusPill label={status.label} tone={status.tone} />
                    <a
                      href={`https://t.me/${t.telegram.replace('@', '')}`}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Message ${t.name} on Telegram`}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                      <TelegramIcon className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              )
            })}

            {tenants.length === 0 && (
              <div className="px-3 py-10 text-center">
                <p className="text-sm text-muted-foreground">No tenants registered yet.</p>
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
