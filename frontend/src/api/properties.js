// updateProperty already supports available toggle / soft fields via PUT body
import { USE_MOCK } from './config'
import { request } from './client'
import { getProperties, setProperties, nextId } from './mockStore'
import { withPropertyDefaults } from '@/utils/listing'

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
  const newProperty = withPropertyDefaults({
    rating: 0,
    reviews: 0,
    ...data,
    id: nextId(properties),
    landlordOwned: true,
  })
  setProperties([newProperty, ...properties])
  return newProperty
}

async function mockUpdate(id, updates) {
  const properties = getProperties()
  const next = properties.map((p) =>
    p.id === Number(id) ? withPropertyDefaults({ ...p, ...updates }) : p,
  )
  setProperties(next)
  return next.find((p) => p.id === Number(id))
}

async function mockDelete(id) {
  const properties = getProperties().filter((p) => p.id !== Number(id))
  setProperties(properties)
}

export async function listProperties() {
  const list = USE_MOCK ? await mockList() : await request('/api/properties')
  return list.map(withPropertyDefaults)
}

export async function getProperty(id) {
  const property = USE_MOCK ? await mockGet(id) : await request(`/api/properties/${id}`)
  return withPropertyDefaults(property)
}

export async function createProperty(data) {
  const created = USE_MOCK
    ? await mockCreate(data)
    : await request('/api/properties', { method: 'POST', body: JSON.stringify(data) })
  return withPropertyDefaults(created)
}

export async function updateProperty(id, data) {
  const updated = USE_MOCK
    ? await mockUpdate(id, data)
    : await request(`/api/properties/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  return withPropertyDefaults(updated)
}

export async function deleteProperty(id) {
  if (USE_MOCK) return mockDelete(id)
  return request(`/api/properties/${id}`, { method: 'DELETE' })
}
