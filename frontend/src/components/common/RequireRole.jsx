import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { dashboardPath, isAdmin } from '@/utils/dashboard'

export default function RequireRole({ role, children }) {
  const { user } = useAuth()

  if (!user) return <Navigate to="/login" replace />
  const allowed = user.role === role || (role === 'admin' && isAdmin(user.role))
  if (!allowed) return <Navigate to={dashboardPath(user.role)} replace />

  return children
}
