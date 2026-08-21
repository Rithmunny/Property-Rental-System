import { prisma } from '../config/prisma.js'
import { HttpError } from '../utils/httpError.js'
import { assertNotSuspended } from '../middleware/auth.js'
import { toPropertyDto, propertyInclude } from '../dto/property.js'
import { asNumber, asStringArray, parseId } from '../utils/dates.js'

function propertyPayload(body = {}, { partial = false } = {}) {
  const data = {}
  const assign = (key, value) => {
    if (value !== undefined) data[key] = value
  }

  if (!partial || body.title != null) assign('title', String(body.title || '').trim())
  if (!partial || body.type != null) assign('type', String(body.type || 'Apartment'))
  if (!partial || body.city != null) assign('city', String(body.city || '').trim())
  if (!partial || body.neighbourhood != null) assign('neighbourhood', String(body.neighbourhood || ''))
  if (!partial || body.address != null) assign('address', String(body.address || ''))
  if (!partial || body.price != null) assign('price', asNumber(body.price, 0))
  if (!partial || body.bedrooms != null) assign('bedrooms', asNumber(body.bedrooms, 1))
  if (!partial || body.bathrooms != null) assign('bathrooms', asNumber(body.bathrooms, 1))
  if (!partial || body.area != null) assign('area', asNumber(body.area, 0))
  if (!partial || body.lat != null) assign('lat', body.lat == null || body.lat === '' ? null : asNumber(body.lat, null))
  if (!partial || body.lng != null) assign('lng', body.lng == null || body.lng === '' ? null : asNumber(body.lng, null))
  if (!partial || body.image != null) assign('image', String(body.image || ''))
  if (!partial || body.images != null) assign('images', asStringArray(body.images))
  if (!partial || body.description != null) assign('description', String(body.description || ''))
  if (!partial || body.amenities != null) assign('amenities', asStringArray(body.amenities))
  if (!partial || body.available != null) assign('available', Boolean(body.available))
  if (!partial || body.furnished != null) assign('furnished', String(body.furnished || 'furnished'))
  if (!partial || body.leaseTermMonths != null) assign('leaseTermMonths', asNumber(body.leaseTermMonths, 12))
  if (!partial || body.depositMonths != null) assign('depositMonths', asNumber(body.depositMonths, 2))
  if (!partial || body.electricityRate != null) {
    assign(
      'electricityRate',
      body.electricityRate == null || body.electricityRate === '' ? null : asNumber(body.electricityRate, null),
    )
  }
  if (!partial || body.parkingFee != null) assign('parkingFee', asNumber(body.parkingFee, 0))
  if (!partial || body.telegram != null) assign('telegram', String(body.telegram || ''))
  if (!partial || body.whatsapp != null) assign('whatsapp', String(body.whatsapp || ''))
  if (!partial || body.phone != null) assign('phone', String(body.phone || ''))

  if (!partial && !data.title) throw new HttpError(400, 'Title is required')
  if (!partial && !data.city) throw new HttpError(400, 'City is required')
  return data
}

async function loadProperty(id) {
  const property = await prisma.property.findUnique({
    where: { id },
    include: propertyInclude,
  })
  if (!property) throw new HttpError(404, 'Property not found')
  return property
}

function canManage(user, property) {
  if (!user) return false
  if (user.role === 'admin') return true
  return user.role === 'landlord' && user.id === property.landlordId
}

export async function listProperties(currentUser) {
  const properties = await prisma.property.findMany({
    include: propertyInclude,
    orderBy: { id: 'asc' },
  })
  return properties.map((property) => toPropertyDto(property, currentUser))
}

export async function getProperty(id, currentUser) {
  const propertyId = parseId(id)
  if (!propertyId) throw new HttpError(404, 'Property not found')
  const property = await loadProperty(propertyId)
  return toPropertyDto(property, currentUser)
}

export async function createProperty(user, body) {
  if (user.role !== 'landlord') throw new HttpError(403, 'Only landlords can create listings')
  assertNotSuspended(user)
  const data = propertyPayload(body)
  if (data.available === undefined) data.available = true
  if (!data.telegram) data.telegram = user.telegram || ''
  if (!data.phone) data.phone = user.phone || ''
  const created = await prisma.property.create({
    data: { ...data, landlordId: user.id },
    include: propertyInclude,
  })
  return toPropertyDto(created, user)
}

export async function updateProperty(user, id, body) {
  const propertyId = parseId(id)
  if (!propertyId) throw new HttpError(404, 'Property not found')
  const property = await loadProperty(propertyId)
  if (!canManage(user, property)) throw new HttpError(403, 'You cannot edit this listing')
  if (user.role === 'landlord') assertNotSuspended(user)
  const updated = await prisma.property.update({
    where: { id: propertyId },
    data: propertyPayload(body, { partial: true }),
    include: propertyInclude,
  })
  return toPropertyDto(updated, user)
}

export async function deleteProperty(user, id) {
  const propertyId = parseId(id)
  if (!propertyId) throw new HttpError(404, 'Property not found')
  const property = await loadProperty(propertyId)
  if (!canManage(user, property)) throw new HttpError(403, 'You cannot delete this listing')
  if (user.role === 'landlord') assertNotSuspended(user)
  await prisma.property.delete({ where: { id: propertyId } })
  return { ok: true }
}
