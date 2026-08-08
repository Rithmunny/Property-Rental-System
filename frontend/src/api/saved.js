import { USE_MOCK } from './config'
import { request } from './client'
import { getSavedByEmail, setSavedByEmail, getSession } from './mockStore'

async function mockList() {
  const session = getSession()
  if (!session?.user) return []
  return getSavedByEmail(session.user.email)
}

async function mockToggle(propertyId) {
  const session = getSession()
  if (!session?.user) throw new Error('Login required')
  const ids = getSavedByEmail(session.user.email)
  const id = Number(propertyId)
  const next = ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id]
  setSavedByEmail(session.user.email, next)
  return next
}

async function mockIsSaved(propertyId) {
  const ids = await mockList()
  return ids.includes(Number(propertyId))
}

export async function listSaved() {
  if (USE_MOCK) return mockList()
  const data = await request('/api/saved')
  return data.map((item) => (typeof item === 'object' ? item.propertyId : item))
}

export async function toggleSaved(propertyId) {
  if (USE_MOCK) return mockToggle(propertyId)
  return request(`/api/saved/${propertyId}`, { method: 'POST' })
}

export async function isSaved(propertyId) {
  if (USE_MOCK) return mockIsSaved(propertyId)
  try {
    await request(`/api/saved/${propertyId}`)
    return true
  } catch {
    return false
  }
}
