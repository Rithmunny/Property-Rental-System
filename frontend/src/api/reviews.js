import { USE_MOCK } from './config'
import { request } from './client'
import { getReviews, setReviews, getSession, nextId, getRequests, getTenantPayments } from './mockStore'

function mockList(propertyId) {
  const reviews = getReviews()
  if (propertyId == null) return reviews
  return reviews.filter((r) => r.propertyId === Number(propertyId))
}

function canReviewProperty(session, propertyId) {
  const email = session.user.email
  const acceptedRent = getRequests().some(
    (r) =>
      r.propertyId === Number(propertyId) &&
      r.tenantEmail === email &&
      (r.kind ?? 'rent') !== 'viewing' &&
      r.status === 'accepted',
  )
  if (acceptedRent) return true
  const current = getTenantPayments()?.currentRental
  return current?.propertyId === Number(propertyId)
}

async function mockCreate({ propertyId, rating, comment }) {
  const session = getSession()
  if (!session?.user) throw new Error('Login required')
  if (session.user.role !== 'tenant') throw new Error('Only tenants can leave reviews')
  const id = Number(propertyId)
  if (!canReviewProperty(session, id)) {
    throw new Error('You can review a home after an accepted rent request')
  }
  const reviews = getReviews()
  const existing = reviews.find((r) => r.propertyId === id && r.tenantEmail === session.user.email)
  if (existing) throw new Error('You already reviewed this listing')
  const stars = Math.min(5, Math.max(1, Number(rating) || 5))
  const created = {
    id: nextId(reviews),
    propertyId: id,
    tenantEmail: session.user.email,
    tenantName: session.user.name,
    rating: stars,
    comment: String(comment || '').trim(),
    createdAt: new Date().toISOString().slice(0, 10),
  }
  setReviews([created, ...reviews])
  return created
}

export async function listReviews(propertyId) {
  if (USE_MOCK) return mockList(propertyId)
  const query = propertyId != null ? `?propertyId=${propertyId}` : ''
  return request(`/api/reviews${query}`)
}

export async function createReview(data) {
  if (USE_MOCK) return mockCreate(data)
  return request('/api/reviews', { method: 'POST', body: JSON.stringify(data) })
}

export function hasReviewed(propertyId, email) {
  return getReviews().some((r) => r.propertyId === Number(propertyId) && r.tenantEmail === email)
}

export function canTenantReview(propertyId) {
  const session = getSession()
  if (!session?.user || session.user.role !== 'tenant') return false
  if (hasReviewed(propertyId, session.user.email)) return false
  return canReviewProperty(session, propertyId)
}
