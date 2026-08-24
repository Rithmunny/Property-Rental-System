import { Link } from 'react-router-dom'
import { Bell, Trash2 } from 'lucide-react'
import { useAlerts } from '@/context/AlertsContext'
import PageHeader from '@/components/dashboard/PageHeader'

function filterLabel(filters = {}) {
  const parts = []
  if (filters.q) parts.push(`“${filters.q}”`)
  if (filters.city) parts.push(filters.city)
  if (filters.area) parts.push(filters.area)
  if (filters.type) parts.push(filters.type)
  if (filters.beds) parts.push(`${filters.beds}+ beds`)
  if (filters.furnished) parts.push(filters.furnished)
  if (filters.maxPrice) parts.push(`max $${filters.maxPrice}`)
  return parts.length ? parts.join(' · ') : 'All rentals'
}

function searchToQuery(filters = {}) {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value)
  })
  const qs = params.toString()
  return qs ? `/rent?${qs}` : '/rent'
}

export default function TenantAlerts() {
  const { searches, alerts, removeSearch, markSeen } = useAlerts()

  return (
    <div>
      <PageHeader
        title="Alerts"
        subtitle="Saved searches and new listings that match them"
      />

      {alerts.length > 0 && (
        <div className="mt-6 rounded-2xl border border-forest/20 bg-sage/30 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-forest">
            <Bell className="h-4 w-4" />
            New matches
          </p>
          <div className="mt-3 flex flex-col gap-3">
            {alerts.map(({ search, matches }) => (
              <div key={search.id} className="rounded-xl bg-card p-3">
                <p className="text-sm font-medium text-foreground">{filterLabel(search.filters)}</p>
                <ul className="mt-2 flex flex-col gap-1 text-sm">
                  {matches.map((p) => (
                    <li key={p.id}>
                      <Link to={`/listings/${p.id}`} className="text-primary hover:underline">
                        {p.title} · ${p.price}/mo
                      </Link>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => markSeen(search.id)}
                  className="mt-2 text-xs font-semibold text-muted-foreground hover:text-primary"
                >
                  Mark as seen
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-border bg-card p-2 sm:p-3">
        {searches.length === 0 ? (
          <div className="px-3 py-10 text-center">
            <p className="text-sm text-muted-foreground">No saved searches yet.</p>
            <Link to="/rent" className="mt-3 inline-block text-sm font-semibold text-primary hover:underline">
              Browse rentals and save a search
            </Link>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-gray-100">
            {searches.map((search) => (
                <div key={search.id} className="flex flex-wrap items-center justify-between gap-3 p-3">
                  <div>
                    <p className="font-medium text-foreground">{filterLabel(search.filters)}</p>
                    <p className="text-xs text-muted-foreground">
                      Saved {new Date(search.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={searchToQuery(search.filters)}
                      className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted"
                    >
                      Open search
                    </Link>
                    <button
                      type="button"
                      onClick={() => removeSearch(search.id)}
                      aria-label="Delete search"
                      className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
