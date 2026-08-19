import { USE_MOCK } from './config'
import { request } from './client'
import { getSavedSearchesByEmail, setSavedSearchesByEmail, getSession, nextId, getProperties } from './mockStore'
import { matchesPropertyFilters } from '@/utils/listing'

function currentEmail() {
  return getSession()?.user?.email
}

function maxPropertyId(properties = getProperties()) {
  return properties.length ? Math.max(...properties.map((p) => Number(p.id) || 0)) : 0
}

async function mockList() {
  const email = currentEmail()
  if (!email) return []
  return getSavedSearchesByEmail(email)
}

async function mockCreate(filters) {
  const session = getSession()
  if (!session?.user) throw new Error('Login required')
  if (session.user.role !== 'tenant') throw new Error('Only tenants can save searches')
  const searches = getSavedSearchesByEmail(session.user.email)
  const created = {
    id: nextId(searches),
    filters: { ...filters },
    createdAt: new Date().toISOString(),
    lastSeenMaxId: maxPropertyId(),
  }
  setSavedSearchesByEmail(session.user.email, [created, ...searches])
  return created
}

async function mockRemove(id) {
  const email = currentEmail()
  if (!email) return
  const next = getSavedSearchesByEmail(email).filter((s) => s.id !== Number(id))
  setSavedSearchesByEmail(email, next)
}

async function mockMarkSeen(id) {
  const email = currentEmail()
  if (!email) return null
  const maxId = maxPropertyId()
  const next = getSavedSearchesByEmail(email).map((s) =>
    s.id === Number(id) ? { ...s, lastSeenMaxId: maxId } : s,
  )
  setSavedSearchesByEmail(email, next)
  return next.find((s) => s.id === Number(id))
}

export function matchingNewListings(search, properties) {
  return properties.filter(
    (p) => matchesPropertyFilters(p, search.filters || {}) && p.id > (search.lastSeenMaxId || 0),
  )
}

export async function listSavedSearches() {
  if (USE_MOCK) return mockList()
  return request('/api/saved-searches')
}

export async function createSavedSearch(filters) {
  if (USE_MOCK) return mockCreate(filters)
  return request('/api/saved-searches', { method: 'POST', body: JSON.stringify({ filters }) })
}

export async function deleteSavedSearch(id) {
  if (USE_MOCK) return mockRemove(id)
  return request(`/api/saved-searches/${id}`, { method: 'DELETE' })
}

export async function markSavedSearchSeen(id) {
  if (USE_MOCK) return mockMarkSeen(id)
  return request(`/api/saved-searches/${id}/seen`, { method: 'PATCH' })
}
