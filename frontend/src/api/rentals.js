import { USE_MOCK } from './config'
import { request } from './client'
import { getContracts, getRentalsByEmail, getSession } from './mockStore'
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

export async function getCurrentRental() {
  if (USE_MOCK) return mockGetCurrentRental()
  return request('/api/rentals/current')
}

export async function listContracts() {
  if (USE_MOCK) return mockListContracts()
  return request('/api/contracts')
}
