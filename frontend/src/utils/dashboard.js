export function dashboardPath(role) {
  if (role === 'admin') return '/dashboard/admin'
  if (role === 'landlord') return '/dashboard/landlord'
  return '/dashboard/tenant'
}

/** Properties owned by the current landlord (by name match or newly created). */
export function isLandlordListing(property, userName) {
  if (!property) return false
  if (property.landlordOwned) return true
  return Boolean(userName) && property.landlord === userName
}
