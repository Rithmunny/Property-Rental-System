import { signToken } from '../middleware/auth.js'

export function toUserDto(user) {
  if (!user) return null
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    phone: user.phone || '',
    telegram: user.telegram || '',
    notifyListings: user.notifyListings !== false,
    notifyRequests: user.notifyRequests !== false,
    notifyPayments: user.notifyPayments !== false,
    preferredContact: user.preferredContact || 'telegram',
  }
}

export function toSettingsDto(user) {
  return {
    phone: user.phone || '',
    telegram: user.telegram || '',
    notifyListings: user.notifyListings !== false,
    notifyRequests: user.notifyRequests !== false,
    notifyPayments: user.notifyPayments !== false,
    preferredContact: user.preferredContact || 'telegram',
    abaQrImage: user.abaQrImage || '',
  }
}

export function toSession(user) {
  return { user: toUserDto(user), token: signToken(user) }
}
