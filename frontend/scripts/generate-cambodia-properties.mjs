import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))

const LANDLORDS = [
  { name: 'Sok Dara', telegram: '@sokdara', whatsapp: '+85512900111', phone: '+855 12 900 111' },
  { name: 'Chan Sopheak', telegram: '@chan_sopheak', whatsapp: '+85512900222', phone: '+855 12 900 222' },
  { name: 'Ly Vannak', telegram: '@ly_vannak', whatsapp: '+85512900333', phone: '+855 12 900 333' },
  { name: 'Kim Sreymom', telegram: '@kim_sreymom', whatsapp: '+85512900444', phone: '+855 12 900 444' },
  { name: 'Pich Rathanak', telegram: '@pich_rathanak', whatsapp: '', phone: '+855 12 900 555' },
  { name: 'Heng Bopha', telegram: '@heng_bopha', whatsapp: '+85512900666', phone: '+855 12 900 666' },
  { name: 'Nhean Chanthou', telegram: '@nhean_chanthou', whatsapp: '+85512900777', phone: '+855 12 900 777' },
  { name: 'Meas Ravy', telegram: '@meas_ravy', whatsapp: '+85512900888', phone: '+855 12 900 888' },
  { name: 'Oum Sophal', telegram: '@oum_sophal', whatsapp: '+85512900999', phone: '+855 12 900 999' },
  { name: 'Keo Malis', telegram: '@keo_malis', whatsapp: '+85512901010', phone: '+855 12 901 010' },
  { name: 'Hun Vicheka', telegram: '@hun_vicheka', whatsapp: '+85512901111', phone: '+855 12 901 111' },
  { name: 'Prak Sothea', telegram: '@prak_sothea', whatsapp: '+85512901212', phone: '+855 12 901 212' },
  { name: 'Chea Mony', telegram: '@chea_mony', whatsapp: '+85512901313', phone: '+855 12 901 313' },
  { name: 'Touch Pisey', telegram: '@touch_pisey', whatsapp: '+85512901414', phone: '+855 12 901 414' },
  { name: 'Samnang Dara', telegram: '@samnang_dara', whatsapp: '+85512901515', phone: '+855 12 901 515' },
  { name: 'Vong Sreyneang', telegram: '@vong_sreyneang', whatsapp: '+85512901616', phone: '+855 12 901 616' },
  { name: 'Lim Borey', telegram: '@lim_borey', whatsapp: '+85512901717', phone: '+855 12 901 717' },
  { name: 'Nop Chenda', telegram: '@nop_chenda', whatsapp: '+85512901818', phone: '+855 12 901 818' },
  { name: 'Yim Rathana', telegram: '@yim_rathana', whatsapp: '+85512901919', phone: '+855 12 901 919' },
  { name: 'Pheng Sreyleak', telegram: '@pheng_sreyleak', whatsapp: '+85512902020', phone: '+855 12 902 020' },
]

const COORDS = {
  'Phnom Penh|BKK1': [11.5516, 104.9278],
  'Phnom Penh|BKK2': [11.548, 104.924],
  'Phnom Penh|BKK3': [11.5472, 104.9211],
  'Phnom Penh|Riverside': [11.5694, 104.9307],
  'Phnom Penh|Diamond Island': [11.5447, 104.9375],
  'Phnom Penh|Toul Kork': [11.5764, 104.8989],
  'Phnom Penh|Toul Tom Poung': [11.5485, 104.9165],
  'Phnom Penh|Chamkar Mon': [11.5505, 104.9255],
  'Phnom Penh|Tonle Bassac': [11.551, 104.933],
  'Phnom Penh|Sen Sok': [11.592, 104.878],
  'Phnom Penh|Chroy Changvar': [11.59, 104.94],
  'Phnom Penh|Chbar Ampov': [11.535, 104.965],
  'Phnom Penh|Mean Chey': [11.53, 104.92],
  'Phnom Penh|Russey Keo': [11.595, 104.915],
  'Phnom Penh|Olympic': [11.558, 104.911],
  'Siem Reap|Wat Bo': [13.3533, 103.8597],
  'Siem Reap|Old Market': [13.355, 103.855],
  'Siem Reap|Sala Kamreuk': [13.362, 103.86],
  'Siem Reap|Svay Dangkum': [13.368, 103.85],
  'Siem Reap|Wat Damnak': [13.348, 103.865],
  'Sihanoukville|Otres Beach': [10.575, 103.568],
  'Sihanoukville|Otres 2': [10.568, 103.575],
  'Sihanoukville|Ochheuteal': [10.598, 103.528],
  'Sihanoukville|Independence Beach': [10.615, 103.518],
  'Battambang|Near University': [13.102, 103.198],
  'Battambang|Riverside': [13.096, 103.204],
  'Battambang|Wat Kor': [13.088, 103.195],
  'Kampot|Old Town': [10.61, 104.181],
  'Kampot|Teuk Chhou': [10.64, 104.165],
  'Kep|Kep Beach': [10.483, 104.316],
  'Kep|Crab Market': [10.487, 104.308],
  'Kampong Cham|Riverside': [11.993, 105.464],
  'Kampong Cham|Town Center': [11.99, 105.455],
  'Koh Kong|Town Center': [11.615, 102.984],
  'Koh Kong|Cham Yeam': [11.67, 102.92],
}

const IMAGES = {
  Apartment: [
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop',
  ],
  Studio: [
    'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&auto=format&fit=crop',
  ],
  Condo: [
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1560448204-6032e3052892?w=800&auto=format&fit=crop',
  ],
  House: [
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&auto=format&fit=crop',
  ],
  Villa: [
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdbc?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&auto=format&fit=crop',
  ],
  Room: [
    'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&auto=format&fit=crop',
  ],
  Beach: [
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1505691938895-1758d7afb09d?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800&auto=format&fit=crop',
  ],
}

const AMENITIES = {
  Apartment: ['Wi-Fi', 'Air Conditioning', 'Parking', 'Security'],
  Studio: ['Wi-Fi', 'Air Conditioning', 'Balcony'],
  Condo: ['Wi-Fi', 'Gym', 'Swimming Pool', 'Security', 'Elevator', 'Parking'],
  House: ['Garden', 'Parking', 'Air Conditioning', 'Security', 'Pet Friendly'],
  Villa: ['Wi-Fi', 'Garden', 'Parking', 'Swimming Pool', 'Security', 'Air Conditioning'],
  Room: ['Wi-Fi', 'Shared Kitchen'],
}

const EXISTING = [
  {
    id: 1,
    title: 'Modern Downtown Apartment',
    type: 'Apartment',
    city: 'Phnom Penh',
    neighbourhood: 'BKK1',
    address: 'Street 240, BKK1',
    price: 450,
    bedrooms: 2,
    bathrooms: 1,
    area: 65,
    lat: 11.5521,
    lng: 104.9284,
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop',
    ],
    description:
      'A bright, modern 2-bedroom apartment in the heart of BKK1, walking distance to cafes, gyms, and coworking spaces. Fully furnished with high-speed internet included.',
    amenities: ['Wi-Fi', 'Air Conditioning', 'Parking', 'Swimming Pool', 'Security'],
    landlord: 'Sok Dara',
    available: true,
    rating: 4.92,
    reviews: 128,
    furnished: 'furnished',
    leaseTermMonths: 12,
    depositMonths: 2,
    electricityRate: 0.25,
    parkingFee: 0,
    telegram: '@sokdara',
    whatsapp: '+85512900111',
    phone: '+855 12 900 111',
  },
  {
    id: 2,
    title: 'Cozy Studio Near River',
    type: 'Studio',
    city: 'Phnom Penh',
    neighbourhood: 'Riverside',
    address: 'Sisowath Quay',
    price: 280,
    bedrooms: 1,
    bathrooms: 1,
    area: 32,
    lat: 11.5698,
    lng: 104.9312,
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&auto=format&fit=crop',
    ],
    description:
      'Compact studio with a river view, perfect for a single tenant or student. Close to public transport and the night market.',
    amenities: ['Wi-Fi', 'Air Conditioning', 'Balcony'],
    landlord: 'Chan Sopheak',
    available: true,
    rating: 4.76,
    reviews: 64,
    furnished: 'furnished',
    leaseTermMonths: 6,
    depositMonths: 1,
    electricityRate: 0.28,
    parkingFee: 20,
    telegram: '@chan_sopheak',
    whatsapp: '+85512900222',
    phone: '+855 12 900 222',
  },
  {
    id: 3,
    title: 'Family House with Garden',
    type: 'House',
    city: 'Siem Reap',
    neighbourhood: 'Wat Bo',
    address: 'Wat Bo Village',
    price: 600,
    bedrooms: 4,
    bathrooms: 3,
    area: 180,
    lat: 13.3541,
    lng: 103.8604,
    image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&auto=format&fit=crop',
    ],
    description:
      'Spacious family home with a private garden and off-street parking, located in a quiet village close to the city center.',
    amenities: ['Garden', 'Parking', 'Air Conditioning', 'Security', 'Pet Friendly'],
    landlord: 'Ly Vannak',
    available: true,
    rating: 4.85,
    reviews: 41,
    furnished: 'semi',
    leaseTermMonths: 12,
    depositMonths: 2,
    electricityRate: 0.22,
    parkingFee: 0,
    telegram: '@ly_vannak',
    whatsapp: '+85512900333',
    phone: '+855 12 900 333',
  },
  {
    id: 4,
    title: 'Luxury Condo with Pool View',
    type: 'Condo',
    city: 'Phnom Penh',
    neighbourhood: 'Diamond Island',
    address: 'Diamond Island',
    price: 900,
    bedrooms: 3,
    bathrooms: 2,
    area: 110,
    lat: 11.5454,
    lng: 104.9381,
    image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1560448204-6032e3052892?w=800&auto=format&fit=crop',
    ],
    description:
      'High-rise luxury condo with panoramic river views, rooftop pool access, gym, and 24/7 concierge service.',
    amenities: ['Wi-Fi', 'Gym', 'Swimming Pool', 'Security', 'Elevator', 'Parking'],
    landlord: 'Kim Sreymom',
    available: false,
    rating: 4.97,
    reviews: 203,
    furnished: 'furnished',
    leaseTermMonths: 12,
    depositMonths: 2,
    electricityRate: 0.25,
    parkingFee: 50,
    telegram: '@kim_sreymom',
    whatsapp: '+85512900444',
    phone: '+855 12 900 444',
  },
  {
    id: 5,
    title: 'Budget Room for Students',
    type: 'Room',
    city: 'Battambang',
    neighbourhood: 'Near University',
    address: 'Near University',
    price: 90,
    bedrooms: 1,
    bathrooms: 1,
    area: 18,
    lat: 13.1028,
    lng: 103.1991,
    image: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&auto=format&fit=crop',
    ],
    description:
      'Affordable private room ideal for students, shared kitchen and common area, five-minute walk to campus.',
    amenities: ['Wi-Fi', 'Shared Kitchen'],
    landlord: 'Pich Rathanak',
    available: true,
    rating: 4.5,
    reviews: 19,
    furnished: 'unfurnished',
    leaseTermMonths: 6,
    depositMonths: 1,
    electricityRate: null,
    parkingFee: 0,
    telegram: '@pich_rathanak',
    whatsapp: '',
    phone: '+855 12 900 555',
  },
  {
    id: 6,
    title: 'Beachside Bungalow',
    type: 'House',
    city: 'Sihanoukville',
    neighbourhood: 'Otres Beach',
    address: 'Otres Beach',
    price: 500,
    bedrooms: 2,
    bathrooms: 2,
    area: 75,
    lat: 10.5758,
    lng: 103.5692,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1505691938895-1758d7afb09d?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800&auto=format&fit=crop',
    ],
    description:
      'Relaxed bungalow just steps from the beach, open-plan living space, and a private hammock terrace.',
    amenities: ['Wi-Fi', 'Air Conditioning', 'Beach Access', 'Parking'],
    landlord: 'Heng Bopha',
    available: true,
    rating: 4.88,
    reviews: 77,
    furnished: 'furnished',
    leaseTermMonths: 0,
    depositMonths: 1,
    electricityRate: 0.3,
    parkingFee: 0,
    telegram: '@heng_bopha',
    whatsapp: '+85512900666',
    phone: '+855 12 900 666',
  },
]

const NEW_LISTINGS = [
  ['Sunny 1BR on Street 308', 'Apartment', 'Phnom Penh', 'BKK2', 'Street 308, BKK2', 380, 1, 1, 48, 'furnished', 12, 1, true, 'Quiet one-bedroom above a coffee shop, a short walk to BKK1 coworking spaces and evening restaurants.'],
  ['Serviced Studio above Street 240', 'Studio', 'Phnom Penh', 'BKK1', 'Street 240, BKK1', 320, 1, 1, 28, 'furnished', 6, 1, true, 'Hotel-style studio with daily cleaning available. Walk to cafes, gyms, and the Independence Monument.'],
  ['Toul Kork Garden Apartment', 'Apartment', 'Phnom Penh', 'Toul Kork', 'Street 315, Toul Kork', 420, 2, 1, 70, 'furnished', 12, 2, true, 'Two-bedroom apartment facing a small park, popular with families who want space without leaving the city.'],
  ['Russian Market Walk-up', 'Apartment', 'Phnom Penh', 'Toul Tom Poung', 'Street 155, Toul Tom Poung', 310, 1, 1, 45, 'semi', 12, 1, true, 'One-bedroom walk-up two minutes from Russian Market. Ideal if you cook at home and shop locally.'],
  ['Bassac Riverfront Condo', 'Condo', 'Phnom Penh', 'Tonle Bassac', 'Preah Norodom Blvd, Tonle Bassac', 850, 2, 2, 95, 'furnished', 12, 2, true, 'High-floor condo with Mekong views, gym, and 24-hour lobby. Easy access to the riverside and embassies.'],
  ['Chamkar Mon Family Flat', 'Apartment', 'Phnom Penh', 'Chamkar Mon', 'Street 310, Chamkar Mon', 480, 2, 2, 78, 'furnished', 12, 2, true, 'Bright family flat near schools and local markets, with two bathrooms and a small laundry balcony.'],
  ['Sen Sok Townhouse', 'House', 'Phnom Penh', 'Sen Sok', 'Grand Phnom Penh, Sen Sok', 550, 3, 2, 140, 'semi', 12, 2, true, 'Three-bedroom townhouse in a gated street, with parking for two motos and a small rear garden.'],
  ['Chroy Changvar Mekong View', 'Condo', 'Phnom Penh', 'Chroy Changvar', 'National Road 6, Chroy Changvar', 720, 2, 2, 88, 'furnished', 12, 2, true, 'Newer condo on the east bank with river views, pool, and quieter evenings than central Phnom Penh.'],
  ['Olympic Stadium Studio', 'Studio', 'Phnom Penh', 'Olympic', 'Street 199, Olympic', 220, 1, 1, 26, 'furnished', 6, 1, true, 'Compact studio near Olympic Stadium. Good for a single professional who uses the market and gym nearby.'],
  ['Mean Chey Budget Room', 'Room', 'Phnom Penh', 'Mean Chey', 'Street 271, Mean Chey', 80, 1, 1, 16, 'unfurnished', 6, 1, true, 'Simple private room with shared kitchen. Cheap monthly rent for students or first jobs in the city.'],
  ['Russey Keo Riverside House', 'House', 'Phnom Penh', 'Russey Keo', 'National Road 5, Russey Keo', 480, 3, 2, 130, 'semi', 12, 2, true, 'Detached house near the river with off-street parking and a covered outdoor kitchen.'],
  ['BKK3 Leafy Lane Apartment', 'Apartment', 'Phnom Penh', 'BKK3', 'Street 330, BKK3', 360, 1, 1, 52, 'furnished', 12, 1, true, 'One-bedroom on a shaded lane between BKK1 and Olympic. Quieter than Street 278, still walkable to cafes.'],
  ['Koh Pich Skyline Suite', 'Condo', 'Phnom Penh', 'Diamond Island', 'Koh Pich, Diamond Island', 1100, 3, 2, 125, 'furnished', 12, 2, false, 'Corner suite with skyline views, two parking spaces, and full building amenities including a rooftop pool.'],
  ['Street 51 Nightlife Studio', 'Studio', 'Phnom Penh', 'BKK1', 'Street 51, BKK1', 300, 1, 1, 30, 'furnished', 0, 1, true, 'Studio on Street 51 for tenants who want nightlife downstairs. Double-glazed windows and a blackout curtain.'],
  ['Toul Kork Parkside House', 'House', 'Phnom Penh', 'Toul Kork', 'Street 289, Toul Kork', 680, 4, 3, 175, 'semi', 12, 2, true, 'Four-bedroom house opposite a park. Suitable for a family or housemates who need a home office.'],
  ['Boeung Trabek 2BR', 'Apartment', 'Phnom Penh', 'BKK3', 'Street 163, BKK3', 390, 2, 1, 62, 'furnished', 12, 2, true, 'Practical two-bedroom near Boeung Trabek Market, with reliable Wi-Fi and a motorcycle parking cage.'],
  ['Grand Phnom Penh Villa', 'Villa', 'Phnom Penh', 'Sen Sok', 'Grand Phnom Penh Boulevard', 1400, 5, 4, 280, 'furnished', 12, 2, true, 'Gated villa with a private pool, maid room, and garden. Twenty minutes to BKK1 with less city noise.'],
  ['AEON Mall 2 Convenient Flat', 'Apartment', 'Phnom Penh', 'Mean Chey', 'Near AEON Mall 2, Mean Chey', 340, 2, 1, 58, 'furnished', 12, 1, true, 'Two-bedroom flat a short tuk-tuk from AEON Mall 2. Handy for shopping, cinema, and supermarket runs.'],
  ['Prek Leap Lake House', 'House', 'Phnom Penh', 'Chroy Changvar', 'Prek Leap, Chroy Changvar', 520, 3, 2, 145, 'semi', 12, 2, true, 'House facing a small lake on the Chroy Changvar peninsula. Cooler evenings and space for bikes.'],
  ['Street 240 Designer Loft', 'Apartment', 'Phnom Penh', 'BKK1', 'Street 240, BKK1', 620, 2, 2, 80, 'furnished', 12, 2, true, 'Open-plan loft with high ceilings and a work nook. Steps from galleries, bakeries, and Street 240 shops.'],
  ['Riverside Colonial Studio', 'Studio', 'Phnom Penh', 'Riverside', 'Street 130, Riverside', 350, 1, 1, 34, 'furnished', 6, 1, true, 'Renovated colonial-era studio near Wat Phnom. Tall windows, wooden floors, and a small balcony.'],
  ['Toul Tom Poung Family House', 'House', 'Phnom Penh', 'Toul Tom Poung', 'Street 155, Toul Tom Poung', 590, 3, 2, 155, 'semi', 12, 2, true, 'Three-bedroom house behind Russian Market. Courtyard parking and a downstairs living room for guests.'],
  ['The Peak 1BR Condo', 'Condo', 'Phnom Penh', 'Tonle Bassac', 'The Peak, Tonle Bassac', 780, 1, 1, 68, 'furnished', 12, 2, true, 'One-bedroom in a landmark tower with gym, pool, and sky lounge. Suited to professionals near the riverfront.'],
  ['Chbar Ampov Value House', 'House', 'Phnom Penh', 'Chbar Ampov', 'National Road 1, Chbar Ampov', 320, 3, 2, 120, 'unfurnished', 12, 1, true, 'Unfurnished house across Monivong Bridge. More space for the money if you have your own furniture.'],
  ['BKK2 Penthouse Terrace', 'Condo', 'Phnom Penh', 'BKK2', 'Street 308, BKK2', 950, 3, 2, 115, 'furnished', 12, 2, false, 'Top-floor condo with a private terrace. Evening breezes and a skyline view toward Independence Monument.'],
  ['Street 310 Student Room', 'Room', 'Phnom Penh', 'BKK3', 'Street 310, BKK3', 110, 1, 1, 14, 'furnished', 6, 1, true, 'Furnished single room near several language schools. Shared fridge and motorbike parking in the alley.'],
  ['Russian Blvd Office-Living Apt', 'Apartment', 'Phnom Penh', 'Toul Kork', 'Russian Blvd, Toul Kork', 400, 1, 1, 55, 'furnished', 12, 1, true, 'One-bedroom that works as a live-work unit. Fast internet and a desk alcove facing the boulevard.'],
  ['Koh Pich Hotel-Style Studio', 'Studio', 'Phnom Penh', 'Diamond Island', 'Koh Pich Street, Diamond Island', 480, 1, 1, 38, 'furnished', 0, 1, true, 'Serviced studio with weekly cleaning. Good for short stays or consultants rotating through Phnom Penh.'],
  ['Chamkar Mon Villa with Pool', 'Villa', 'Phnom Penh', 'Chamkar Mon', 'Street 310, Chamkar Mon', 1600, 4, 4, 260, 'furnished', 12, 2, true, 'Private villa with a 12-meter pool, covered terrace, and staff quarters. Walking distance to international schools.'],
  ['Steung Meanchey Workshop House', 'House', 'Phnom Penh', 'Mean Chey', 'Street 271, Mean Chey', 280, 2, 1, 95, 'unfurnished', 12, 1, true, 'Two-bedroom house with a ground-floor workshop. Practical for a small business plus living upstairs.'],
  ['Sisowath Corner Apartment', 'Apartment', 'Phnom Penh', 'Riverside', 'Sisowath Quay, Riverside', 510, 2, 1, 72, 'furnished', 12, 2, true, 'Corner apartment overlooking the Tonle Sap. Evening promenade, night market, and ferry views from the balcony.'],
  ['Olympic 3BR Family Flat', 'Apartment', 'Phnom Penh', 'Olympic', 'Street 199, Olympic', 430, 3, 2, 88, 'semi', 12, 2, true, 'Three-bedroom near Olympic Market. Semi-furnished so you can bring beds and still have a kitchen ready.'],
  ['Sen Sok New Build Condo', 'Condo', 'Phnom Penh', 'Sen Sok', 'Kim Il Sung Blvd, Sen Sok', 560, 2, 1, 72, 'furnished', 12, 2, true, 'New mid-rise condo with a small gym and visitor parking. Newer finishes than central walk-ups.'],
  ['Chroy Changvar Garden Villa', 'Villa', 'Phnom Penh', 'Chroy Changvar', 'National Road 6A, Chroy Changvar', 980, 4, 3, 220, 'furnished', 12, 2, true, 'Garden villa on the peninsula with mango trees and a covered carport. Cooler and quieter than BKK1.'],
  ['Street 278 Cafe-District Studio', 'Studio', 'Phnom Penh', 'BKK1', 'Street 278, BKK1', 290, 1, 1, 27, 'furnished', 6, 1, true, 'Studio above the cafe strip on Street 278. Walk downstairs for brunch; blackout blinds for late nights.'],
  ['Toul Kork Duplex', 'House', 'Phnom Penh', 'Toul Kork', 'Street 315, Toul Kork', 750, 3, 3, 160, 'furnished', 12, 2, true, 'Split-level duplex with a rooftop laundry terrace. Three bathrooms so housemates do not queue.'],
  ['BKK3 Balcony Apartment', 'Apartment', 'Phnom Penh', 'BKK3', 'Street 360, BKK3', 340, 1, 1, 46, 'furnished', 12, 1, true, 'One-bedroom with a deep balcony for plants and a drying rack. Quiet residential lane, 10 minutes to BKK1.'],
  ['Bassac Lane Serviced Apt', 'Apartment', 'Phnom Penh', 'Tonle Bassac', 'Street 21, Tonle Bassac', 700, 2, 2, 82, 'furnished', 0, 2, true, 'Serviced two-bedroom with weekly housekeeping. Close to the riverfront and ministry buildings.'],
  ['Chbar Ampov Riverside Room', 'Room', 'Phnom Penh', 'Chbar Ampov', 'National Road 1, Chbar Ampov', 70, 1, 1, 15, 'unfurnished', 6, 1, true, 'Low-cost private room on the east bank. Shared bathroom downstairs and a fan included.'],
  ['Diamond Island 2BR Pool Condo', 'Condo', 'Phnom Penh', 'Diamond Island', 'Koh Pich, Diamond Island', 820, 2, 2, 92, 'furnished', 12, 2, true, 'Two-bedroom facing the lagoon pool. Gym, kids club, and covered parking in the same building.'],
  ['Russey Keo Mekong House', 'House', 'Phnom Penh', 'Russey Keo', 'Street 598, Russey Keo', 450, 3, 2, 135, 'semi', 12, 2, true, 'House a few streets back from the Mekong. Raised ground floor for flood season and a moto ramp.'],
  ['Street 63 Compact 1BR', 'Apartment', 'Phnom Penh', 'BKK2', 'Street 63, BKK2', 330, 1, 1, 42, 'furnished', 12, 1, true, 'Efficient one-bedroom on Street 63. Elevator building, security guard, and a 7-Eleven on the corner.'],
  ['Toul Tom Poung Rooftop Studio', 'Studio', 'Phnom Penh', 'Toul Tom Poung', 'Street 155, Toul Tom Poung', 240, 1, 1, 24, 'furnished', 6, 1, true, 'Rooftop studio with a water view of neighbouring roofs. Cheap, breezy, and close to the market.'],
  ['Camko City Modern Condo', 'Condo', 'Phnom Penh', 'Toul Kork', 'Camko City, Toul Kork', 680, 2, 2, 86, 'furnished', 12, 2, false, 'Condo in Camko City with a large communal pool and supermarket downstairs. Family-friendly compound.'],
  ['Mean Chey Shop-House', 'House', 'Phnom Penh', 'Mean Chey', 'Street 271, Mean Chey', 360, 3, 2, 110, 'unfurnished', 12, 1, true, 'Classic shophouse: ground floor for storage or a stall, two living floors above. Front roll-down door.'],
  ['BKK1 Luxury 3BR', 'Apartment', 'Phnom Penh', 'BKK1', 'Street 294, BKK1', 880, 3, 2, 105, 'furnished', 12, 2, true, 'Premium three-bedroom with a dining terrace. Walking distance to international restaurants and clinics.'],
  ['Independence Monument View Apt', 'Apartment', 'Phnom Penh', 'Chamkar Mon', 'Sihanouk Blvd, Chamkar Mon', 540, 2, 1, 74, 'furnished', 12, 2, true, 'Second-floor apartment with a partial view of Independence Monument. Wide boulevard, easy Grab access.'],
  ['Olympic Shared Room', 'Room', 'Phnom Penh', 'Olympic', 'Street 199, Olympic', 95, 1, 1, 12, 'furnished', 6, 1, true, 'Small furnished room in a shared house near Olympic Stadium. Includes Wi-Fi and a locker.'],
  ['Sen Sok Affordable 2BR', 'Apartment', 'Phnom Penh', 'Sen Sok', 'Street 2004, Sen Sok', 300, 2, 1, 60, 'semi', 12, 1, true, 'Value two-bedroom in a newer walk-up. A/C in the bedrooms, fan in the living room, parking for one car.'],
  ['Wat Bo Wooden House', 'House', 'Siem Reap', 'Wat Bo', 'Wat Bo Road', 420, 3, 2, 140, 'semi', 12, 2, true, 'Traditional wooden house on stilts with a modern kitchen extension. Quiet lane behind Wat Bo pagoda.'],
  ['Old Market Loft', 'Apartment', 'Siem Reap', 'Old Market', '2 Thnou Street, Old Market', 280, 1, 1, 50, 'furnished', 6, 1, true, 'Loft above a souvenir shop. You can walk to Pub Street but sleep one block off the main noise.'],
  ['Pub Street Studio', 'Studio', 'Siem Reap', 'Old Market', 'Pub Street, Old Market', 220, 1, 1, 22, 'furnished', 0, 1, true, 'Tiny studio for short-term stays near Pub Street. Best if you work nights or travel often to the temples.'],
  ['Sala Kamreuk Family Villa', 'Villa', 'Siem Reap', 'Sala Kamreuk', 'Sala Kamreuk Village', 900, 4, 3, 240, 'furnished', 12, 2, true, 'Pooled villa with a tropical garden, 10 minutes to the Old Market. Popular with longer-stay families.'],
  ['Svay Dangkum 2BR', 'Apartment', 'Siem Reap', 'Svay Dangkum', 'Sivatha Blvd, Svay Dangkum', 310, 2, 1, 64, 'furnished', 12, 1, true, 'Two-bedroom on Sivatha with supermarket and pharmacies downstairs. Easy Grab to the temples.'],
  ['Wat Damnak Garden House', 'House', 'Siem Reap', 'Wat Damnak', 'Wat Damnak Village', 480, 3, 2, 150, 'semi', 12, 2, true, 'House with a fruit garden near Wat Damnak. Birds in the morning, tuk-tuks 8 minutes to town.'],
  ['Near Angkor Ticket Office Room', 'Room', 'Siem Reap', 'Svay Dangkum', 'Charles de Gaulle, Svay Dangkum', 85, 1, 1, 16, 'furnished', 6, 1, true, 'Single room for temple-circuit workers or students. Shared kitchen and moto parking in the yard.'],
  ['French Quarter Colonial Apt', 'Apartment', 'Siem Reap', 'Old Market', 'Street 26, Old Market', 390, 2, 1, 68, 'furnished', 12, 2, true, 'Colonial-style apartment with shuttered windows and a small courtyard. Close to the Old Market food stalls.'],
  ['Wat Bo Pool Villa', 'Villa', 'Siem Reap', 'Wat Bo', 'Wat Bo Village', 1200, 4, 4, 260, 'furnished', 12, 2, false, 'Private pool villa with four ensuite bedrooms. Housekeeper available. Ten minutes by bike to Pub Street.'],
  ['Sala Kamreuk Modern Studio', 'Studio', 'Siem Reap', 'Sala Kamreuk', 'Sala Kamreuk Road', 200, 1, 1, 28, 'furnished', 6, 1, true, 'New-build studio with a kitchenette. Quieter than the Old Market, still a cheap tuk-tuk into town.'],
  ['Rice Field Edge House', 'House', 'Siem Reap', 'Wat Damnak', 'Wat Damnak outskirts', 350, 2, 2, 110, 'semi', 12, 1, true, 'Two-bedroom house looking onto rice fields. Sunset views and space for bicycles or a small dog.'],
  ['Night Market Walk-up', 'Apartment', 'Siem Reap', 'Old Market', 'Angkor Night Market Road', 260, 1, 1, 42, 'furnished', 6, 1, true, 'One-bedroom above a massage shop near the night market. Good for someone who likes evening energy.'],
  ['Svay Dangkum Townhouse', 'House', 'Siem Reap', 'Svay Dangkum', 'Sivatha Blvd, Svay Dangkum', 520, 3, 2, 148, 'semi', 12, 2, true, 'Townhouse with a garage and rooftop. Handy for families who drive to the temples most mornings.'],
  ['Wat Bo Boutique 1BR', 'Apartment', 'Siem Reap', 'Wat Bo', 'Wat Bo Road', 340, 1, 1, 44, 'furnished', 12, 1, true, 'Boutique one-bedroom with teak furniture and a rain shower. Quiet after 9pm despite being close to town.'],
  ['Angkor Countryside Bungalow', 'House', 'Siem Reap', 'Wat Damnak', 'Toward Roluos, Wat Damnak', 380, 2, 1, 70, 'furnished', 0, 1, true, 'Thatched-roof bungalow on a small plot. Flexible lease for digital nomads who want countryside mornings.'],
  ['Otres 2 Beach House', 'House', 'Sihanoukville', 'Otres 2', 'Otres 2 Beach Road', 620, 3, 2, 95, 'furnished', 0, 2, true, 'Three-bedroom beach house a two-minute walk to Otres 2. Hammocks, outdoor shower, and a BBQ pit.'],
  ['Ochheuteal Sea-View Condo', 'Condo', 'Sihanoukville', 'Ochheuteal', 'Ochheuteal Beach Road', 550, 2, 2, 78, 'furnished', 12, 2, true, 'Sea-view condo with a building pool. Closer to town restaurants than Otres, still an easy beach walk.'],
  ['Independence Beach Studio', 'Studio', 'Sihanoukville', 'Independence Beach', 'Independence Beach Road', 280, 1, 1, 30, 'furnished', 6, 1, true, 'Studio facing Independence Beach. Morning swims and a quieter strip than Ochheuteal at night.'],
  ['Otres Beach Bar-Street Room', 'Room', 'Sihanoukville', 'Otres Beach', 'Otres 1 Village', 130, 1, 1, 18, 'furnished', 0, 1, true, 'Private room behind the Otres bar strip. Shared kitchen, beach five minutes on foot, flexible months.'],
  ['Serendipity Hill Villa', 'Villa', 'Sihanoukville', 'Ochheuteal', 'Serendipity Hill', 1100, 4, 3, 210, 'furnished', 12, 2, true, 'Hillside villa above Serendipity with a wide sea view and a small infinity-style pool.'],
  ['Otres 2 Surf Bungalow', 'House', 'Sihanoukville', 'Otres 2', 'Otres 2 sand track', 450, 2, 1, 60, 'furnished', 0, 1, true, 'Simple bungalow for surfers and long-stay travelers. Outdoor kitchen, mosquito nets, and beach access.'],
  ['Independence Beach 2BR Apt', 'Apartment', 'Sihanoukville', 'Independence Beach', 'Victory Hill Road', 390, 2, 1, 66, 'furnished', 12, 1, true, 'Two-bedroom apartment a short walk from Independence Beach. Better for longer stays than a guesthouse.'],
  ['Ochheuteal Budget Studio', 'Studio', 'Sihanoukville', 'Ochheuteal', 'Ochheuteal back street', 210, 1, 1, 24, 'semi', 6, 1, true, 'Budget studio one street back from the beach. Fan plus one A/C unit. Close to street food at night.'],
  ['Otres Family House', 'House', 'Sihanoukville', 'Otres Beach', 'Otres 1, second row', 700, 3, 2, 110, 'furnished', 12, 2, true, 'Family house on the second row at Otres 1. Garden, parking, and a five-minute walk to the sand.'],
  ['Battambang Colonial House', 'House', 'Battambang', 'Riverside', 'Street 1, Riverside', 380, 3, 2, 150, 'semi', 12, 2, true, 'French-colonial house on the Sangker River. High ceilings, a tiled veranda, and bicycle parking.'],
  ['Wat Kor Village Home', 'House', 'Battambang', 'Wat Kor', 'Wat Kor Village', 320, 3, 2, 125, 'unfurnished', 12, 1, true, 'Village house near Wat Kor. Quiet nights, fruit trees, and a 10-minute ride to the town center.'],
  ['Bamboo Train Road Apt', 'Apartment', 'Battambang', 'Near University', 'National Road 57, Near University', 180, 1, 1, 40, 'furnished', 12, 1, true, 'Simple one-bedroom on the road toward the bamboo train. Cheap for a teacher or NGO staffer.'],
  ['Battambang Studio Loft', 'Studio', 'Battambang', 'Riverside', 'Street 2, Riverside', 150, 1, 1, 28, 'furnished', 6, 1, true, 'Loft studio in a renovated shophouse. Walk to the riverside night market and old cinema.'],
  ['University Shared Room', 'Room', 'Battambang', 'Near University', 'Campus Road, Near University', 70, 1, 1, 14, 'unfurnished', 6, 1, true, 'Lowest-cost room near campus. Shared bathroom and kitchen. Bring your own mattress if you want extra comfort.'],
  ['Wat Kor Garden House', 'House', 'Battambang', 'Wat Kor', 'Wat Kor Village Road', 400, 3, 2, 140, 'semi', 12, 2, true, 'Garden house with a well and a covered sala. Good for a family who wants village life with town nearby.'],
  ['Town Center 2BR', 'Apartment', 'Battambang', 'Riverside', 'Street 3, Riverside', 220, 2, 1, 55, 'furnished', 12, 1, true, 'Two-bedroom above a pharmacy in the town center. Balcony over the street, A/C in both rooms.'],
  ['Old Town Riverside House', 'House', 'Kampot', 'Old Town', 'River Road, Old Town', 450, 3, 2, 130, 'furnished', 12, 2, true, 'Riverside house in Kampot Old Town. Evening breeze off the Praek Tuek Chhu and restaurants on the same street.'],
  ['Kampot Old Town Studio', 'Studio', 'Kampot', 'Old Town', 'Old Market Street, Old Town', 180, 1, 1, 26, 'furnished', 6, 1, true, 'Studio near the old market. Perfect for a single tenant who bikes to the river and the durian roundabout.'],
  ['Teuk Chhou River Bungalow', 'House', 'Kampot', 'Teuk Chhou', 'Teuk Chhou Road', 350, 2, 1, 55, 'furnished', 0, 1, true, 'Bungalow on the way to Teuk Chhou rapids. Birds, river sounds, and a 15-minute moto into Old Town.'],
  ['Durian Roundabout Apt', 'Apartment', 'Kampot', 'Old Town', 'Near Durian Roundabout', 220, 2, 1, 50, 'semi', 12, 1, true, 'Two-bedroom near the durian roundabout. Easy parking and a short walk to the night market.'],
  ['Kampot Hills Villa', 'Villa', 'Kampot', 'Teuk Chhou', 'Kampot Hills, Teuk Chhou', 800, 4, 3, 200, 'furnished', 12, 2, true, 'Hillside villa with Bokor views, a plunge pool, and space for guests. Cooler than the riverside in April.'],
  ['Night Market Room', 'Room', 'Kampot', 'Old Town', 'Night Market Lane, Old Town', 90, 1, 1, 14, 'furnished', 6, 1, true, 'Small room a block from Kampot night market. Shared kitchen, Wi-Fi, and a bicycle you can borrow.'],
  ['Kep Beach Cottage', 'House', 'Kep', 'Kep Beach', 'Kep Beach Road', 480, 2, 1, 65, 'furnished', 0, 1, true, 'Cottage across the road from Kep Beach. Crab Market is a 10-minute walk along the promenade.'],
  ['Crab Market Apartment', 'Apartment', 'Kep', 'Crab Market', 'Kep Crab Market', 260, 1, 1, 40, 'furnished', 6, 1, true, 'One-bedroom above a seafood stall. Wake up to the market, then swim at the beach after lunch.'],
  ['Kep National Park Villa', 'Villa', 'Kep', 'Kep Beach', 'Kep National Park Road', 950, 3, 3, 180, 'furnished', 12, 2, true, 'Villa on the park slope with sea glimpses and a private trail start. Quiet nights, monkeys in the morning.'],
  ['Mekong Riverside House', 'House', 'Kampong Cham', 'Riverside', 'Mekong River Road', 340, 3, 2, 128, 'semi', 12, 2, true, 'House facing the Mekong in Kampong Cham. Watch the sunset from the veranda; bamboo bridge in season.'],
  ['Bamboo Bridge Studio', 'Studio', 'Kampong Cham', 'Riverside', 'Near Seasonal Bamboo Bridge', 160, 1, 1, 24, 'furnished', 6, 1, true, 'Studio near the seasonal bamboo bridge. Simple, cheap, and a short walk to riverside snacks.'],
  ['Town Center Family Apt', 'Apartment', 'Kampong Cham', 'Town Center', 'Preah Bat Street, Town Center', 210, 2, 1, 52, 'furnished', 12, 1, true, 'Two-bedroom in the town center near markets and the provincial hall. Practical for local staff.'],
  ['Koh Kong Town Shophouse', 'House', 'Koh Kong', 'Town Center', 'Street 3, Koh Kong Town', 280, 3, 2, 100, 'unfurnished', 12, 1, true, 'Shophouse in Koh Kong town. Ground floor for a small shop, living space above, parking out front.'],
  ['Cham Yeam Border Studio', 'Studio', 'Koh Kong', 'Cham Yeam', 'Cham Yeam border road', 150, 1, 1, 22, 'furnished', 6, 1, true, 'Studio near Cham Yeam for people crossing to Thailand often. Fan, A/C, and a small fridge.'],
]

function pickImages(type, city, id) {
  const beachCity = city === 'Sihanoukville' || city === 'Kep'
  const pool = beachCity && (type === 'House' || type === 'Villa' || type === 'Studio')
    ? IMAGES.Beach
    : IMAGES[type] || IMAGES.Apartment
  const start = id % pool.length
  const images = [pool[start], pool[(start + 1) % pool.length], pool[(start + 2) % pool.length]]
  if (pool.length > 3) images.push(pool[(start + 3) % pool.length])
  return images
}

function extrasFor(type, city) {
  const list = [...(AMENITIES[type] || AMENITIES.Apartment)]
  if (city === 'Sihanoukville' || city === 'Kep') {
    if (!list.includes('Beach Access')) list.push('Beach Access')
  }
  return list
}

function jitter(base, id) {
  const [lat, lng] = base
  const dLat = ((id * 17) % 11) * 0.00035
  const dLng = ((id * 13) % 9) * 0.0004
  return [Number((lat + dLat).toFixed(4)), Number((lng + dLng).toFixed(4))]
}

function buildNew(id, spec, landlordIndex) {
  const [title, type, city, neighbourhood, address, price, bedrooms, bathrooms, area, furnished, leaseTermMonths, depositMonths, available, description] = spec
  const landlord = LANDLORDS[landlordIndex % LANDLORDS.length]
  const images = pickImages(type, city, id)
  const [lat, lng] = jitter(COORDS[`${city}|${neighbourhood}`], id)
  const rating = Number((4.35 + ((id * 7) % 60) / 100).toFixed(2))
  const reviews = 8 + ((id * 11) % 190)
  const electricityRate = type === 'Room' && price < 100 ? null : Number((0.22 + ((id % 9) * 0.01)).toFixed(2))
  const parkingFee = type === 'Condo' ? 30 + (id % 3) * 10 : type === 'Villa' ? 0 : (id % 4 === 0 ? 20 : 0)

  return {
    id,
    title,
    type,
    city,
    neighbourhood,
    address,
    price,
    bedrooms,
    bathrooms,
    area,
    lat,
    lng,
    image: images[0],
    images,
    description,
    amenities: extrasFor(type, city),
    landlord: landlord.name,
    available,
    rating,
    reviews,
    furnished,
    leaseTermMonths,
    depositMonths,
    electricityRate,
    parkingFee,
    telegram: landlord.telegram,
    whatsapp: landlord.whatsapp,
    phone: landlord.phone,
  }
}

const properties = [
  ...EXISTING,
  ...NEW_LISTINGS.map((spec, i) => buildNew(i + 7, spec, i + 6)),
]

if (properties.length !== 100) {
  throw new Error(`Expected 100 properties, got ${properties.length}`)
}

const cities = [...new Set(properties.map((p) => p.city))]
const types = [...new Set(properties.map((p) => p.type))]
const counts = Object.fromEntries(LANDLORDS.map((l) => [l.name, properties.filter((p) => p.landlord === l.name).length]))

const file = `export const PROPERTIES = ${JSON.stringify(properties, null, 2)}

export const CITIES = [...new Set(PROPERTIES.map((p) => p.city))]
export const PROPERTY_TYPES = [...new Set(PROPERTIES.map((p) => p.type))]
`

writeFileSync(join(root, '..', 'src', 'data', 'properties.js'), file)
console.log(`Wrote ${properties.length} properties`)
console.log('Cities:', cities.join(', '))
console.log('Types:', types.join(', '))
console.log('Landlord counts:', JSON.stringify(counts, null, 2))
