import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import * as messagesApi from '@/api/messages'
import { useAuth } from './AuthContext'

const MessagesContext = createContext(null)

export function MessagesProvider({ children }) {
  const { user } = useAuth()
  const [threads, setThreads] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    if (!user) {
      setThreads([])
      return
    }
    setLoading(true)
    setError(null)
    try {
      const list = await messagesApi.listThreads()
      setThreads(list)
    } catch (err) {
      setError(err.message || 'Failed to load messages')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    refresh()
  }, [refresh])

  const sendMessage = async ({ propertyId, tenantEmail, text }) => {
    const updated = await messagesApi.sendMessage({ propertyId, tenantEmail, text })
    setThreads((prev) => {
      const rest = prev.filter((t) => t.id !== updated.id)
      return [updated, ...rest]
    })
    return updated
  }

  return (
    <MessagesContext.Provider value={{ threads, loading, error, refresh, sendMessage }}>
      {children}
    </MessagesContext.Provider>
  )
}

export function useMessages() {
  return useContext(MessagesContext)
}
