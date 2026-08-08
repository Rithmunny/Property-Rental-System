import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import * as savedApi from '../api/saved'
import { useAuth } from './AuthContext'

const SavedContext = createContext(null)

export function SavedProvider({ children }) {
  const { user } = useAuth()
  const [savedIds, setSavedIds] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    if (!user) {
      setSavedIds([])
      return
    }
    setLoading(true)
    setError(null)
    try {
      const ids = await savedApi.listSaved()
      setSavedIds(ids)
    } catch (err) {
      setError(err.message || 'Failed to load saved homes')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    refresh()
  }, [refresh])

  const toggleSaved = async (propertyId) => {
    const ids = await savedApi.toggleSaved(propertyId)
    setSavedIds(ids)
    return ids.includes(Number(propertyId))
  }

  const isSaved = (propertyId) => savedIds.includes(Number(propertyId))

  return (
    <SavedContext.Provider value={{ savedIds, loading, error, refresh, toggleSaved, isSaved }}>
      {children}
    </SavedContext.Provider>
  )
}

export function useSaved() {
  return useContext(SavedContext)
}
