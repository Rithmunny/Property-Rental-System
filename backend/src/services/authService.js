import bcrypt from 'bcryptjs'
import { prisma } from '../config/prisma.js'
import { HttpError } from '../utils/httpError.js'
import { toSession, toSettingsDto, toUserDto } from '../dto/user.js'
import { isAdmin } from '../utils/roles.js'

const SETTINGS_FIELDS = [
  'phone',
  'telegram',
  'notifyListings',
  'notifyRequests',
  'notifyPayments',
  'preferredContact',
]

function pickSettings(body = {}) {
  const next = {}
  if (body.phone != null) next.phone = String(body.phone)
  if (body.telegram != null) next.telegram = String(body.telegram)
  if (body.notifyListings != null) next.notifyListings = Boolean(body.notifyListings)
  if (body.notifyRequests != null) next.notifyRequests = Boolean(body.notifyRequests)
  if (body.notifyPayments != null) next.notifyPayments = Boolean(body.notifyPayments)
  if (body.preferredContact != null) next.preferredContact = String(body.preferredContact)
  return next
}

function pickAbaQr(user, body = {}) {
  if (body.abaQrImage == null) return {}
  if (user.role !== 'landlord' && !isAdmin(user.role)) return {}
  return { abaQrImage: String(body.abaQrImage) }
}

export async function register({ name, email, password, role }) {
  const trimmedEmail = String(email || '').trim().toLowerCase()
  const trimmedName = String(name || '').trim()
  const nextRole = role === 'landlord' ? 'landlord' : role === 'tenant' ? 'tenant' : null
  if (!trimmedName) throw new HttpError(400, 'Name is required')
  if (!trimmedEmail) throw new HttpError(400, 'Email is required')
  if (!password || String(password).length < 6) {
    throw new HttpError(400, 'Password must be at least 6 characters')
  }
  if (!nextRole) throw new HttpError(400, 'Role must be tenant or landlord')

  const existing = await prisma.user.findUnique({ where: { email: trimmedEmail } })
  if (existing) throw new HttpError(409, 'An account with that email already exists')

  const user = await prisma.user.create({
    data: {
      name: trimmedName,
      email: trimmedEmail,
      passwordHash: await bcrypt.hash(String(password), 10),
      role: nextRole,
      telegram: `@${trimmedEmail.split('@')[0]}`,
    },
  })
  return toSession(user)
}

export async function login({ email, password }) {
  const trimmedEmail = String(email || '').trim().toLowerCase()
  const user = await prisma.user.findUnique({ where: { email: trimmedEmail } })
  if (!user) throw new HttpError(401, 'Invalid email or password')
  const ok = await bcrypt.compare(String(password || ''), user.passwordHash)
  if (!ok) throw new HttpError(401, 'Invalid email or password')
  return toSession(user)
}

export function me(user) {
  return toUserDto(user)
}

export async function updateProfile(user, updates = {}) {
  const data = {}
  if (updates.name != null) {
    const name = String(updates.name).trim()
    if (!name) throw new HttpError(400, 'Name is required')
    data.name = name
  }
  Object.assign(data, pickSettings(updates), pickAbaQr(user, updates))
  const saved = await prisma.user.update({ where: { id: user.id }, data })
  return toSession(saved)
}

export async function changePassword(user, { currentPassword, newPassword }) {
  const ok = await bcrypt.compare(String(currentPassword || ''), user.passwordHash)
  if (!ok) throw new HttpError(400, 'Current password is incorrect')
  if (!newPassword || String(newPassword).length < 6) {
    throw new HttpError(400, 'New password must be at least 6 characters')
  }
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(String(newPassword), 10) },
  })
  return { ok: true }
}

export function getSettings(user) {
  return toSettingsDto(user)
}

export async function saveSettings(user, settings) {
  const saved = await prisma.user.update({
    where: { id: user.id },
    data: { ...pickSettings(settings), ...pickAbaQr(user, settings) },
  })
  return toSettingsDto(saved)
}

export { SETTINGS_FIELDS }
