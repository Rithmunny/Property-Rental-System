import { prisma } from '../config/prisma.js'
import { HttpError } from '../utils/httpError.js'
import { assertNotSuspended } from '../middleware/auth.js'
import { toContractDto, toCurrentRentalDto, contractInclude } from '../dto/rental.js'
import { computeContractStatus, parseDate, parseId, asNumber } from '../utils/dates.js'

function withComputedStatus(contract) {
  return {
    ...contract,
    status: computeContractStatus(contract.startDate, contract.endDate, contract.status),
  }
}

export async function getCurrentRental(user) {
  if (user.role !== 'tenant') return null
  const contracts = await prisma.contract.findMany({
    where: { tenantId: user.id },
    include: contractInclude,
    orderBy: { startDate: 'desc' },
  })
  const active = contracts
    .map(withComputedStatus)
    .find((contract) => contract.status === 'active' || contract.status === 'ending soon')
  return active ? toCurrentRentalDto(active) : null
}

export async function listContracts(user) {
  const where = user.role === 'admin' ? {} : { property: { landlordId: user.id } }
  const contracts = await prisma.contract.findMany({
    where,
    include: contractInclude,
    orderBy: { id: 'desc' },
  })
  return contracts.map((contract) => toContractDto(withComputedStatus(contract)))
}

export async function createContract(user, body) {
  if (user.role !== 'landlord' && user.role !== 'admin') {
    throw new HttpError(403, 'Only landlords can create contracts')
  }
  if (user.role === 'landlord') assertNotSuspended(user)
  const propertyId = parseId(body.propertyId)
  if (!propertyId) throw new HttpError(400, 'Property is required')
  const property = await prisma.property.findUnique({ where: { id: propertyId } })
  if (!property) throw new HttpError(404, 'Property not found')
  if (user.role === 'landlord' && property.landlordId !== user.id) {
    throw new HttpError(403, 'You can only create contracts for your listings')
  }

  const tenantName = String(body.tenant || '').trim()
  if (!tenantName) throw new HttpError(400, 'Tenant is required')
  const tenant = await prisma.user.findFirst({
    where: {
      role: 'tenant',
      OR: [
        { name: { equals: tenantName, mode: 'insensitive' } },
        { email: { equals: tenantName.toLowerCase(), mode: 'insensitive' } },
      ],
    },
  })
  if (!tenant) throw new HttpError(400, 'Tenant not found — they must have an account')

  const startDate = parseDate(body.startDate)
  const endDate = parseDate(body.endDate)
  if (!startDate || !endDate) throw new HttpError(400, 'Start and end dates are required')

  const created = await prisma.contract.create({
    data: {
      propertyId,
      tenantId: tenant.id,
      startDate,
      endDate,
      rent: asNumber(body.rent, property.price),
      deposit: asNumber(body.deposit, 0),
      status: body.status || 'active',
      paymentMethod: body.paymentMethod === 'cash' ? 'cash' : 'aba',
    },
    include: contractInclude,
  })
  await prisma.property.update({ where: { id: propertyId }, data: { available: false } })
  return toContractDto(withComputedStatus(created))
}
