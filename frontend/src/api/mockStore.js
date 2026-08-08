import { STORAGE_KEYS } from './config'
import { PROPERTIES as SEED_PROPERTIES } from '../data/properties'
import { RENTAL_REQUESTS } from '../data/tenant'
import { CONTRACTS, PAYMENT_REMINDERS, TENANTS } from '../data/landlord'
import { CURRENT_RENTAL, PAYMENT_HISTORY } from '../data/tenant'
import { LANDLORDS } from '../data/admin'

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function getSession() {
  return read(STORAGE_KEYS.session, null)
}

export function setSession(session) {
  if (session) write(STORAGE_KEYS.session, session)
  else localStorage.removeItem(STORAGE_KEYS.session)
}

export function getProperties() {
  return read(STORAGE_KEYS.properties, SEED_PROPERTIES)
}

export function setProperties(properties) {
  write(STORAGE_KEYS.properties, properties)
}

export function getRequests() {
  const stored = read(STORAGE_KEYS.requests, null)
  if (stored) return stored
  return RENTAL_REQUESTS.map((r) => ({
    ...r,
    tenantEmail: r.tenantEmail ?? 'demo@tenant.com',
    tenantName: r.tenantName ?? 'Demo Tenant',
    landlord: r.landlord ?? 'Sok Dara',
  }))
}

export function setRequests(requests) {
  write(STORAGE_KEYS.requests, requests)
}

export function getSavedByEmail(email) {
  const all = read(STORAGE_KEYS.saved, {})
  return all[email] ?? [1, 2]
}

export function setSavedByEmail(email, ids) {
  const all = read(STORAGE_KEYS.saved, {})
  all[email] = ids
  write(STORAGE_KEYS.saved, all)
}

export function getContracts() {
  return read(STORAGE_KEYS.contracts, CONTRACTS)
}

export function setContracts(contracts) {
  write(STORAGE_KEYS.contracts, contracts)
}

export function getTenantPayments() {
  return read(STORAGE_KEYS.payments, {
    currentRental: CURRENT_RENTAL,
    nextPayment: { dueDate: 'Aug 1', amount: CURRENT_RENTAL.rent },
    history: PAYMENT_HISTORY,
  })
}

export function getLandlordPayments() {
  return {
    reminders: PAYMENT_REMINDERS,
    tenants: TENANTS,
  }
}

export function getRentalsByEmail() {
  const rentals = read(STORAGE_KEYS.rentals, { byEmail: {} })
  return rentals.byEmail || {}
}

export function setCurrentRentalByEmail(email, rental) {
  const rentals = read(STORAGE_KEYS.rentals, { byEmail: {} })
  rentals.byEmail = { ...(rentals.byEmail || {}), [email]: rental }
  write(STORAGE_KEYS.rentals, rentals)
}

export function getUsers() {
  return read(STORAGE_KEYS.users, {
    landlords: LANDLORDS,
    tenants: [
      { id: 1, name: 'Ratana Chea', telegram: '@ratana_chea', status: 'active' },
      { id: 2, name: 'Sophea Meas', telegram: '@sophea_m', status: 'active' },
      { id: 3, name: 'Vibol Sok', telegram: '@vibol_sok', status: 'active' },
    ],
  })
}

export function registerUser(user) {
  const users = getUsers()
  const list = user.role === 'landlord' ? users.landlords : users.tenants
  const nextId = list.length ? Math.max(...list.map((u) => u.id)) + 1 : 1
  const entry = {
    id: nextId,
    name: user.name,
    telegram: `@${user.email.split('@')[0]}`,
    status: 'active',
    ...(user.role === 'landlord' ? { listings: 0 } : {}),
  }
  if (user.role === 'landlord') users.landlords = [entry, ...users.landlords]
  else users.tenants = [entry, ...users.tenants]
  write(STORAGE_KEYS.users, users)
}

export function nextId(items) {
  return items.length ? Math.max(...items.map((i) => i.id)) + 1 : 1
}
