import { USE_MOCK } from './config'
import { request } from './client'
import { getTenantPayments, getLandlordPayments } from './mockStore'

async function mockGetPayments(role) {
  if (role === 'landlord') return getLandlordPayments()
  if (role === 'admin') {
    return {
      totalCollected: 12450,
      pendingCount: 3,
      methods: { aba: 72, cash: 28 },
    }
  }
  return getTenantPayments()
}

export async function getPayments(role = 'tenant') {
  if (USE_MOCK) return mockGetPayments(role)
  return request(`/api/payments?role=${role}`)
}
