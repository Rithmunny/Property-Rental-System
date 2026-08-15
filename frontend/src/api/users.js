// Mock extensions: PATCH /api/admin/landlords/:id — { status: 'active'|'pending'|'suspended' }
import { USE_MOCK } from './config'
import { request } from './client'
import { getUsers, updateLandlordStatus as persistLandlordStatus } from './mockStore'

async function mockListLandlords() {
  return getUsers().landlords
}

async function mockListTenants() {
  return getUsers().tenants
}

async function mockUpdateLandlordStatus(id, status) {
  const updated = persistLandlordStatus(id, status)
  if (!updated) throw new Error('Landlord not found')
  return updated
}

export async function listLandlords() {
  if (USE_MOCK) return mockListLandlords()
  return request('/api/admin/landlords')
}

export async function listTenants() {
  if (USE_MOCK) return mockListTenants()
  return request('/api/admin/tenants')
}

export async function updateLandlordStatus(id, status) {
  if (USE_MOCK) return mockUpdateLandlordStatus(id, status)
  return request(`/api/admin/landlords/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}
