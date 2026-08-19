export const AREAS_BY_CITY = {
  'Phnom Penh': [
    {
      id: 'bkk1',
      name: 'BKK1',
      fullName: 'Boeung Keng Kang 1',
      blurb: 'Cafes, coworking, and walkable streets — the go-to for expats and young professionals.',
      vibe: 'Urban & social',
      avgRent: '$400–700',
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900&auto=format&fit=crop',
    },
    {
      id: 'riverside',
      name: 'Riverside',
      fullName: 'Sisowath Quay & Tonle Sap',
      blurb: 'River views, night markets, and easy evening walks along the waterfront.',
      vibe: 'Scenic & lively',
      avgRent: '$250–450',
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&auto=format&fit=crop',
    },
    {
      id: 'diamond-island',
      name: 'Diamond Island',
      fullName: 'Koh Pich',
      blurb: 'Modern high-rises, gyms, and pools — condo living with skyline views.',
      vibe: 'Modern & polished',
      avgRent: '$700–1,200',
      image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=900&auto=format&fit=crop',
    },
    {
      id: 'toul-kork',
      name: 'Toul Kork',
      fullName: 'Toul Kork & Russian Blvd',
      blurb: 'Quieter residential streets with parks, schools, and family-friendly rentals.',
      vibe: 'Calm & residential',
      avgRent: '$350–600',
      image: 'https://images.unsplash.com/photo-1560448204-e02f11c3be42?w=900&auto=format&fit=crop',
    },
    {
      id: 'bkk3',
      name: 'BKK3',
      fullName: 'Boeung Keng Kang 3',
      blurb: 'Leafy lanes between BKK1 and Olympic — local eats with a quieter pace.',
      vibe: 'Local & leafy',
      avgRent: '$300–550',
      image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=900&auto=format&fit=crop',
    },
    {
      id: 'chbar-ampov',
      name: 'Chbar Ampov',
      fullName: 'East bank & satellite towns',
      blurb: 'More space for the budget — houses and newer developments across the bridge.',
      vibe: 'Spacious & value',
      avgRent: '$200–400',
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&auto=format&fit=crop',
    },
  ],
  'Siem Reap': [{ id: 'wat-bo', name: 'Wat Bo' }],
  Sihanoukville: [{ id: 'otres-beach', name: 'Otres Beach' }],
  Battambang: [{ id: 'near-university', name: 'Near University' }],
}

export const PHNOM_PENH_AREAS = AREAS_BY_CITY['Phnom Penh']

export function areasForCity(city) {
  if (!city || city === 'All') {
    return Object.values(AREAS_BY_CITY).flat()
  }
  return AREAS_BY_CITY[city] ?? []
}
