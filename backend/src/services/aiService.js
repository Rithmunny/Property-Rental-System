import { env } from '../config/env.js'
import { prisma } from '../config/prisma.js'
import { HttpError } from '../utils/httpError.js'
import { toPropertyDto, propertyInclude } from '../dto/property.js'

const CITIES = [
  'Phnom Penh',
  'Siem Reap',
  'Sihanoukville',
  'Battambang',
  'Kampot',
  'Kep',
  'Kampong Cham',
  'Koh Kong',
]

const PROPERTY_TYPES = ['Apartment', 'House', 'Villa', 'Studio', 'Room', 'Commercial']

const AREAS = [
  'BKK1',
  'BKK2',
  'BKK3',
  'Riverside',
  'Diamond Island',
  'Toul Kork',
  'Toul Tom Poung',
  'Chamkar Mon',
  'Tonle Bassac',
  'Sen Sok',
  'Chroy Changvar',
  'Chbar Ampov',
  'Mean Chey',
  'Russey Keo',
  'Olympic',
  'Wat Bo',
  'Old Market',
  'Sala Kamreuk',
  'Svay Dangkum',
  'Wat Damnak',
  'Near University',
  'Wat Kor',
  'Otres Beach',
  'Otres 2',
  'Ochheuteal',
  'Independence Beach',
  'Old Town',
  'Teuk Chhou',
  'Kep Beach',
  'Crab Market',
  'Town Center',
  'Cham Yeam',
]

function aiEnabled() {
  return Boolean(env.openaiApiKey)
}

async function callOpenAi(messages, { maxTokens = 800, json = false } = {}) {
  if (!env.openaiApiKey) {
    throw new HttpError(503, 'AI is not configured on this server')
  }

  const body = {
    model: env.aiModel,
    messages,
    max_tokens: maxTokens,
    temperature: 0.4,
  }
  if (json) body.response_format = { type: 'json_object' }

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const message = data?.error?.message || 'AI request failed'
    throw new HttpError(res.status >= 500 ? 502 : 400, message)
  }

  const content = data?.choices?.[0]?.message?.content?.trim()
  if (!content) throw new HttpError(502, 'Empty AI response')
  return content
}

function parseNaturalSearchFallback(query) {
  const text = String(query || '').trim()
  const lower = text.toLowerCase()
  const filters = { q: text }

  for (const city of CITIES) {
    if (lower.includes(city.toLowerCase())) {
      filters.city = city
      break
    }
  }

  for (const area of AREAS) {
    if (lower.includes(area.toLowerCase())) {
      filters.area = area
      break
    }
  }

  for (const type of PROPERTY_TYPES) {
    if (lower.includes(type.toLowerCase())) {
      filters.type = type
      break
    }
  }

  const bedMatch = lower.match(/(\d+)\s*(?:bed|bedroom|br|bd)/)
  if (bedMatch) filters.beds = bedMatch[1]

  const priceMatch =
    lower.match(/(?:under|below|max|less than|<)\s*\$?\s*(\d+)/) ||
    lower.match(/\$?\s*(\d+)\s*(?:\/mo|per month|monthly|usd)?/)
  if (priceMatch) filters.maxPrice = String(priceMatch[1])

  if (/\bfurnished\b/.test(lower) && !/\bunfurnished\b/.test(lower) && !/\bsemi/.test(lower)) {
    filters.furnished = 'furnished'
  } else if (/\bsemi[- ]?furnished\b/.test(lower)) {
    filters.furnished = 'semi'
  } else if (/\bunfurnished\b/.test(lower)) {
    filters.furnished = 'unfurnished'
  }

  const summaryParts = []
  if (filters.city) summaryParts.push(filters.city)
  if (filters.area) summaryParts.push(filters.area)
  if (filters.type) summaryParts.push(filters.type.toLowerCase())
  if (filters.beds) summaryParts.push(`${filters.beds}+ beds`)
  if (filters.maxPrice) summaryParts.push(`under $${filters.maxPrice}/mo`)

  return {
    filters,
    summary: summaryParts.length
      ? `Showing ${summaryParts.join(', ')}`
      : `Searching for "${text}"`,
    source: 'fallback',
  }
}

export async function parseNaturalSearch(query) {
  const text = String(query || '').trim()
  if (!text) throw new HttpError(400, 'Query is required')

  if (!aiEnabled()) return parseNaturalSearchFallback(text)

  const system = `You parse rental search queries for Cambodia (PRS app).
Return JSON: { "filters": { "q"?, "city"?, "area"?, "type"?, "beds"?, "furnished"?, "maxPrice"? }, "summary": string }
Cities: ${CITIES.join(', ')}
Types: ${PROPERTY_TYPES.join(', ')}
Areas (Phnom Penh etc): ${AREAS.slice(0, 20).join(', ')} and more.
furnished: furnished | semi | unfurnished. beds: "1","2","3". maxPrice: number string.
Keep summary under 12 words.`

  try {
    const raw = await callOpenAi(
      [
        { role: 'system', content: system },
        { role: 'user', content: text },
      ],
      { maxTokens: 300, json: true },
    )
    const parsed = JSON.parse(raw)
    return {
      filters: { q: text, ...(parsed.filters || {}) },
      summary: parsed.summary || `Results for "${text}"`,
      source: 'openai',
    }
  } catch {
    return parseNaturalSearchFallback(text)
  }
}

function generateDescriptionFallback(details) {
  const {
    title = 'Rental home',
    type = 'Apartment',
    city = 'Phnom Penh',
    neighbourhood = '',
    bedrooms = 1,
    bathrooms = 1,
    area = 0,
    price = 0,
    furnished = 'furnished',
    amenities = [],
  } = details

  const location = [neighbourhood, city].filter(Boolean).join(', ')
  const amenityText = amenities.length ? amenities.slice(0, 5).join(', ') : 'essential amenities'
  const furnish =
    furnished === 'unfurnished'
      ? 'Unfurnished'
      : furnished === 'semi'
        ? 'Semi-furnished'
        : 'Fully furnished'

  return `${title} is a ${furnish.toLowerCase()} ${type.toLowerCase()} in ${location}. With ${bedrooms} bedroom${bedrooms === 1 ? '' : 's'}, ${bathrooms} bathroom${bathrooms === 1 ? '' : 's'}, and ${area || 'spacious'} m² of living space, it offers comfortable city living at $${price}/month. Highlights include ${amenityText}. Ideal for tenants seeking a well-located home with easy access to shops, dining, and transport.`
}

export async function generateDescription(details) {
  if (!aiEnabled()) {
    return { description: generateDescriptionFallback(details), source: 'fallback' }
  }

  const prompt = `Write a compelling 2-3 sentence rental listing description for Cambodia. Be factual, warm, professional. No bullet points.
Property: ${JSON.stringify(details)}`

  try {
    const description = await callOpenAi(
      [
        {
          role: 'system',
          content: 'You write concise rental listing descriptions for the Cambodian market.',
        },
        { role: 'user', content: prompt },
      ],
      { maxTokens: 250 },
    )
    return { description, source: 'openai' }
  } catch {
    return { description: generateDescriptionFallback(details), source: 'fallback' }
  }
}

function scoreSimilarity(target, candidate) {
  if (target.id === candidate.id) return -1
  let score = 0
  if (target.city === candidate.city) score += 3
  if (target.neighbourhood && target.neighbourhood === candidate.neighbourhood) score += 4
  if (target.type === candidate.type) score += 2
  if (Math.abs(target.bedrooms - candidate.bedrooms) <= 1) score += 2
  const priceDiff = Math.abs(target.price - candidate.price)
  if (priceDiff <= 100) score += 2
  else if (priceDiff <= 250) score += 1

  const targetAmenities = new Set(target.amenities || [])
  const overlap = (candidate.amenities || []).filter((a) => targetAmenities.has(a)).length
  score += Math.min(overlap, 3)

  return score
}

export async function getSimilarProperties(propertyId, limit = 4) {
  const id = Number(propertyId)
  if (!id) throw new HttpError(400, 'Invalid property id')

  const target = await prisma.property.findUnique({ where: { id }, include: propertyInclude })
  if (!target) throw new HttpError(404, 'Property not found')

  const candidates = await prisma.property.findMany({
    where: { available: true, id: { not: id } },
    include: propertyInclude,
    take: 80,
    orderBy: { id: 'desc' },
  })

  const ranked = candidates
    .map((p) => ({ property: p, score: scoreSimilarity(target, p) }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((row) => toPropertyDto(row.property))

  return { properties: ranked, source: 'rules' }
}

function chatFallback(messages) {
  const last = [...messages].reverse().find((m) => m.role === 'user')
  const text = (last?.content || '').toLowerCase()

  if (/deposit|lease|contract/.test(text)) {
    return 'Most PRS listings ask for 1–2 months deposit with a 6–12 month lease. Check each listing for exact terms — deposit and lease length are shown on the property page.'
  }
  if (/bkk|phnom penh|area|neighbourhood|where/.test(text)) {
    return 'Popular Phnom Penh areas on PRS include BKK1 (cafés and expat-friendly), Toul Kork (quieter residential), and Riverside (central). Use Discover or filter by neighbourhood on the Rent page.'
  }
  if (/price|budget|cheap|afford/.test(text)) {
    return 'Studio and room listings often start around $150–350/mo; 2-bed apartments in BKK1 typically run $400–800. Set a max price on /rent or ask me to parse a search like "2 bed under 500 in BKK1".'
  }
  if (/viewing|visit|see/.test(text)) {
    return 'Open a listing and tap Request viewing to pick a time slot. The landlord gets your request in their dashboard and can reply via Messages.'
  }
  if (/pay|aba|payment/.test(text)) {
    return 'Tenants record rent payments in the dashboard (ABA transfer or cash). Landlords mark payments received — there is no live payment gateway in this demo.'
  }

  return 'I can help you find rentals in Cambodia, explain neighbourhoods, deposits, and how viewing requests work. Try: "furnished 2 bed in Siem Reap under 400" or ask about BKK1 vs Toul Kork.'
}

export async function chatAssistant(messages) {
  const safe = (messages || [])
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .slice(-12)
    .map((m) => ({ role: m.role, content: String(m.content || '').slice(0, 2000) }))

  if (!safe.length) throw new HttpError(400, 'Messages required')

  if (!aiEnabled()) {
    return { reply: chatFallback(safe), source: 'fallback' }
  }

  try {
    const reply = await callOpenAi(
      [
        {
          role: 'system',
          content: `You are PRS Assistant, a helpful rental guide for Cambodia (Property Rental System).
Answer briefly (2-4 sentences). Topics: finding homes, areas (BKK1, Siem Reap, etc.), deposits, viewings, saved searches, messaging landlords.
Do not invent specific listings. Suggest using /rent filters or natural language search when relevant.`,
        },
        ...safe,
      ],
      { maxTokens: 350 },
    )
    return { reply, source: 'openai' }
  } catch {
    return { reply: chatFallback(safe), source: 'fallback' }
  }
}

function suggestReplyFallback({ role, propertyTitle, lastMessage }) {
  const title = propertyTitle || 'the listing'
  const last = (lastMessage || '').toLowerCase()

  if (role === 'tenant') {
    if (/available|still|open/.test(last)) {
      return `Hi! I'm still interested in ${title}. Is it available for a viewing this week?`
    }
    if (/view|visit|time/.test(last)) {
      return 'Thanks! Would Saturday morning or weekday afternoon work for a viewing?'
    }
    return `Hello, I have a question about ${title}. Could you share more details about move-in and the deposit?`
  }

  if (/view|visit|time|when/.test(last)) {
    return `Thanks for your interest in ${title}. I can show the place this week — please share your preferred day and time.`
  }
  if (/price|negot|discount/.test(last)) {
    return `The listed rent for ${title} reflects the current terms. Happy to discuss what's included (utilities, parking) if helpful.`
  }
  return `Thanks for reaching out about ${title}. How can I help — viewing, lease terms, or move-in date?`
}

export async function suggestMessageReply({ role, propertyTitle, messages = [] }) {
  const lastIncoming = [...messages]
    .reverse()
    .find((m) => m.fromRole !== role && m.text)

  if (!aiEnabled()) {
    return {
      suggestion: suggestReplyFallback({
        role,
        propertyTitle,
        lastMessage: lastIncoming?.text,
      }),
      source: 'fallback',
    }
  }

  const transcript = messages
    .slice(-8)
    .map((m) => `${m.fromRole}: ${m.text}`)
    .join('\n')

  try {
    const suggestion = await callOpenAi(
      [
        {
          role: 'system',
          content: `Draft one short, polite reply for a ${role} in a Cambodia rental app. Human will edit before sending. One paragraph max.`,
        },
        {
          role: 'user',
          content: `Property: ${propertyTitle || 'Listing'}\n\n${transcript || 'No messages yet — write an opening message.'}`,
        },
      ],
      { maxTokens: 180 },
    )
    return { suggestion, source: 'openai' }
  } catch {
    return {
      suggestion: suggestReplyFallback({
        role,
        propertyTitle,
        lastMessage: lastIncoming?.text,
      }),
      source: 'fallback',
    }
  }
}

export function getAiStatus() {
  return {
    enabled: aiEnabled(),
    model: env.aiModel,
    features: ['search', 'description', 'similar', 'chat', 'suggest-reply'],
  }
}
