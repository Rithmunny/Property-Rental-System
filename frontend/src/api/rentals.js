// Mock extensions: POST /api/contracts — create landlord contract stub
import { USE_MOCK } from './config'
import { request } from './client'
import {
  getContracts,
  setContracts,
  getRentalsByEmail,
  getSession,
  nextId,
} from './mockStore'
import { CURRENT_RENTAL } from '../data/tenant'

async function mockGetCurrentRental() {
  const session = getSession()
  if (!session?.user) return null
  const byEmail = getRentalsByEmail()
  return byEmail[session.user.email] ?? CURRENT_RENTAL
}

async function mockListContracts() {
  return getContracts()
}

async function mockCreateContract(data) {
  const contracts = getContracts()
  const contract = {
    id: nextId(contracts),
    propertyId: Number(data.propertyId),
    tenant: data.tenant,
    startDate: data.startDate,
    endDate: data.endDate,
    rent: Number(data.rent) || 0,
    deposit: Number(data.deposit) || 0,
    status: data.status || 'active',
  }
  setContracts([contract, ...contracts])
  return contract
}

export async function getCurrentRental() {
  if (USE_MOCK) return mockGetCurrentRental()
  return request('/api/rentals/current')
}

export async function listContracts() {
  if (USE_MOCK) return mockListContracts()
  return request('/api/contracts')
}

export async function createContract(data) {
  if (USE_MOCK) return mockCreateContract(data)
  return request('/api/contracts', { method: 'POST', body: JSON.stringify(data) })
}
