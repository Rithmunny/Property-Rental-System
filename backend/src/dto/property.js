import { averageRating } from './review.js'

export function toPropertyDto(property, currentUser) {
  if (!property) return null
  const reviews = property.reviews || []
  const images = Array.isArray(property.images) ? property.images : []
  const amenities = Array.isArray(property.amenities) ? property.amenities : []
  const landlordName = property.landlordUser?.name || property.landlord || ''
  return {
    id: property.id,
    title: property.title,
    type: property.type,
    city: property.city,
    neighbourhood: property.neighbourhood || '',
    address: property.address || '',
    price: property.price,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    area: property.area,
    lat: property.lat,
    lng: property.lng,
    image: property.image || images[0] || '',
    images,
    description: property.description || '',
    amenities,
    landlord: landlordName,
    available: Boolean(property.available),
    rating: reviews.length ? averageRating(reviews) : 0,
    reviews: reviews.length,
    furnished: property.furnished || 'furnished',
    leaseTermMonths: property.leaseTermMonths ?? 12,
    depositMonths: property.depositMonths ?? 2,
    electricityRate: property.electricityRate ?? null,
    parkingFee: property.parkingFee || 0,
    telegram: property.telegram || '',
    whatsapp: property.whatsapp || '',
    phone: property.phone || '',
    landlordOwned: Boolean(currentUser && currentUser.id === property.landlordId),
  }
}

export const propertyInclude = {
  landlordUser: { select: { id: true, name: true, telegram: true } },
  reviews: true,
}
