import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import * as propertiesApi from '../api/properties'

const PropertiesContext = createContext(null)

export function PropertiesProvider({ children }) {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await propertiesApi.listProperties()
      setProperties(data)
    } catch (err) {
      setError(err.message || 'Failed to load properties')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const addProperty = async (data) => {
    const created = await propertiesApi.createProperty(data)
    setProperties((prev) => [created, ...prev])
    return created
  }

  const updateProperty = async (id, updates) => {
    const updated = await propertiesApi.updateProperty(id, updates)
    setProperties((prev) => prev.map((p) => (p.id === id ? updated : p)))
    return updated
  }

  const deleteProperty = async (id) => {
    await propertiesApi.deleteProperty(id)
    setProperties((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <PropertiesContext.Provider
      value={{ properties, loading, error, refresh, addProperty, updateProperty, deleteProperty }}
    >
      {children}
    </PropertiesContext.Provider>
  )
}

export function useProperties() {
  return useContext(PropertiesContext)
}
