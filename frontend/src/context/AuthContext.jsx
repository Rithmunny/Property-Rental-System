import { createContext, useContext, useState, useCallback } from 'react'
import * as authApi from '@/api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const stored = authApi.getStoredSession()
  const [user, setUser] = useState(stored?.user ?? null)
  const [token, setToken] = useState(stored?.token ?? null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const applySession = (session) => {
    setUser(session?.user ?? null)
    setToken(session?.token ?? null)
  }

  const login = useCallback(async (credentials) => {
    setLoading(true)
    setError(null)
    try {
      const session = await authApi.login(credentials)
      applySession(session)
      return session
    } catch (err) {
      setError(err.message || 'Login failed')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (data) => {
    setLoading(true)
    setError(null)
    try {
      const session = await authApi.register(data)
      applySession(session)
      return session
    } catch (err) {
      setError(err.message || 'Registration failed')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    await authApi.logout()
    applySession(null)
  }, [])

  const updateProfile = useCallback(async (updates) => {
    const { updateProfile: saveProfile } = await import('../api/settings')
    const session = await saveProfile(updates)
    applySession(session)
    return session
  }, [])

  const refreshSession = useCallback(() => {
    applySession(authApi.getStoredSession())
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, token, login, register, logout, updateProfile, refreshSession, loading, error }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
