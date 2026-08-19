// Accepting a rent request also creates a contract stub in mockStore (see mockUpdateStatus)
import { USE_MOCK } from './config'
import { request } from './client'
import {
  getRequests,
  setRequests,
  getSession,
  nextId,
  getProperties,
  getContracts,
  setContracts,
} from './mockStore'

function normalizeKind(kind) {
  return kind === 'viewing' ? 'viewing' : 'rent'
}

function requestKind(r) {
  return r.kind === 'viewing' ? 'viewing' : 'rent'
}

async function mockCreate(propertyId, kind, extras = {}) {
  const session = getSession()
  if (!session?.user) throw new Error('Login required')
  const requestKindValue = normalizeKind(kind)
  const requests = getRequests()
  const existing = requests.find(
    (r) =>
      r.propertyId === Number(propertyId) &&
      r.tenantEmail === session.user.email &&
      requestKind(r) === requestKindValue,
  )
  if (existing) return existing

  const property = getProperties().find((p) => p.id === Number(propertyId))
  const newRequest = {
    id: nextId(requests),
    propertyId: Number(propertyId),
    tenantEmail: session.user.email,
    tenantName: session.user.name,
    landlord: property?.landlord ?? 'Unknown',
    kind: requestKindValue,
    status: 'pending',
    requestedDate: new Date().toISOString().slice(0, 10),
  }
  if (requestKindValue === 'viewing') {
    newRequest.viewingDate = extras.viewingDate || newRequest.requestedDate
    newRequest.viewingTime = extras.viewingTime || '10:00'
    newRequest.note = extras.note || ''
  }
  setRequests([newRequest, ...requests])
  return newRequest
}

async function mockListMine() {
  const session = getSession()
  if (!session?.user) return []
  const all = getRequests()
  const mine = all.filter((r) => r.tenantEmail === session.user.email)
  if (mine.length) return mine
  if (session.user.role === 'tenant') {
    return all.filter((r) => r.tenantEmail === 'demo@tenant.com')
  }
  return []
}

async function mockListInbox() {
  const session = getSession()
  if (!session?.user || session.user.role !== 'landlord') return []
  return getRequests()
}

async function mockUpdateStatus(id, status) {
  const requests = getRequests()
  const next = requests.map((r) => (r.id === Number(id) ? { ...r, status } : r))
  setRequests(next)
  const updated = next.find((r) => r.id === Number(id))

  if (updated && status === 'accepted' && requestKind(updated) !== 'viewing') {
    const property = getProperties().find((p) => p.id === updated.propertyId)
    const contracts = getContracts()
    const already = contracts.some(
      (c) =>
        c.propertyId === updated.propertyId &&
        c.tenant === (updated.tenantName ?? 'Tenant') &&
        c.status === 'active',
    )
    if (!already) {
      const start = new Date()
      const end = new Date(start)
      end.setFullYear(end.getFullYear() + 1)
      const rent = property?.price ?? 0
      const depositMonths = property?.depositMonths || 2
      setContracts([
        {
          id: nextId(contracts),
          propertyId: updated.propertyId,
          tenant: updated.tenantName ?? 'Tenant',
          startDate: start.toISOString().slice(0, 10),
          endDate: end.toISOString().slice(0, 10),
          rent,
          deposit: rent * depositMonths,
          status: 'active',
        },
        ...contracts,
      ])
    }
  }

  return updated
}

async function mockHasRequest(propertyId, kind) {
  const session = getSession()
  if (!session?.user) return false
  const requestKindValue = normalizeKind(kind)
  return getRequests().some(
    (r) =>
      r.propertyId === Number(propertyId) &&
      r.tenantEmail === session.user.email &&
      requestKind(r) === requestKindValue,
  )
}

export async function createRequest(propertyId, kind = 'rent', extras = {}) {
  const requestKindValue = normalizeKind(kind)
  if (USE_MOCK) return mockCreate(propertyId, requestKindValue, extras)
  return request('/api/requests', {
    method: 'POST',
    body: JSON.stringify({ propertyId, kind: requestKindValue, ...extras }),
  })
}

export async function listMyRequests() {
  if (USE_MOCK) return mockListMine()
  return request('/api/requests/mine')
}

export async function listInboxRequests() {
  if (USE_MOCK) return mockListInbox()
  return request('/api/requests/inbox')
}

export async function updateRequestStatus(id, status) {
  if (USE_MOCK) return mockUpdateStatus(id, status)
  return request(`/api/requests/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) })
}

export async function hasRequestForProperty(propertyId, kind = 'rent') {
  const requestKindValue = normalizeKind(kind)
  if (USE_MOCK) return mockHasRequest(propertyId, requestKindValue)
  const requests = await request('/api/requests/mine')
  return requests.some(
    (r) => r.propertyId === Number(propertyId) && requestKind(r) === requestKindValue,
  )
}
