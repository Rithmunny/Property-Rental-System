import { prisma } from '../config/prisma.js'
import { toPropertyDto, propertyInclude } from '../dto/property.js'
import { asNumber } from '../utils/dates.js'

// Content-based recommender ("AI recommendations" in the review scope).
// A tenant's saved homes, contracts and requests build a preference profile
// (city, type, budget, size, amenities); every available listing they have
// not already acted on is scored against it. Explainable reasons travel
// with each suggestion so the demo can show WHY a home was recommended.
const WEIGHTS = { city: 3, type: 2, price: 2, bedrooms: 1.5, amenities: 1, furnished: 0.5 }
const SIGNAL_WEIGHTS = { contract: 5, saved: 3, request: 2 }

function bump(map, key, weight) {
  if (key == null || key === '') return
  map.set(key, (map.get(key) || 0) + weight)
}

function ratio(map, key) {
  const max = Math.max(0, ...map.values())
  if (!max) return 0
  return (map.get(key) || 0) / max
}

function mostCommon(map) {
  let best = null
  let bestWeight = -1
  for (const [key, weight] of map) {
    if (weight > bestWeight) {
      bestWeight = weight
      best = key
    }
  }
  return best
}

function buildReasons(property, profile) {
  const reasons = []
  if (ratio(profile.cities, property.city) >= 0.5) reasons.push(`You keep choosing ${property.city}`)
  if (ratio(profile.types, property.type) >= 0.5) reasons.push(`${property.type} homes match your history`)
  if (profile.price && 1 - Math.abs(property.price - profile.price) / profile.price >= 0.7) {
    reasons.push('Fits your typical budget')
  }
  if (profile.bedrooms.get(property.bedrooms)) {
    reasons.push(`${property.bedrooms} bedroom${property.bedrooms > 1 ? 's' : ''} like your history`)
  }
  if (profile.furnished && property.furnished === profile.furnished) {
    reasons.push(`Same ${property.furnished} setup`)
  }
  if (!reasons.length) reasons.push('Popular with tenants right now')
  return reasons.slice(0, 2)
}

async function popular({ limit, user }) {
  const candidates = await prisma.property.findMany({
    where: { available: true },
    include: propertyInclude,
    orderBy: { id: 'desc' },
    take: 60,
  })
  return candidates
    .sort((a, b) => (b.reviews?.length || 0) - (a.reviews?.length || 0))
    .slice(0, limit)
    .map((property) => ({
      ...toPropertyDto(property, user),
      recommendation: { score: 60, reasons: ['Popular with tenants right now'] },
    }))
}

export async function recommendProperties(user, query = {}) {
  const limit = Math.min(asNumber(query.limit, 6) || 6, 12)

  if (user?.role !== 'tenant') return popular({ limit, user })

  const [saved, contracts, requests] = await Promise.all([
    prisma.savedProperty.findMany({
      where: { userId: user.id },
      include: { property: { include: propertyInclude } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.contract.findMany({
      where: { tenantId: user.id },
      include: { property: { include: propertyInclude } },
      orderBy: { startDate: 'desc' },
    }),
    prisma.rentalRequest.findMany({
      where: { tenantId: user.id },
      include: { property: { include: propertyInclude } },
      orderBy: { id: 'desc' },
    }),
  ])

  const signals = [
    ...contracts.map((row) => ({ weight: SIGNAL_WEIGHTS.contract, property: row.property })),
    ...saved.map((row) => ({ weight: SIGNAL_WEIGHTS.saved, property: row.property })),
    ...requests.map((row) => ({ weight: SIGNAL_WEIGHTS.request, property: row.property })),
  ].filter((signal) => signal.property)

  if (!signals.length) return popular({ limit, user })

  const cities = new Map()
  const types = new Map()
  const bedrooms = new Map()
  const amenities = new Map()
  const furnished = new Map()
  let price = 0
  let priceWeight = 0
  for (const { weight, property } of signals) {
    bump(cities, property.city, weight)
    bump(types, property.type, weight)
    bump(bedrooms, property.bedrooms, weight)
    for (const amenity of Array.isArray(property.amenities) ? property.amenities : []) {
      bump(amenities, String(amenity).toLowerCase(), weight)
    }
    bump(furnished, property.furnished, weight)
    price += property.price * weight
    priceWeight += weight
  }
  const profile = {
    cities,
    types,
    bedrooms,
    amenities,
    furnished: mostCommon(furnished),
    price: priceWeight ? price / priceWeight : 0,
  }

  const seenIds = [...new Set(signals.map((s) => s.property.id))]
  const candidates = await prisma.property.findMany({
    where: { available: true, id: { notIn: seenIds } },
    include: propertyInclude,
    take: 120,
  })

  const wantedAmenities = [...amenities.keys()].slice(0, 8)
  const scored = candidates
    .map((property) => {
      const priceScore = profile.price
        ? Math.max(0, 1 - Math.abs(property.price - profile.price) / profile.price)
        : 0
      const preferredBedrooms = mostCommon(bedrooms)
      const gap = Math.abs((property.bedrooms || 0) - (preferredBedrooms ?? property.bedrooms ?? 0))
      const bedroomScore = gap === 0 ? 1 : gap === 1 ? 0.5 : 0
      const candidateAmenities = (Array.isArray(property.amenities) ? property.amenities : []).map((a) =>
        String(a).toLowerCase(),
      )
      const overlap = wantedAmenities.length
        ? wantedAmenities.filter((a) => candidateAmenities.includes(a)).length / wantedAmenities.length
        : 0
      const total =
        WEIGHTS.city * ratio(cities, property.city) +
        WEIGHTS.type * ratio(types, property.type) +
        WEIGHTS.price * priceScore +
        WEIGHTS.bedrooms * bedroomScore +
        WEIGHTS.amenities * overlap +
        (property.furnished === profile.furnished ? WEIGHTS.furnished : 0)
      return { property, score: Math.round((total / 10) * 100) }
    })
    .sort((a, b) => b.score - a.score || (b.property.reviews?.length || 0) - (a.property.reviews?.length || 0))
    .slice(0, limit)

  return scored.map(({ property, score }) => ({
    ...toPropertyDto(property, user),
    recommendation: { score, reasons: buildReasons(property, profile) },
  }))
}
