import { prisma } from '../config/prisma.js'
import { HttpError } from '../utils/httpError.js'
import { assertNotSuspended } from '../middleware/auth.js'
import { isAdmin } from '../utils/roles.js'
import { toRequestDto, requestInclude } from '../dto/rental.js'
import { parseDate, parseId, todayUtc } from '../utils/dates.js'
import {
  isUniqueViolation,
  findActiveContract,
  createActiveContract,
  markPropertyUnavailable,
} from './occupancy.js'

function normalizeKind(kind) {
  return kind === 'viewing' ? 'viewing' : 'rent'
}

function requestKey(propertyId, tenantId, kind) {
  return { propertyId_tenantId_kind: { propertyId, tenantId, kind } }
}

export async function createRequest(user, { propertyId, kind, viewingDate, viewingTime, note }) {
  if (user.role !== 'tenant') throw new HttpError(403, 'Only tenants can send requests')
  const id = parseId(propertyId)
  if (!id) throw new HttpError(400, 'Property is required')
  const requestKind = normalizeKind(kind)
  const property = await prisma.property.findUnique({
    where: { id },
    include: { landlordUser: true },
  })
  if (!property) throw new HttpError(404, 'Property not found')
  if (requestKind === 'rent' && !property.available) {
    throw new HttpError(409, 'This listing is no longer available for rent')
  }

  try {
    const created = await prisma.rentalRequest.create({
      data: {
        propertyId: id,
        tenantId: user.id,
        kind: requestKind,
        status: 'pending',
        requestedDate: todayUtc(),
        viewingDate: requestKind === 'viewing' ? parseDate(viewingDate) || todayUtc() : null,
        viewingTime: requestKind === 'viewing' ? viewingTime || '10:00' : null,
        note: requestKind === 'viewing' ? String(note || '') : '',
      },
      include: requestInclude,
    })
    return toRequestDto(created)
  } catch (error) {
    // The unique index on (propertyId, tenantId, kind) turned the old
    // check-then-create race into a single atomic insert. A second submit —
    // double-click or parallel calls — lands here and returns the row the
    // first submit created, so the tenant never sees a duplicate.
    if (isUniqueViolation(error)) {
      const existing = await prisma.rentalRequest.findUnique({
        where: requestKey(id, user.id, requestKind),
        include: requestInclude,
      })
      if (existing) return toRequestDto(existing)
    }
    throw error
  }
}

export async function listMyRequests(user) {
  if (user.role !== 'tenant') return []
  const requests = await prisma.rentalRequest.findMany({
    where: { tenantId: user.id },
    include: requestInclude,
    orderBy: { id: 'desc' },
  })
  return requests.map(toRequestDto)
}

export async function listInboxRequests(user) {
  if (user.role !== 'landlord') return []
  const requests = await prisma.rentalRequest.findMany({
    where: { property: { landlordId: user.id } },
    include: requestInclude,
    orderBy: { id: 'desc' },
  })
  return requests.map(toRequestDto)
}

export async function updateRequestStatus(user, id, status) {
  const requestId = parseId(id)
  if (!requestId) throw new HttpError(404, 'Request not found')
  if (!['pending', 'accepted', 'declined'].includes(status)) {
    throw new HttpError(400, 'Invalid status')
  }

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const request = await tx.rentalRequest.findUnique({
        where: { id: requestId },
        include: requestInclude,
      })
      if (!request) throw new HttpError(404, 'Request not found')
      if (!isAdmin(user.role) && request.property.landlordId !== user.id) {
        throw new HttpError(403, 'You cannot update this request')
      }
      if (user.role === 'landlord') assertNotSuspended(user)

      // An accepted rent request already carries an active contract; moving it
      // back would leave the contract behind with no request pointing at it.
      if (request.kind !== 'viewing' && request.status === 'accepted' && status !== 'accepted') {
        throw new HttpError(409, 'This request is already accepted and its contract is active')
      }

      if (status === 'accepted' && request.kind !== 'viewing') {
        const occupied = await findActiveContract(tx, request.propertyId)
        if (occupied && occupied.tenantId !== request.tenantId) {
          throw new HttpError(409, 'This listing already has an active contract with another tenant')
        }
        if (!occupied) {
          await createActiveContract(tx, request.property, request.tenantId)
          await markPropertyUnavailable(tx, request.propertyId)
        }
        // If the same tenant already holds the contract (for example created
        // manually), accepting again is a no-op rather than a duplicate.
      }

      return tx.rentalRequest.update({
        where: { id: requestId },
        data: { status },
        include: requestInclude,
      })
    })
    return toRequestDto(updated)
  } catch (error) {
    // Two accepts for different tenants on one property can both pass the
    // in-transaction check; the partial unique index on active contracts then
    // rejects the loser at commit. Report it as the occupancy conflict it is.
    if (isUniqueViolation(error)) {
      throw new HttpError(409, 'This listing already has an active contract with another tenant')
    }
    throw error
  }
}
