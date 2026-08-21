import { prisma } from '../config/prisma.js'
import { HttpError } from '../utils/httpError.js'
import { toReviewDto } from '../dto/review.js'
import { parseId, todayUtc } from '../utils/dates.js'

async function canTenantReview(tenantId, propertyId) {
  const accepted = await prisma.rentalRequest.findFirst({
    where: {
      tenantId,
      propertyId,
      kind: { not: 'viewing' },
      status: 'accepted',
    },
  })
  if (accepted) return true
  const rental = await prisma.contract.findFirst({
    where: {
      tenantId,
      propertyId,
      status: { not: 'expired' },
    },
  })
  return Boolean(rental)
}

export async function listReviews(propertyId) {
  const id = propertyId == null || propertyId === '' ? null : parseId(propertyId)
  const reviews = await prisma.review.findMany({
    where: id ? { propertyId: id } : undefined,
    orderBy: { createdAt: 'desc' },
  })
  return reviews.map(toReviewDto)
}

export async function createReview(user, { propertyId, rating, comment }) {
  if (user.role !== 'tenant') throw new HttpError(403, 'Only tenants can leave reviews')
  const id = parseId(propertyId)
  if (!id) throw new HttpError(400, 'Property is required')
  const property = await prisma.property.findUnique({ where: { id } })
  if (!property) throw new HttpError(404, 'Property not found')
  if (!(await canTenantReview(user.id, id))) {
    throw new HttpError(400, 'You can review a home after an accepted rent request')
  }
  const existing = await prisma.review.findUnique({
    where: { propertyId_tenantId: { propertyId: id, tenantId: user.id } },
  })
  if (existing) throw new HttpError(400, 'You already reviewed this listing')
  const stars = Math.min(5, Math.max(1, Number(rating) || 5))
  const created = await prisma.review.create({
    data: {
      propertyId: id,
      tenantId: user.id,
      tenantEmail: user.email,
      tenantName: user.name,
      rating: stars,
      comment: String(comment || '').trim(),
      createdAt: todayUtc(),
    },
  })
  return toReviewDto(created)
}
