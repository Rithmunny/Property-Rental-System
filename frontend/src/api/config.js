export const API_URL = import.meta.env.VITE_API_URL || ''
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
