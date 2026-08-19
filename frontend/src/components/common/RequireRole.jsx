import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { dashboardPath } from '@/utils/dashboard'

export default function RequireRole({ role, children }) {
  const { user } = useAuth()

  if (!user) return <Navigate to="/login" replace />
  if (user.role !== role) return <Navigate to={dashboardPath(user.role)} replace />

  return children
}
