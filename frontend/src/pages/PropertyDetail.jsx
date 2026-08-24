import { useState, useEffect } from 'react'
import { useParams, Link, Navigate, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BedDouble, Bath, Ruler, MapPin, CheckCircle2, Star, Heart, Phone, MessageCircle } from 'lucide-react'
import { useProperties } from '@/context/PropertiesContext'
import { useAuth } from '@/context/AuthContext'
import { useRequests } from '@/context/RequestsContext'
import { useSaved } from '@/context/SavedContext'
import { useToast } from '@/context/ToastContext'
import TelegramIcon from '@/components/common/TelegramIcon'
import PropertyGallery from '@/components/common/PropertyGallery'
import ViewingRequestModal from '@/components/common/ViewingRequestModal'
import * as reviewsApi from '@/api/reviews'
import {
  furnishedLabel,
  leaseTermLabel,
  phoneHref,
  telegramHref,
  whatsappHref,
} from '@/utils/listing'
import SimilarProperties from '@/components/common/SimilarProperties'

export default function PropertyDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { properties, loading: propertiesLoading, refresh } = useProperties()
  const property = properties.find((p) => p.id === Number(id))
  const { user } = useAuth()
  const { createRequest, checkHasRequest } = useRequests()
  const { isSaved, toggleSaved } = useSaved()
  const { showToast } = useToast()
  const [rentRequested, setRentRequested] = useState(false)
  const [viewingRequested, setViewingRequested] = useState(false)
  const [pendingKind, setPendingKind] = useState(null)
  const [savePending, setSavePending] = useState(false)
  const [requestError, setRequestError] = useState(null)
  const [viewingOpen, setViewingOpen] = useState(false)
  const [reviews, setReviews] = useState([])
  const [canReview, setCanReview] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewPending, setReviewPending] = useState(false)
  const liked = isSaved(Number(id))

  useEffect(() => {
    if (!user || !id) return
    Promise.all([
      checkHasRequest(Number(id), 'rent'),
      checkHasRequest(Number(id), 'viewing'),
    ]).then(([rent, viewing]) => {
      setRentRequested(rent)
      setViewingRequested(viewing)
    })
  }, [user, id, checkHasRequest])

  useEffect(() => {
    if (!id) return
    reviewsApi.listReviews(Number(id)).then(setReviews)
    setCanReview(reviewsApi.canTenantReview(Number(id)))
  }, [id, user, rentRequested])

  if (propertiesLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center text-sm text-muted-foreground">
        Loading property…
      </div>
    )
  }

  if (!property) return <Navigate to="/rent" replace />

  const handleRequest = async (kind, extras) => {
    setPendingKind(kind)
    setRequestError(null)
    try {
      await createRequest(property.id, kind, extras)
      if (kind === 'viewing') {
        setViewingRequested(true)
        setViewingOpen(false)
      } else setRentRequested(true)
      showToast(kind === 'viewing' ? 'Viewing requested' : 'Request sent!')
    } catch (err) {
      setRequestError(err.message || 'Could not send request')
    } finally {
      setPendingKind(null)
    }
  }

  const handleSave = async () => {
    if (!user) return
    setSavePending(true)
    try {
      const nowSaved = await toggleSaved(property.id)
      showToast(nowSaved ? 'Saved' : 'Removed from saved')
    } finally {
      setSavePending(false)
    }
  }

  const handleReview = async (e) => {
    e.preventDefault()
    setReviewPending(true)
    try {
      const created = await reviewsApi.createReview({
        propertyId: property.id,
        rating: reviewRating,
        comment: reviewComment,
      })
      setReviews((prev) => [created, ...prev])
      setCanReview(false)
      setReviewComment('')
      showToast('Review posted')
      refresh()
    } catch (err) {
      showToast(err.message || 'Could not post review')
    } finally {
      setReviewPending(false)
    }
  }

  const messageHref = user?.role === 'tenant'
    ? `/dashboard/tenant/messages?propertyId=${property.id}`
    : `/login`

  const tg = telegramHref(property.telegram)
  const wa = whatsappHref(property.whatsapp)
  const tel = phoneHref(property.phone)
  const location = [property.neighbourhood, property.address, property.city].filter(Boolean).join(', ')
  const photos = property.images?.length ? property.images : [property.image]
  const displayRating = reviews.length ? property.rating : property.rating
  const displayCount = reviews.length || property.reviews || 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-10"
    >
      <Link to="/rent" className="text-sm text-muted-foreground hover:underline">
        &larr; Back to rentals
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <h1 className="text-2xl font-semibold text-foreground">{property.title}</h1>
        {user ? (
          <button
            onClick={handleSave}
            disabled={savePending}
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted disabled:opacity-60"
          >
            <Heart className={`h-4 w-4 ${liked ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
            {savePending ? 'Saving…' : liked ? 'Saved' : 'Save'}
          </button>
        ) : (
          <Link
            to="/login"
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted"
          >
            <Heart className="h-4 w-4 text-muted-foreground" />
            Save
          </Link>
        )}
      </div>
      <p className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <Star className="h-3.5 w-3.5 fill-foreground" />
          {displayRating} &middot; {displayCount} review{displayCount === 1 ? '' : 's'}
        </span>
        <span className="flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" />
          {location}
        </span>
      </p>

      <PropertyGallery title={property.title} images={photos} />

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border pb-6">
            <div>
              <h2 className="font-semibold text-foreground">
                {property.type} hosted by {property.landlord}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {property.bedrooms} bedrooms &middot; {property.bathrooms} bathrooms &middot;{' '}
                {property.area}m&sup2; &middot; {furnishedLabel(property.furnished)}
              </p>
            </div>
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-forest text-white">
              {property.landlord.charAt(0)}
            </span>
          </div>

          <div className="flex flex-wrap gap-6 border-b border-border py-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <BedDouble className="h-5 w-5 text-foreground" /> {property.bedrooms} Bedrooms
            </span>
            <span className="flex items-center gap-2">
              <Bath className="h-5 w-5 text-foreground" /> {property.bathrooms} Bathrooms
            </span>
            <span className="flex items-center gap-2">
              <Ruler className="h-5 w-5 text-foreground" /> {property.area}m&sup2;
            </span>
          </div>

          <div className="border-b border-border py-6">
            <p className="text-sm leading-relaxed text-muted-foreground">{property.description}</p>
          </div>

          <div className="border-b border-border py-6">
            <h2 className="font-semibold text-foreground">What this place offers</h2>
            <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {property.amenities.map((a) => (
                <li key={a} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-foreground" />
                  {a}
                </li>
              ))}
            </ul>
          </div>

          <div className="py-6">
            <h2 className="font-semibold text-foreground">Reviews</h2>
            <div className="mt-4 flex flex-col gap-4">
              {reviews.map((review) => (
                <article key={review.id} className="rounded-2xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground">{review.tenantName}</p>
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Star className="h-3.5 w-3.5 fill-foreground" />
                      {review.rating}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{review.createdAt}</p>
                  {review.comment && (
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{review.comment}</p>
                  )}
                </article>
              ))}
              {reviews.length === 0 && (
                <p className="text-sm text-muted-foreground">No reviews yet.</p>
              )}
            </div>

            {canReview && (
              <form onSubmit={handleReview} className="mt-6 rounded-2xl border border-border bg-cream/60 p-4">
                <p className="text-sm font-semibold text-foreground">Write a review</p>
                <div className="mt-3 flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      aria-label={`${star} stars`}
                    >
                      <Star
                        className={`h-5 w-5 ${
                          star <= reviewRating ? 'fill-foreground text-foreground' : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  required
                  rows={3}
                  placeholder="How was your stay?"
                  className="mt-3 w-full rounded-xl border border-border px-3.5 py-2.5 text-sm outline-none focus:border-ring"
                />
                <button
                  type="submit"
                  disabled={reviewPending}
                  className="mt-3 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                >
                  {reviewPending ? 'Posting…' : 'Post review'}
                </button>
              </form>
            )}
          </div>
        </div>

        <aside className="h-fit rounded-2xl border border-border p-6 shadow-lg">
          <div className="flex items-baseline justify-between">
            <p className="text-xl font-semibold text-foreground">
              ${property.price} <span className="text-sm font-normal text-muted-foreground">month</span>
            </p>
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="h-3.5 w-3.5 fill-foreground" />
              {displayRating}
            </span>
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
            <Fact label="Deposit" value={`${property.depositMonths} month${property.depositMonths === 1 ? '' : 's'}`} />
            <Fact label="Lease" value={leaseTermLabel(property.leaseTermMonths)} />
            <Fact label="Furnished" value={furnishedLabel(property.furnished)} />
            <Fact
              label="Electricity"
              value={
                property.electricityRate != null
                  ? `$${property.electricityRate}/kWh`
                  : 'Ask landlord'
              }
            />
            <Fact
              label="Parking"
              value={property.parkingFee ? `$${property.parkingFee}/mo` : 'Included / none'}
            />
          </dl>

          <div className="mt-4 border-t border-border pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Contact</p>
            <div className="mt-2 flex flex-col gap-2">
              {user?.role === 'tenant' ? (
                <button
                  type="button"
                  onClick={() => navigate(messageHref)}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  <MessageCircle className="h-4 w-4" />
                  Message landlord
                </button>
              ) : !user ? (
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  <MessageCircle className="h-4 w-4" />
                  Log in to message
                </Link>
              ) : null}
              {tg && (
                <a
                  href={tg}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
                >
                  <TelegramIcon className="h-4 w-4" />
                  Telegram
                </a>
              )}
              {wa && (
                <a
                  href={wa}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
                >
                  <WhatsAppIcon className="h-4 w-4" />
                  WhatsApp
                </a>
              )}
              {tel && (
                <a
                  href={tel}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
                >
                  <Phone className="h-4 w-4" />
                  Call
                </a>
              )}
            </div>
          </div>

          {property.available ? (
            <div className="mt-4 border-t border-border pt-4">
              {requestError && (
                <p className="mb-3 rounded-full bg-red-50 px-3 py-2 text-center text-sm text-red-700">
                  {requestError}
                </p>
              )}
              {user ? (
                <div className="flex flex-col gap-2">
                  {viewingRequested ? (
                    <p className="rounded-full bg-green-50 px-3 py-2 text-center text-sm text-green-700">
                      Viewing requested
                    </p>
                  ) : (
                    <button
                      onClick={() => setViewingOpen(true)}
                      disabled={pendingKind != null}
                      className="w-full rounded-full border border-forest px-4 py-3 text-sm font-semibold text-forest transition-colors hover:bg-sage/40 disabled:opacity-60"
                    >
                      Request a viewing
                    </button>
                  )}
                  {rentRequested ? (
                    <p className="rounded-full bg-green-50 px-3 py-2 text-center text-sm text-green-700">
                      Rent request sent
                    </p>
                  ) : (
                    <button
                      onClick={() => handleRequest('rent')}
                      disabled={pendingKind != null}
                      className="w-full rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
                    >
                      {pendingKind === 'rent' ? 'Sending…' : 'Request to Rent'}
                    </button>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="block w-full rounded-full bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Log in to Request
                </Link>
              )}
            </div>
          ) : (
            <p className="mt-4 rounded-full bg-muted px-3 py-2.5 text-center text-sm text-muted-foreground">
              Currently unavailable
            </p>
          )}
        </aside>
      </div>

      <SimilarProperties propertyId={property.id} />

      <ViewingRequestModal
        open={viewingOpen}
        pending={pendingKind === 'viewing'}
        onClose={() => setViewingOpen(false)}
        onSubmit={(extras) => handleRequest('viewing', extras)}
      />
    </motion.div>
  )
}

function Fact({ label, value }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  )
}

function WhatsAppIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12.04 2c-5.46 0-9.9 4.44-9.9 9.9 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21h.01c5.46 0 9.9-4.44 9.9-9.9 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.12h-.01c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.37c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.42 5.82c0 4.54-3.7 8.22-8.23 8.22Zm4.52-6.16c-.25-.12-1.47-.72-1.7-.81-.23-.08-.4-.12-.56.12-.17.25-.64.8-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.15-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.84-.2-.48-.41-.42-.56-.42h-.48c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.24 3.74 1.49.64 1.9.7 2.58.59.39-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.1-.23-.17-.48-.29Z" />
    </svg>
  )
}
