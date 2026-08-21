import { prisma } from '../config/prisma.js'
import { HttpError } from '../utils/httpError.js'
import { parseId } from '../utils/dates.js'
import { toSavedSearchDto } from '../dto/misc.js'

export async function listSaved(user) {
  const rows = await prisma.savedProperty.findMany({
    where: { userId: user.id },
    orderBy: { id: 'asc' },
  })
  return rows.map((row) => row.propertyId)
}

export async function toggleSaved(user, propertyId) {
  const id = parseId(propertyId)
  if (!id) throw new HttpError(400, 'Property is required')
  const property = await prisma.property.findUnique({ where: { id } })
  if (!property) throw new HttpError(404, 'Property not found')
  const existing = await prisma.savedProperty.findUnique({
    where: { userId_propertyId: { userId: user.id, propertyId: id } },
  })
  if (existing) {
    await prisma.savedProperty.delete({ where: { id: existing.id } })
  } else {
    await prisma.savedProperty.create({ data: { userId: user.id, propertyId: id } })
  }
  return listSaved(user)
}

export async function isSaved(user, propertyId) {
  const id = parseId(propertyId)
  if (!id) throw new HttpError(404, 'Not saved')
  const existing = await prisma.savedProperty.findUnique({
    where: { userId_propertyId: { userId: user.id, propertyId: id } },
  })
  if (!existing) throw new HttpError(404, 'Not saved')
  return { saved: true }
}

export async function listSavedSearches(user) {
  const searches = await prisma.savedSearch.findMany({
    where: { userId: user.id },
    orderBy: { id: 'desc' },
  })
  return searches.map(toSavedSearchDto)
}

export async function createSavedSearch(user, filters) {
  if (user.role !== 'tenant') throw new HttpError(403, 'Only tenants can save searches')
  const max = await prisma.property.aggregate({ _max: { id: true } })
  const created = await prisma.savedSearch.create({
    data: {
      userId: user.id,
      filters: filters || {},
      lastSeenMaxId: max._max.id || 0,
    },
  })
  return toSavedSearchDto(created)
}

export async function deleteSavedSearch(user, id) {
  const searchId = parseId(id)
  if (!searchId) throw new HttpError(404, 'Saved search not found')
  const search = await prisma.savedSearch.findUnique({ where: { id: searchId } })
  if (!search || search.userId !== user.id) throw new HttpError(404, 'Saved search not found')
  await prisma.savedSearch.delete({ where: { id: searchId } })
  return { ok: true }
}

export async function markSavedSearchSeen(user, id) {
  const searchId = parseId(id)
  if (!searchId) throw new HttpError(404, 'Saved search not found')
  const search = await prisma.savedSearch.findUnique({ where: { id: searchId } })
  if (!search || search.userId !== user.id) throw new HttpError(404, 'Saved search not found')
  const max = await prisma.property.aggregate({ _max: { id: true } })
  const updated = await prisma.savedSearch.update({
    where: { id: searchId },
    data: { lastSeenMaxId: max._max.id || 0 },
  })
  return toSavedSearchDto(updated)
}
