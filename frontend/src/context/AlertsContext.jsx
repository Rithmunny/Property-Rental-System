import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import * as savedSearchApi from '@/api/savedSearches'
import { useAuth } from './AuthContext'
import { useProperties } from './PropertiesContext'

const AlertsContext = createContext(null)

function filtersKey(filters = {}) {
  return JSON.stringify({
    q: filters.q || '',
    city: filters.city || '',
    area: filters.area || '',
    type: filters.type || '',
    beds: filters.beds || '',
    furnished: filters.furnished || '',
    maxPrice: filters.maxPrice || '',
  })
}

export function AlertsProvider({ children }) {
  const { user } = useAuth()
  const { properties } = useProperties()
  const [searches, setSearches] = useState([])
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!user || user.role !== 'tenant') {
      setSearches([])
      return
    }
    setLoading(true)
    try {
      const list = await savedSearchApi.listSavedSearches()
      setSearches(list)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    refresh()
  }, [refresh])

  const alerts = useMemo(() => {
    if (user?.notifyListings === false) return []
    return searches
      .map((search) => ({
        search,
        matches: savedSearchApi.matchingNewListings(search, properties),
      }))
      .filter((item) => item.matches.length > 0)
  }, [searches, properties, user?.notifyListings])

  const unreadCount = alerts.reduce((sum, item) => sum + item.matches.length, 0)

  const saveCurrentSearch = async (filters) => {
    const created = await savedSearchApi.createSavedSearch(filters)
    setSearches((prev) => [created, ...prev])
    return created
  }

  const hasSearch = (filters) => searches.some((s) => filtersKey(s.filters) === filtersKey(filters))

  const removeSearch = async (id) => {
    await savedSearchApi.deleteSavedSearch(id)
    setSearches((prev) => prev.filter((s) => s.id !== id))
  }

  const markSeen = async (id) => {
    const updated = await savedSearchApi.markSavedSearchSeen(id)
    if (updated) {
      setSearches((prev) => prev.map((s) => (s.id === id ? updated : s)))
    }
  }

  const markAllSeen = async () => {
    await Promise.all(alerts.map((item) => markSeen(item.search.id)))
  }

  return (
    <AlertsContext.Provider
      value={{
        searches,
        alerts,
        unreadCount,
        loading,
        refresh,
        saveCurrentSearch,
        hasSearch,
        removeSearch,
        markSeen,
        markAllSeen,
      }}
    >
      {children}
    </AlertsContext.Provider>
  )
}

export function useAlerts() {
  return useContext(AlertsContext) || {
    searches: [],
    alerts: [],
    unreadCount: 0,
    loading: false,
    saveCurrentSearch: async () => {},
    hasSearch: () => false,
    removeSearch: async () => {},
    markSeen: async () => {},
    markAllSeen: async () => {},
  }
}
