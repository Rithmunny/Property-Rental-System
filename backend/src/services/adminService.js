import { prisma } from '../config/prisma.js'
import { HttpError } from '../utils/httpError.js'
import { parseId } from '../utils/dates.js'

export async function listLandlords() {
  const landlords = await prisma.user.findMany({
    where: { role: 'landlord' },
    include: { _count: { select: { properties: true } } },
    orderBy: { id: 'asc' },
  })
  return landlords.map((user) => ({
    id: user.id,
    name: user.name,
    telegram: user.telegram || '',
    listings: user._count.properties,
    status: user.status,
  }))
}

export async function listTenants() {
  const tenants = await prisma.user.findMany({
    where: { role: 'tenant', NOT: { email: { endsWith: '@example.com' } } },
    orderBy: { id: 'asc' },
  })
  return tenants.map((user) => ({
    id: user.id,
    name: user.name,
    telegram: user.telegram || '',
    status: user.status,
  }))
}

export async function updateLandlordStatus(id, status) {
  const landlordId = parseId(id)
  if (!landlordId) throw new HttpError(404, 'Landlord not found')
  if (!['active', 'pending', 'suspended'].includes(status)) {
    throw new HttpError(400, 'Invalid status')
  }
  const user = await prisma.user.findUnique({ where: { id: landlordId } })
  if (!user || user.role !== 'landlord') throw new HttpError(404, 'Landlord not found')
  const updated = await prisma.user.update({
    where: { id: landlordId },
    data: { status },
    include: { _count: { select: { properties: true } } },
  })
  return {
    id: updated.id,
    name: updated.name,
    telegram: updated.telegram || '',
    listings: updated._count.properties,
    status: updated.status,
  }
}
