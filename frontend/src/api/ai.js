import { USE_MOCK } from './config'
import { request } from './client'
import { getProperties } from './mockStore'
import {
  parseNaturalSearchFallback,
  generateDescriptionFallback,
  chatFallback,
  suggestReplyFallback,
  getSimilarPropertiesFallback,
} from '@/utils/aiFallback'

export async function getAiStatus() {
  if (USE_MOCK) {
    return { enabled: false, model: 'fallback', features: ['search', 'description', 'similar', 'chat', 'suggest-reply'] }
  }
  return request('/api/ai/status')
}

export async function parseNaturalSearch(query) {
  if (USE_MOCK) return parseNaturalSearchFallback(query)
  return request('/api/ai/search/parse', {
    method: 'POST',
    body: JSON.stringify({ query }),
  })
}

export async function generateDescription(details) {
  if (USE_MOCK) {
    return { description: generateDescriptionFallback(details), source: 'fallback' }
  }
  return request('/api/ai/generate-description', {
    method: 'POST',
    body: JSON.stringify(details),
  })
}

export async function getSimilarProperties(propertyId, limit = 4) {
  if (USE_MOCK) {
    return getSimilarPropertiesFallback(getProperties(), propertyId, limit)
  }
  return request(`/api/ai/similar/${propertyId}?limit=${limit}`)
}

export async function chatAssistant(messages) {
  if (USE_MOCK) {
    return { reply: chatFallback(messages), source: 'fallback' }
  }
  return request('/api/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ messages }),
  })
}

export async function suggestMessageReply({ role, propertyTitle, messages }) {
  if (USE_MOCK) {
    const lastIncoming = [...(messages || [])]
      .reverse()
      .find((m) => m.fromRole !== role && m.text)
    return {
      suggestion: suggestReplyFallback({
        role,
        propertyTitle,
        lastMessage: lastIncoming?.text,
      }),
      source: 'fallback',
    }
  }
  return request('/api/ai/suggest-reply', {
    method: 'POST',
    body: JSON.stringify({ role, propertyTitle, messages }),
  })
}
