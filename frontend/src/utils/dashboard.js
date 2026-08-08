export function dashboardPath(role) {
  if (role === 'admin') return '/dashboard/admin'
  if (role === 'landlord') return '/dashboard/landlord'
  return '/dashboard/tenant'
}
