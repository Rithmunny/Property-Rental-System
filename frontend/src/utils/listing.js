export const FURNISHED_OPTIONS = [
  { value: 'furnished', label: 'Furnished' },
  { value: 'semi', label: 'Semi-furnished' },
  { value: 'unfurnished', label: 'Unfurnished' },
]

export const LEASE_TERM_OPTIONS = [
  { value: 12, label: '12 months' },
  { value: 6, label: '6 months' },
  { value: 0, label: 'Flexible / short-term' },
]

export const DEPOSIT_OPTIONS = [
  { value: 1, label: '1 month' },
  { value: 2, label: '2 months' },
]

export const CITY_COORDS = {
  'Phnom Penh': { lat: 11.5564, lng: 104.9282 },
  'Siem Reap': { lat: 13.3633, lng: 103.8564 },
  Sihanoukville: { lat: 10.6093, lng: 103.5296 },
  Battambang: { lat: 13.0957, lng: 103.2022 },
}

export const AREA_COORDS = {
  BKK1: { lat: 11.5516, lng: 104.9278 },
  Riverside: { lat: 11.5694, lng: 104.9307 },
  'Diamond Island': { lat: 11.5447, lng: 104.9375 },
  'Toul Kork': { lat: 11.5764, lng: 104.8989 },
  BKK3: { lat: 11.5472, lng: 104.9211 },
  'Chbar Ampov': { lat: 11.535, lng: 104.965 },
  'Wat Bo': { lat: 13.3533, lng: 103.8597 },
  'Near University': { lat: 13.102, lng: 103.198 },
  'Otres Beach': { lat: 10.575, lng: 103.568 },
}

export const PHNOM_PENH_CENTER = CITY_COORDS['Phnom Penh']

export const PROPERTY_DEFAULTS = {
  neighbourhood: '',
  furnished: 'furnished',
  leaseTermMonths: 12,
  depositMonths: 2,
  electricityRate: null,
  parkingFee: 0,
  telegram: '',
  whatsapp: '',
  phone: '',
  images: [],
  lat: null,
  lng: null,
}

export const PRICE_MAX = 3000

export const VIEWING_TIME_SLOTS = [
  '09:00',
  '10:00',
  '11:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
]

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop'

export function coordsForProperty(property) {
  const lat = Number(property?.lat)
  const lng = Number(property?.lng)
  if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng }
  if (property?.neighbourhood && AREA_COORDS[property.neighbourhood]) {
    return AREA_COORDS[property.neighbourhood]
  }
  if (property?.city && CITY_COORDS[property.city]) {
    return CITY_COORDS[property.city]
  }
  return PHNOM_PENH_CENTER
}

export function propertyImages(property) {
  const extras = Array.isArray(property?.images) ? property.images.filter(Boolean) : []
  const cover = property?.image || extras[0] || PLACEHOLDER_IMAGE
  const images = [cover, ...extras.filter((url) => url !== cover)]
  return { image: cover, images }
}

export function withPropertyDefaults(property) {
  const merged = {
    ...PROPERTY_DEFAULTS,
    ...property,
    amenities: property?.amenities ?? [],
  }
  const { image, images } = propertyImages(merged)
  const coords = coordsForProperty(merged)
  return {
    ...merged,
    image,
    images,
    lat: coords.lat,
    lng: coords.lng,
  }
}

export function normalizeFilter(value) {
  if (!value || value === 'Any') return 'All'
  return value
}

export function matchesPropertyFilters(property, filters = {}) {
  const q = (filters.q || '').toLowerCase()
  const c = normalizeFilter(filters.city)
  const t = normalizeFilter(filters.type)
  const a = normalizeFilter(filters.area)
  const minBeds = Number(filters.beds) || 0
  const furn = normalizeFilter(filters.furnished)
  const max = Number(filters.maxPrice) || PRICE_MAX
  const matchesQuery =
    !q ||
    property.title.toLowerCase().includes(q) ||
    property.address.toLowerCase().includes(q) ||
    property.city.toLowerCase().includes(q) ||
    (property.neighbourhood || '').toLowerCase().includes(q)
  const matchesCity = c === 'All' || property.city === c
  const matchesType = t === 'All' || property.type === t
  const matchesArea = a === 'All' || property.neighbourhood === a
  const matchesBeds = !minBeds || property.bedrooms >= minBeds
  const matchesFurnished = furn === 'All' || property.furnished === furn
  const matchesPrice = property.price <= max
  return (
    matchesQuery &&
    matchesCity &&
    matchesType &&
    matchesArea &&
    matchesBeds &&
    matchesFurnished &&
    matchesPrice
  )
}

export function furnishedLabel(value) {
  return FURNISHED_OPTIONS.find((o) => o.value === value)?.label ?? 'Furnished'
}

export function leaseTermLabel(months) {
  if (months === 0 || months === '0') return 'Flexible / short-term'
  const n = Number(months)
  if (!n) return 'Flexible / short-term'
  return `${n} month${n === 1 ? '' : 's'}`
}

export function telegramHref(value) {
  if (!value) return null
  const v = String(value).trim()
  if (!v) return null
  if (v.startsWith('http')) return v
  return `https://t.me/${v.replace(/^@/, '')}`
}

export function whatsappHref(value) {
  if (!value) return null
  const digits = String(value).replace(/\D/g, '')
  if (!digits) return null
  return `https://wa.me/${digits}`
}

export function phoneHref(value) {
  if (!value) return null
  const v = String(value).trim()
  if (!v) return null
  return `tel:${v.replace(/\s/g, '')}`
}

export function averageRating(reviews) {
  if (!reviews?.length) return 0
  const sum = reviews.reduce((acc, r) => acc + Number(r.rating || 0), 0)
  return Math.round((sum / reviews.length) * 100) / 100
}
