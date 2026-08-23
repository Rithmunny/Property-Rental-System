function resolveApiUrl() {
  const raw = String(import.meta.env.VITE_API_URL || '')
    .trim()
    .replace(/\/$/, '')
  const isLoopback = !raw || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(raw)
  if (import.meta.env.PROD) return isLoopback ? '' : raw
  return raw || 'http://localhost:5000'
}

export const API_URL = resolveApiUrl()
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

export const STORAGE_KEYS = {
  session: 'prs-session',
  properties: 'prs-properties-v4',
  requests: 'prs-requests',
  saved: 'prs-saved',
  contracts: 'prs-contracts',
  payments: 'prs-payments',
  rentals: 'prs-rentals',
  users: 'prs-users',
  messages: 'prs-messages',
  reviews: 'prs-reviews',
  savedSearches: 'prs-saved-searches',
  settings: 'prs-settings',
}
