import { prisma } from '../config/prisma.js'
import { HttpError } from '../utils/httpError.js'
import { toThreadDto, threadInclude } from '../dto/misc.js'
import { parseId } from '../utils/dates.js'

export async function listThreads(user) {
  const where =
    user.role === 'tenant'
      ? { tenantId: user.id }
      : user.role === 'landlord'
        ? { property: { landlordId: user.id } }
        : { id: -1 }
  const threads = await prisma.messageThread.findMany({
    where,
    include: threadInclude,
    orderBy: { id: 'desc' },
  })
  return threads.map(toThreadDto)
}

export async function sendMessage(user, { propertyId, tenantEmail, text }) {
  const body = String(text || '').trim()
  if (!body) throw new HttpError(400, 'Message cannot be empty')
  const id = parseId(propertyId)
  if (!id) throw new HttpError(400, 'Property is required')
  const property = await prisma.property.findUnique({
    where: { id },
    include: { landlordUser: true },
  })
  if (!property) throw new HttpError(404, 'Property not found')

  let tenant
  if (user.role === 'tenant') {
    tenant = user
  } else if (user.role === 'landlord') {
    if (property.landlordId !== user.id) throw new HttpError(403, 'Not your listing')
    const email = String(tenantEmail || '').trim().toLowerCase()
    if (!email) throw new HttpError(400, 'Tenant is required')
    tenant = await prisma.user.findUnique({ where: { email } })
    if (!tenant || tenant.role !== 'tenant') throw new HttpError(404, 'Tenant not found')
  } else {
    throw new HttpError(403, 'Only tenants and landlords can send messages')
  }

  let thread = await prisma.messageThread.findUnique({
    where: { propertyId_tenantId: { propertyId: id, tenantId: tenant.id } },
  })
  if (!thread) {
    thread = await prisma.messageThread.create({
      data: { propertyId: id, tenantId: tenant.id },
    })
  }

  await prisma.message.create({
    data: { threadId: thread.id, fromUserId: user.id, text: body },
  })

  const full = await prisma.messageThread.findUnique({
    where: { id: thread.id },
    include: threadInclude,
  })
  return toThreadDto(full)
}
