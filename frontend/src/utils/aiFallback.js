import { CITIES, PROPERTY_TYPES } from '@/data/properties'
import { areasForCity } from '@/data/areas'
import { scoreSimilarity } from '@/utils/similarity'

const AREAS = CITIES.flatMap((city) => areasForCity(city).map((a) => a.name))

export function parseNaturalSearchFallback(query) {
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

export function generateDescriptionFallback(details) {
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

export function chatFallback(messages) {
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

export function suggestReplyFallback({ role, propertyTitle, lastMessage }) {
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

export function getSimilarPropertiesFallback(properties, propertyId, limit = 4) {
  const target = properties.find((p) => p.id === Number(propertyId))
  if (!target) return { properties: [], source: 'rules' }

  const ranked = properties
    .filter((p) => p.id !== target.id && p.available !== false)
    .map((p) => ({ property: p, score: scoreSimilarity(target, p) }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((row) => row.property)

  return { properties: ranked, source: 'rules' }
}
