import { USE_MOCK } from './config'
import { request } from './client'
import {
  getSession,
  getSettingsByEmail,
  setSettingsByEmail,
  updateSessionUser,
} from './mockStore'

async function mockGet() {
  const session = getSession()
  if (!session?.user) throw new Error('Login required')
  return getSettingsByEmail(session.user.email)
}

async function mockSave(settings) {
  const session = getSession()
  if (!session?.user) throw new Error('Login required')
  const saved = setSettingsByEmail(session.user.email, settings)
  updateSessionUser({
    phone: saved.phone,
    telegram: saved.telegram,
    notifyListings: saved.notifyListings,
    notifyRequests: saved.notifyRequests,
    notifyPayments: saved.notifyPayments,
    preferredContact: saved.preferredContact,
  })
  return saved
}

async function mockUpdateProfile(updates) {
  return updateSessionUser(updates)
}

export async function getSettings() {
  if (USE_MOCK) return mockGet()
  return request('/api/settings')
}

export async function saveSettings(settings) {
  if (USE_MOCK) return mockSave(settings)
  return request('/api/settings', { method: 'PUT', body: JSON.stringify(settings) })
}

export async function updateProfile(updates) {
  if (USE_MOCK) return mockUpdateProfile(updates)
  return request('/api/auth/profile', { method: 'PATCH', body: JSON.stringify(updates) })
}

export async function changePassword({ currentPassword, newPassword }) {
  if (USE_MOCK) {
    void currentPassword
    if (!newPassword || String(newPassword).length < 6) {
      throw new Error('New password must be at least 6 characters')
    }
    return { ok: true }
  }
  return request('/api/auth/password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  })
}
