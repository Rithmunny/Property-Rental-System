import { USE_MOCK } from './config'
import { request } from './client'
import { getSession, setSession, registerUser } from './mockStore'

const MOCK_TOKEN = 'mock-token'

async function mockLogin({ email, password, role }) {
  void password
  const session = getSession()
  const user = session?.user?.email === email
    ? session.user
    : { name: email.split('@')[0] || 'User', email, role: role || 'tenant' }
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
  return request('/api/auth/login', { method: 'POST', body: JSON.stringify(credentials) })
}

export async function register(data) {
  if (USE_MOCK) return mockRegister(data)
  return request('/api/auth/register', { method: 'POST', body: JSON.stringify(data) })
}

export async function logout() {
  if (USE_MOCK) return mockLogout()
  return request('/api/auth/logout', { method: 'POST' })
}

export async function me() {
  if (USE_MOCK) return mockMe()
  return request('/api/auth/me')
}

export function getStoredSession() {
  return getSession()
}
