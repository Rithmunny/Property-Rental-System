import { todayUtc } from '../utils/dates.js'

// Prisma surfaces a unique-violation as P2002. A violation raised on COMMIT of
// an interactive transaction can arrive as P2010 with the Postgres message
// embedded, so match that too.
export function isUniqueViolation(error) {
  if (error?.code === 'P2002') return true
  if (error?.code === 'P2010' && /unique|duplicate/i.test(String(error?.message))) return true
  return false
}

export async function findActiveContract(db, propertyId) {
  return db.contract.findFirst({
    where: { propertyId, status: 'active' },
    select: { id: true, tenantId: true },
  })
}

export async function createActiveContract(db, property, tenantId) {
  const start = todayUtc()
  const end = new Date(start)
  end.setUTCFullYear(end.getUTCFullYear() + 1)
  const rent = property?.price ?? 0
  const depositMonths = property?.depositMonths || 2
  return db.contract.create({
    data: {
      propertyId: property.id,
      tenantId,
      startDate: start,
      endDate: end,
      rent,
      deposit: rent * depositMonths,
      status: 'active',
      paymentMethod: 'aba',
    },
  })
}

export async function markPropertyUnavailable(db, propertyId) {
  return db.property.update({ where: { id: propertyId }, data: { available: false } })
}
