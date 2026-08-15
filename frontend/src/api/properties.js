// updateProperty already supports available toggle / soft fields via PUT body
import { USE_MOCK } from './config'
import { request } from './client'
import { getProperties, setProperties, nextId } from './mockStore'

async function mockList() {
  return getProperties()
}

async function mockGet(id) {
  const property = getProperties().find((p) => p.id === Number(id))
  if (!property) throw new Error('Property not found')
  return property
}

async function mockCreate(data) {
  const properties = getProperties()
  const newProperty = {
    rating: 0,
    reviews: 0,
    ...data,
    id: nextId(properties),
    landlordOwned: true,
  }
  setProperties([newProperty, ...properties])
  return newProperty
}

async function mockUpdate(id, updates) {
  const properties = getProperties()
  const next = properties.map((p) => (p.id === Number(id) ? { ...p, ...updates } : p))
  setProperties(next)
  return next.find((p) => p.id === Number(id))
}

async function mockDelete(id) {
  const properties = getProperties().filter((p) => p.id !== Number(id))
  setProperties(properties)
}

export async function listProperties() {
  if (USE_MOCK) return mockList()
  return request('/api/properties')
}

export async function getProperty(id) {
  if (USE_MOCK) return mockGet(id)
  return request(`/api/properties/${id}`)
}

export async function createProperty(data) {
  if (USE_MOCK) return mockCreate(data)
  return request('/api/properties', { method: 'POST', body: JSON.stringify(data) })
}

export async function updateProperty(id, data) {
  if (USE_MOCK) return mockUpdate(id, data)
  return request(`/api/properties/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export async function deleteProperty(id) {
  if (USE_MOCK) return mockDelete(id)
  return request(`/api/properties/${id}`, { method: 'DELETE' })
}
