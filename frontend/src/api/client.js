import { API_URL } from './config'

function getToken() {
  try {
    const raw = localStorage.getItem('prs-session')
    if (!raw) return null
    const session = JSON.parse(raw)
    return session?.token ?? null
  } catch {
    return null
  }
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function request(path, options = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${API_URL}${path}`, { ...options, headers })
  const data = await res.json().catch(() => null)

  if (!res.ok) {
    throw new ApiError(data?.message || res.statusText || 'Request failed', res.status)
  }
  return data
}
