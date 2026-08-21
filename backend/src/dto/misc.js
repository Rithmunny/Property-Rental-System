import { toDateString } from '../utils/dates.js'

export function toThreadDto(thread) {
  const messages = [...(thread.messages || [])]
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .map((message) => ({
      id: message.id,
      fromEmail: message.fromUser?.email || message.fromEmail,
      fromRole: message.fromUser?.role || message.fromRole,
      text: message.text,
      createdAt: message.createdAt instanceof Date ? message.createdAt.toISOString() : message.createdAt,
    }))
  return {
    id: thread.id,
    propertyId: thread.propertyId,
    tenantEmail: thread.tenant?.email,
    tenantName: thread.tenant?.name,
    landlord: thread.property?.landlordUser?.name,
    messages,
  }
}

export function toSavedSearchDto(search) {
  return {
    id: search.id,
    filters: search.filters || {},
    createdAt: search.createdAt instanceof Date ? search.createdAt.toISOString() : search.createdAt,
    lastSeenMaxId: search.lastSeenMaxId || 0,
  }
}

export function toPaymentHistoryDto(payment) {
  return {
    id: payment.id,
    month: payment.month,
    amount: payment.amount,
    method: payment.method,
    status: payment.status,
    date: toDateString(payment.date),
  }
}

export const threadInclude = {
  tenant: { select: { id: true, name: true, email: true } },
  property: { include: { landlordUser: { select: { id: true, name: true } } } },
  messages: { include: { fromUser: { select: { email: true, role: true } } } },
}
