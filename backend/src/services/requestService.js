import { prisma } from '../config/prisma.js'
import { HttpError } from '../utils/httpError.js'
import { assertNotSuspended } from '../middleware/auth.js'
import { isAdmin } from '../utils/roles.js'
import { toRequestDto, requestInclude } from '../dto/rental.js'
import { parseDate, parseId, todayUtc } from '../utils/dates.js'

function normalizeKind(kind) {
  return kind === 'viewing' ? 'viewing' : 'rent'
}

async function addYearContract(request) {
  const property = request.property
  const already = await prisma.contract.findFirst({
    where: {
      propertyId: request.propertyId,
      tenantId: request.tenantId,
      status: 'active',
    },
  })
  if (already) return
  const start = todayUtc()
  const end = new Date(start)
  end.setUTCFullYear(end.getUTCFullYear() + 1)
  const rent = property?.price ?? 0
  const depositMonths = property?.depositMonths || 2
  await prisma.contract.create({
    data: {
      propertyId: request.propertyId,
      tenantId: request.tenantId,
      startDate: start,
      endDate: end,
      rent,
      deposit: rent * depositMonths,
      status: 'active',
      paymentMethod: 'aba',
    },
  })
  await prisma.property.update({
    where: { id: request.propertyId },
    data: { available: false },
  })
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

  const existing = await prisma.rentalRequest.findFirst({
    where: { propertyId: id, tenantId: user.id, kind: requestKind },
  })
  if (existing) {
    return toRequestDto(await prisma.rentalRequest.findUnique({ where: { id: existing.id }, include: requestInclude }))
  }

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
  const request = await prisma.rentalRequest.findUnique({
    where: { id: requestId },
    include: requestInclude,
  })
  if (!request) throw new HttpError(404, 'Request not found')
  if (!isAdmin(user.role) && request.property.landlordId !== user.id) {
    throw new HttpError(403, 'You cannot update this request')
  }
  if (user.role === 'landlord') assertNotSuspended(user)

  const updated = await prisma.rentalRequest.update({
    where: { id: requestId },
    data: { status },
    include: requestInclude,
  })
  if (status === 'accepted' && updated.kind !== 'viewing') {
    await addYearContract(updated)
  }
  return toRequestDto(updated)
}
