import { USE_MOCK } from './config'
import { request } from './client'
import { getSession, setSession, registerUser, getSettingsByEmail } from './mockStore'

const MOCK_TOKEN = 'mock-token'

async function mockLogin({ email, password, role }) {
  void password
  const session = getSession()
  const prefs = getSettingsByEmail(email)
  const baseUser =
    session?.user?.email === email
      ? session.user
      : { name: email.split('@')[0] || 'User', email, role: role || 'tenant' }
  const user = {
    ...baseUser,
    email,
    role: role || baseUser.role || 'tenant',
    phone: prefs.phone,
    telegram: prefs.telegram,
    notifyListings: prefs.notifyListings,
    notifyRequests: prefs.notifyRequests,
    notifyPayments: prefs.notifyPayments,
    preferredContact: prefs.preferredContact,
  }
  const next = { user, token: MOCK_TOKEN }
  setSession(next)
  return next
}

async function mockRegister({ name, email, password, role }) {
  void password
  registerUser({ name, email, role })
  const next = { user: { name, email, role }, token: MOCK_TOKEN }
  setSession(next)
  return next
}

async function mockLogout() {
  setSession(null)
}

async function mockMe() {
  const session = getSession()
  if (!session?.user) throw new Error('Not authenticated')
  return session.user
}

export async function login(credentials) {
  if (USE_MOCK) return mockLogin(credentials)
  const session = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })
  setSession(session)
  return session
}

export async function register(data) {
  if (USE_MOCK) return mockRegister(data)
  const session = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  setSession(session)
  return session
}

export async function logout() {
  if (USE_MOCK) return mockLogout()
  try {
    await request('/api/auth/logout', { method: 'POST' })
  } finally {
    setSession(null)
  }
}

export async function me() {
  if (USE_MOCK) return mockMe()
  return request('/api/auth/me')
}

export function getStoredSession() {
  return getSession()
}
