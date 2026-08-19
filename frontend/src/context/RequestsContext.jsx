import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import * as requestsApi from '@/api/requests'
import { useAuth } from './AuthContext'

const RequestsContext = createContext(null)

export function RequestsProvider({ children }) {
  const { user } = useAuth()
  const [requests, setRequests] = useState([])
  const [inbox, setInbox] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    if (!user) {
      setRequests([])
      setInbox([])
      return
    }
    setLoading(true)
    setError(null)
    try {
      if (user.role === 'tenant') {
        const mine = await requestsApi.listMyRequests()
        setRequests(mine)
      }
      if (user.role === 'landlord') {
        const incoming = await requestsApi.listInboxRequests()
        setInbox(incoming)
      }
    } catch (err) {
      setError(err.message || 'Failed to load requests')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    refresh()
  }, [refresh])

  const createRequest = async (propertyId, kind = 'rent', extras = {}) => {
    const created = await requestsApi.createRequest(propertyId, kind, extras)
    setRequests((prev) => {
      if (prev.some((r) => r.id === created.id)) return prev
      return [created, ...prev]
    })
    return created
  }

  const updateStatus = async (id, status) => {
    const updated = await requestsApi.updateRequestStatus(id, status)
    setInbox((prev) => prev.map((r) => (r.id === id ? updated : r)))
    setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)))
    return updated
  }

  const checkHasRequest = useCallback(
    (propertyId, kind = 'rent') => requestsApi.hasRequestForProperty(propertyId, kind),
    [],
  )

  return (
    <RequestsContext.Provider
      value={{ requests, inbox, loading, error, refresh, createRequest, updateStatus, checkHasRequest }}
    >
      {children}
    </RequestsContext.Provider>
  )
}

export function useRequests() {
  return useContext(RequestsContext)
}
