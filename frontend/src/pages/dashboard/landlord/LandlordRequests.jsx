import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Inbox } from 'lucide-react'
import { useProperties } from '@/context/PropertiesContext'
import { useRequests } from '@/context/RequestsContext'
import { useToast } from '@/context/ToastContext'
import PageHeader from '@/components/dashboard/PageHeader'
import StatusPill from '@/components/dashboard/StatusPill'
import SkeletonRow from '@/components/common/SkeletonRow'
import { fadeUp, stagger } from '@/lib/motion'

const REQUEST_KIND = {
  rent: 'Rent',
  viewing: 'Viewing',
}

const REQUEST_STATUS = {
  pending: { label: 'Pending', tone: 'warning' },
  accepted: { label: 'Accepted', tone: 'positive' },
  declined: { label: 'Declined', tone: 'neutral' },
}

const FILTERS = ['all', 'pending', 'accepted', 'declined']

export default function LandlordRequests() {
  const { properties } = useProperties()
  const { inbox, loading, error, updateStatus } = useRequests()
  const { showToast } = useToast()
  const [updatingId, setUpdatingId] = useState(null)
  const [filter, setFilter] = useState('all')

  const counts = {
    all: inbox.length,
    pending: inbox.filter((r) => r.status === 'pending').length,
    accepted: inbox.filter((r) => r.status === 'accepted').length,
    declined: inbox.filter((r) => r.status === 'declined').length,
  }
  const visible = filter === 'all' ? inbox : inbox.filter((r) => r.status === filter)

  const handleStatus = async (id, status) => {
    const current = inbox.find((r) => r.id === id)
    const kind = current?.kind === 'viewing' ? 'viewing' : 'rent'
    setUpdatingId(id)
    try {
      await updateStatus(id, status)
      if (status === 'accepted') {
        showToast(
          kind === 'viewing'
            ? 'Viewing confirmed'
            : 'Request accepted — contract created and the listing is now closed',
          'success',
        )
      } else {
        showToast('Request declined')
      }
    } catch (err) {
      // 409 conflicts come from the occupancy guard: another tenant already
      // holds the active contract for this listing.
      showToast(err.message || 'Could not update request', 'error')
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

      <div className="mt-4 flex flex-wrap gap-1.5" role="tablist" aria-label="Filter requests">
        {FILTERS.map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={filter === key}
            onClick={() => setFilter(key)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize transition-all active:scale-[0.98] ${
              filter === key
                ? 'bg-primary text-primary-foreground'
                : 'border border-border bg-card text-muted-foreground hover:bg-muted'
            }`}
          >
            {key} {counts[key] > 0 && <span className="opacity-70">({counts[key]})</span>}
          </button>
        ))}
      </div>

      {!loading && visible.length === 0 ? (
        <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-border bg-card px-6 py-14 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Inbox className="h-6 w-6" />
          </span>
          <p className="mt-3 text-sm font-medium text-foreground">
            {filter === 'all' ? 'No incoming requests yet' : `No ${filter} requests`}
          </p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Keep your listings up to date so tenants can find and request them.
          </p>
          <Link
            to="/dashboard/landlord/listings"
            className="mt-5 rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition-all hover:bg-muted active:scale-[0.98]"
          >
            Manage listings
          </Link>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-border bg-card p-2 sm:p-3">
          {loading ? (
            <div>
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonRow key={i} />
              ))}
            </div>
          ) : (
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="flex flex-col divide-y divide-gray-100"
            >
              {visible.map((r) => {
                const property = properties.find((p) => p.id === r.propertyId)
                const status = REQUEST_STATUS[r.status] ?? REQUEST_STATUS.pending
                return (
                  <motion.div
                    key={r.id}
                    variants={fadeUp}
                    className="flex flex-wrap items-center justify-between gap-3 p-3"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-foreground">
                          {property?.title ?? 'Unknown property'}
                        </p>
                        {property && property.available === false && (
                          <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                            Listing closed
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
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
                        className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted"
                      >
                        Message
                      </Link>
                      <StatusPill label={status.label} tone={status.tone} />
                      {r.status === 'pending' && (
                        <div className="ml-0 flex w-full gap-2 sm:ml-2 sm:w-auto">
                          <button
                            onClick={() => handleStatus(r.id, 'accepted')}
                            disabled={updatingId === r.id}
                            className="min-h-10 flex-1 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-60 sm:flex-none sm:py-1.5"
                          >
                            {updatingId === r.id ? 'Accepting…' : 'Accept'}
                          </button>
                          <button
                            onClick={() => handleStatus(r.id, 'declined')}
                            disabled={updatingId === r.id}
                            className="min-h-10 flex-1 rounded-full border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted active:scale-[0.98] disabled:opacity-60 sm:flex-none sm:py-1.5"
                          >
                            Decline
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </div>
      )}
    </div>
  )
}
