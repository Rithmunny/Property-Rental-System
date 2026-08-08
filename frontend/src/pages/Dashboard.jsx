import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { dashboardPath } from '../utils/dashboard'

export default function Dashboard() {
  const { user } = useAuth()

  if (!user) return <Navigate to="/login" replace />

  return <Navigate to={dashboardPath(user.role)} replace />
}
