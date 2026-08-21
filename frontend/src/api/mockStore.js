import { STORAGE_KEYS } from './config'
import { PROPERTIES as SEED_PROPERTIES } from '@/data/properties'
import { averageRating, withPropertyDefaults } from '@/utils/listing'
import { RENTAL_REQUESTS } from '@/data/tenant'
import { CONTRACTS, PAYMENT_REMINDERS, TENANTS } from '@/data/landlord'
import { CURRENT_RENTAL, PAYMENT_HISTORY } from '@/data/tenant'
import { LANDLORDS } from '@/data/admin'
import { SEED_REVIEWS } from '@/data/reviews'
import { SEED_THREADS } from '@/data/messages'

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
  const list = read(STORAGE_KEYS.properties, SEED_PROPERTIES)
  const reviews = getReviews()
  return list.map((property) => {
    const withDefaults = withPropertyDefaults(property)
    const propertyReviews = reviews.filter((r) => r.propertyId === withDefaults.id)
    if (!propertyReviews.length) return withDefaults
    return {
      ...withDefaults,
      rating: averageRating(propertyReviews),
      reviews: propertyReviews.length,
    }
  })
}

export function setProperties(properties) {
  write(STORAGE_KEYS.properties, properties)
}

export function getRequests() {
  const stored = read(STORAGE_KEYS.requests, null)
  const list = stored
    ? stored
    : RENTAL_REQUESTS.map((r) => ({
        ...r,
        tenantEmail: r.tenantEmail ?? 'demo@tenant.com',
        tenantName: r.tenantName ?? 'Demo Tenant',
        landlord: r.landlord ?? 'Sok Dara',
      }))
  return list.map((r) => ({ ...r, kind: r.kind ?? 'rent' }))
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
  const data = read(STORAGE_KEYS.payments, {
    currentRental: CURRENT_RENTAL,
    nextPayment: { dueDate: 'Aug 1', amount: CURRENT_RENTAL.rent },
    history: PAYMENT_HISTORY,
  })
  return {
    ...data,
    currentRental: {
      ...CURRENT_RENTAL,
      ...data.currentRental,
      abaQrImage: landlordAbaQr() || data.currentRental?.abaQrImage || '',
    },
  }
}

function landlordAbaQr() {
  const all = read(STORAGE_KEYS.settings, {})
  return Object.values(all).find((settings) => settings?.abaQrImage)?.abaQrImage || ''
}

export function setTenantPayments(data) {
  write(STORAGE_KEYS.payments, data)
}

export function appendTenantPayment(entry) {
  const data = getTenantPayments()
  const payment = {
    method: 'aba',
    status: 'paid',
    ...entry,
    id: nextId(data.history || []),
  }
  const next = { ...data, history: [payment, ...(data.history || [])] }
  setTenantPayments(next)
  return next
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

export function setUsers(users) {
  write(STORAGE_KEYS.users, users)
}

export function updateLandlordStatus(id, status) {
  const users = getUsers()
  users.landlords = users.landlords.map((l) =>
    l.id === Number(id) ? { ...l, status } : l,
  )
  setUsers(users)
  return users.landlords.find((l) => l.id === Number(id))
}

export function registerUser(user) {
  const users = getUsers()
  const list = user.role === 'landlord' ? users.landlords : users.tenants
  const id = list.length ? Math.max(...list.map((u) => u.id)) + 1 : 1
  const entry = {
    id,
    name: user.name,
    telegram: `@${user.email.split('@')[0]}`,
    status: 'active',
    ...(user.role === 'landlord' ? { listings: 0 } : {}),
  }
  if (user.role === 'landlord') users.landlords = [entry, ...users.landlords]
  else users.tenants = [entry, ...users.tenants]
  setUsers(users)
}

export function getReviews() {
  return read(STORAGE_KEYS.reviews, SEED_REVIEWS)
}

export function setReviews(reviews) {
  write(STORAGE_KEYS.reviews, reviews)
}

export function getThreads() {
  return read(STORAGE_KEYS.messages, SEED_THREADS)
}

export function setThreads(threads) {
  write(STORAGE_KEYS.messages, threads)
}

export function getSavedSearchesByEmail(email) {
  const all = read(STORAGE_KEYS.savedSearches, {})
  return all[email] ?? []
}

export function setSavedSearchesByEmail(email, searches) {
  const all = read(STORAGE_KEYS.savedSearches, {})
  all[email] = searches
  write(STORAGE_KEYS.savedSearches, all)
}

export const DEFAULT_SETTINGS = {
  phone: '',
  telegram: '',
  notifyListings: true,
  notifyRequests: true,
  notifyPayments: true,
  preferredContact: 'telegram',
  abaQrImage: '',
}

export function getSettingsByEmail(email) {
  const all = read(STORAGE_KEYS.settings, {})
  return { ...DEFAULT_SETTINGS, ...(all[email] || {}) }
}

export function setSettingsByEmail(email, settings) {
  const all = read(STORAGE_KEYS.settings, {})
  all[email] = { ...DEFAULT_SETTINGS, ...(all[email] || {}), ...settings }
  write(STORAGE_KEYS.settings, all)
  return all[email]
}

export function updateSessionUser(updates) {
  const session = getSession()
  if (!session?.user) throw new Error('Login required')
  const next = { ...session, user: { ...session.user, ...updates } }
  setSession(next)
  return next
}

export function nextId(items) {
  return items.length ? Math.max(...items.map((i) => i.id)) + 1 : 1
}
