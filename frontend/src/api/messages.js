import { USE_MOCK } from './config'
import { request } from './client'
import { getThreads, setThreads, getSession, nextId, getProperties } from './mockStore'

function normalizeThread(thread) {
  return {
    ...thread,
    messages: [...(thread.messages || [])].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    ),
  }
}

async function mockList() {
  const session = getSession()
  if (!session?.user) return []
  const all = getThreads().map(normalizeThread)
  if (session.user.role === 'tenant') {
    const mine = all.filter((t) => t.tenantEmail === session.user.email)
    if (mine.length) return mine
    return all.filter((t) => t.tenantEmail === 'demo@tenant.com')
  }
  if (session.user.role === 'landlord') {
    const mine = all.filter((t) => t.landlord === session.user.name)
    return mine.length ? mine : all
  }
  return []
}

async function mockSend({ propertyId, tenantEmail, text }) {
  const session = getSession()
  if (!session?.user) throw new Error('Login required')
  const body = String(text || '').trim()
  if (!body) throw new Error('Message cannot be empty')

  const property = getProperties().find((p) => p.id === Number(propertyId))
  if (!property) throw new Error('Property not found')

  const email =
    session.user.role === 'tenant' ? session.user.email : tenantEmail || session.user.email
  if (!email) throw new Error('Tenant is required')

  const threads = getThreads()
  let thread = threads.find(
    (t) => t.propertyId === Number(propertyId) && t.tenantEmail === email,
  )

  const message = {
    id: nextId(thread?.messages || []),
    fromEmail: session.user.email,
    fromRole: session.user.role,
    text: body,
    createdAt: new Date().toISOString(),
  }

  if (!thread) {
    thread = {
      id: nextId(threads),
      propertyId: Number(propertyId),
      tenantEmail: email,
      tenantName: session.user.role === 'tenant' ? session.user.name : tenantEmail,
      landlord: property.landlord,
      messages: [message],
    }
    setThreads([thread, ...threads])
    return normalizeThread(thread)
  }

  const next = threads.map((t) =>
    t.id === thread.id ? { ...t, messages: [...(t.messages || []), message] } : t,
  )
  setThreads(next)
  return normalizeThread(next.find((t) => t.id === thread.id))
}

export async function listThreads() {
  if (USE_MOCK) return mockList()
  return request('/api/messages')
}

export async function sendMessage(data) {
  if (USE_MOCK) return mockSend(data)
  return request('/api/messages', { method: 'POST', body: JSON.stringify(data) })
}
