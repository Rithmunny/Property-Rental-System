// Accepting a request also creates a contract stub in mockStore (see mockUpdateStatus)
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

async function mockCreate(propertyId) {
  const session = getSession()
  if (!session?.user) throw new Error('Login required')
  const requests = getRequests()
  const existing = requests.find(
    (r) => r.propertyId === Number(propertyId) && r.tenantEmail === session.user.email,
  )
  if (existing) return existing

  const property = getProperties().find((p) => p.id === Number(propertyId))
  const newRequest = {
    id: nextId(requests),
    propertyId: Number(propertyId),
    tenantEmail: session.user.email,
    tenantName: session.user.name,
    landlord: property?.landlord ?? 'Unknown',
    status: 'pending',
    requestedDate: new Date().toISOString().slice(0, 10),
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

  if (updated && status === 'accepted') {
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
      setContracts([
        {
          id: nextId(contracts),
          propertyId: updated.propertyId,
          tenant: updated.tenantName ?? 'Tenant',
          startDate: start.toISOString().slice(0, 10),
          endDate: end.toISOString().slice(0, 10),
          rent,
          deposit: rent * 2,
          status: 'active',
        },
        ...contracts,
      ])
    }
  }

  return updated
}

async function mockHasRequest(propertyId) {
  const session = getSession()
  if (!session?.user) return false
  return getRequests().some(
    (r) => r.propertyId === Number(propertyId) && r.tenantEmail === session.user.email,
  )
}

export async function createRequest(propertyId) {
  if (USE_MOCK) return mockCreate(propertyId)
  return request('/api/requests', { method: 'POST', body: JSON.stringify({ propertyId }) })
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

export async function hasRequestForProperty(propertyId) {
  if (USE_MOCK) return mockHasRequest(propertyId)
  const requests = await request('/api/requests/mine')
  return requests.some((r) => r.propertyId === Number(propertyId))
}
