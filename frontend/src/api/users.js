import { USE_MOCK } from './config'
import { request } from './client'
import { getUsers } from './mockStore'

async function mockListLandlords() {
  return getUsers().landlords
}

async function mockListTenants() {
  return getUsers().tenants
}

export async function listLandlords() {
  if (USE_MOCK) return mockListLandlords()
  return request('/api/admin/landlords')
}

export async function listTenants() {
  if (USE_MOCK) return mockListTenants()
  return request('/api/admin/tenants')
}
