export function isAdmin(role) {
  return role === 'admin' || role === 'super_admin'
}

export function dashboardPath(role) {
  if (isAdmin(role)) return '/dashboard/admin'
  if (role === 'landlord') return '/dashboard/landlord'
  return '/dashboard/tenant'
}

/** Properties owned by the current landlord (by name match or newly created). */
export function isLandlordListing(property, userName) {
  if (!property) return false
  if (property.landlordOwned) return true
  return Boolean(userName) && property.landlord === userName
}
