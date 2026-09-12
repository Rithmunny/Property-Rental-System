import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, ArrowRight } from 'lucide-react'
import { useProperties } from '@/context/PropertiesContext'
import { useRequests } from '@/context/RequestsContext'
import PageHeader from '@/components/dashboard/PageHeader'
import StatusPill from '@/components/dashboard/StatusPill'
import SkeletonRow from '@/components/common/SkeletonRow'
import { fadeUp, stagger } from '@/lib/motion'

const REQUEST_KIND = {
  rent: 'Rent',
  viewing: 'Viewing',
}

const REQUEST_STATUS = {
  pending: {
    label: 'Pending',
    tone: 'warning',
    hint: 'Waiting for the landlord to respond.',
  },
  accepted: {
    label: 'Accepted',
    tone: 'positive',
    hint: 'The landlord accepted your request.',
  },
  declined: {
    label: 'Declined',
    tone: 'neutral',
    hint: 'This request was declined. Try another home.',
  },
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

      {loading ? (
        <div className="mt-6 rounded-2xl border border-border bg-card p-2 sm:p-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-border bg-card px-6 py-14 text-center">
          <p className="text-sm font-medium text-foreground">No requests yet</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Find a home you like, then request a viewing or send a rent request from its page.
          </p>
          <Link
            to="/rent"
            className="mt-5 flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98]"
          >
            Browse listings
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="mt-6 flex flex-col gap-3"
        >
          {requests.map((r) => {
            const property = properties.find((p) => p.id === r.propertyId)
            const propertyTitle = r.propertyTitle || property?.title || 'Unknown property'
            const status = REQUEST_STATUS[r.status] ?? REQUEST_STATUS.pending
            return (
              <motion.div
                key={r.id}
                variants={fadeUp}
                className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-3 transition-colors hover:border-primary/30"
              >
                <div className="h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-muted">
                  {property?.image && (
                    <img
                      src={property.image}
                      alt={propertyTitle}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-foreground">{propertyTitle}</p>
                    <StatusPill label={status.label} tone={status.tone} />
                  </div>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3 shrink-0" />
                    {property?.city ?? '—'} &middot; {REQUEST_KIND[r.kind] ?? 'Rent'}
                    {r.kind === 'viewing' && r.viewingDate
                      ? ` &middot; Viewing ${r.viewingDate} at ${r.viewingTime}`
                      : ` &middot; Requested ${r.requestedDate}`}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{status.hint}</p>
                </div>
                <Link
                  to={`/dashboard/tenant/messages?propertyId=${r.propertyId}`}
                  className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted"
                >
                  Message
                </Link>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </div>
  )
}
