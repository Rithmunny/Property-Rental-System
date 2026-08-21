import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const PROPERTIES = [
  {
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
    landlordEmail: 'sokdara@prs.demo',
    available: true,
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
    landlordEmail: 'chan.sopheak@prs.demo',
    available: true,
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
    landlordEmail: 'ly.vannak@prs.demo',
    available: true,
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
    landlordEmail: 'kim.sreymom@prs.demo',
    available: false,
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
    landlordEmail: 'pich.rathanak@prs.demo',
    available: true,
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
    landlordEmail: 'heng.bopha@prs.demo',
    available: true,
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

function d(value) {
  return new Date(`${value}T00:00:00.000Z`)
}

async function upsertUser(passwordHash, data) {
  return prisma.user.upsert({
    where: { email: data.email },
    update: { ...data, passwordHash },
    create: { ...data, passwordHash },
  })
}

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10)

  const admin = await upsertUser(passwordHash, {
    name: 'PRS Admin',
    email: 'admin@prs.local',
    role: 'admin',
    status: 'active',
    telegram: '@prs_admin',
  })

  const landlords = {
    sokdara: await upsertUser(passwordHash, {
      name: 'Sok Dara',
      email: 'sokdara@prs.demo',
      role: 'landlord',
      status: 'active',
      telegram: '@sokdara',
      phone: '+855 12 900 111',
    }),
    chan: await upsertUser(passwordHash, {
      name: 'Chan Sopheak',
      email: 'chan.sopheak@prs.demo',
      role: 'landlord',
      status: 'active',
      telegram: '@chan_sopheak',
      phone: '+855 12 900 222',
    }),
    ly: await upsertUser(passwordHash, {
      name: 'Ly Vannak',
      email: 'ly.vannak@prs.demo',
      role: 'landlord',
      status: 'active',
      telegram: '@ly_vannak',
      phone: '+855 12 900 333',
    }),
    kim: await upsertUser(passwordHash, {
      name: 'Kim Sreymom',
      email: 'kim.sreymom@prs.demo',
      role: 'landlord',
      status: 'active',
      telegram: '@kim_sreymom',
      phone: '+855 12 900 444',
    }),
    pich: await upsertUser(passwordHash, {
      name: 'Pich Rathanak',
      email: 'pich.rathanak@prs.demo',
      role: 'landlord',
      status: 'pending',
      telegram: '@pich_rathanak',
      phone: '+855 12 900 555',
    }),
    heng: await upsertUser(passwordHash, {
      name: 'Heng Bopha',
      email: 'heng.bopha@prs.demo',
      role: 'landlord',
      status: 'active',
      telegram: '@heng_bopha',
      phone: '+855 12 900 666',
    }),
  }

  const demoTenant = await upsertUser(passwordHash, {
    name: 'Demo Tenant',
    email: 'demo@tenant.com',
    role: 'tenant',
    status: 'active',
    telegram: '@demo_tenant',
    phone: '+855 12 111 222',
    preferredContact: 'telegram',
  })
  const ratana = await upsertUser(passwordHash, {
    name: 'Ratana Chea',
    email: 'ratana.chea@prs.demo',
    role: 'tenant',
    status: 'active',
    telegram: '@ratana_chea',
  })
  const sophea = await upsertUser(passwordHash, {
    name: 'Sophea Meas',
    email: 'sophea.meas@prs.demo',
    role: 'tenant',
    status: 'active',
    telegram: '@sophea_m',
  })
  const vibol = await upsertUser(passwordHash, {
    name: 'Vibol Sok',
    email: 'vibol.sok@prs.demo',
    role: 'tenant',
    status: 'active',
    telegram: '@vibol_sok',
  })

  const reviewers = [
    ['linda.k@example.com', 'Linda K.'],
    ['sokha.m@example.com', 'Sokha M.'],
    ['james.w@example.com', 'James W.'],
    ['nina.p@example.com', 'Nina P.'],
    ['rith.s@example.com', 'Rith S.'],
    ['family.chan@example.com', 'The Chan family'],
    ['dara.l@example.com', 'Dara L.'],
    ['mei.v@example.com', 'Mei V.'],
    ['alex.t@example.com', 'Alex T.'],
    ['sreyneang@example.com', 'Sreyneang'],
    ['student.b@example.com', 'Bopha'],
    ['vannak.u@example.com', 'Vannak U.'],
    ['claire.h@example.com', 'Claire H.'],
  ]
  const reviewerByEmail = {}
  for (const [email, name] of reviewers) {
    reviewerByEmail[email] = await upsertUser(passwordHash, {
      name,
      email,
      role: 'tenant',
      status: 'active',
      telegram: `@${email.split('@')[0].replace(/\W/g, '_')}`,
    })
  }

  await prisma.message.deleteMany()
  await prisma.messageThread.deleteMany()
  await prisma.review.deleteMany()
  await prisma.savedSearch.deleteMany()
  await prisma.savedProperty.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.rentalRequest.deleteMany()
  await prisma.contract.deleteMany()
  await prisma.property.deleteMany()

  const landlordByEmail = {
    'sokdara@prs.demo': landlords.sokdara,
    'chan.sopheak@prs.demo': landlords.chan,
    'ly.vannak@prs.demo': landlords.ly,
    'kim.sreymom@prs.demo': landlords.kim,
    'pich.rathanak@prs.demo': landlords.pich,
    'heng.bopha@prs.demo': landlords.heng,
  }

  const createdProperties = []
  for (const listing of PROPERTIES) {
    const { landlordEmail, ...data } = listing
    createdProperties.push(
      await prisma.property.create({
        data: { ...data, landlordId: landlordByEmail[landlordEmail].id },
      }),
    )
  }
  const [p1, p2, p3, p4, p5, p6] = createdProperties

  await prisma.contract.createMany({
    data: [
      {
        propertyId: p1.id,
        tenantId: ratana.id,
        startDate: d('2026-01-01'),
        endDate: d('2026-12-31'),
        rent: 450,
        deposit: 900,
        status: 'active',
        paymentMethod: 'aba',
      },
      {
        propertyId: p2.id,
        tenantId: sophea.id,
        startDate: d('2025-09-01'),
        endDate: d('2026-08-31'),
        rent: 280,
        deposit: 280,
        status: 'ending soon',
        paymentMethod: 'cash',
      },
      {
        propertyId: p3.id,
        tenantId: vibol.id,
        startDate: d('2025-03-01'),
        endDate: d('2027-02-28'),
        rent: 600,
        deposit: 1200,
        status: 'active',
        paymentMethod: 'aba',
      },
      {
        propertyId: p4.id,
        tenantId: demoTenant.id,
        startDate: d('2026-02-01'),
        endDate: d('2027-01-31'),
        rent: 900,
        deposit: 1800,
        status: 'active',
        paymentMethod: 'aba',
      },
    ],
  })

  const contracts = await prisma.contract.findMany({ orderBy: { id: 'asc' } })
  const cRatana = contracts.find((c) => c.tenantId === ratana.id)
  const cVibol = contracts.find((c) => c.tenantId === vibol.id)
  const cDemo = contracts.find((c) => c.tenantId === demoTenant.id)

  await prisma.payment.createMany({
    data: [
      { contractId: cRatana.id, amount: 450, method: 'aba', status: 'paid', month: 'August 2026', date: d('2026-08-01') },
      { contractId: cVibol.id, amount: 600, method: 'aba', status: 'paid', month: 'August 2026', date: d('2026-08-01') },
      { contractId: cDemo.id, amount: 900, method: 'aba', status: 'paid', month: 'July 2026', date: d('2026-07-01') },
      { contractId: cDemo.id, amount: 900, method: 'aba', status: 'paid', month: 'June 2026', date: d('2026-06-01') },
      { contractId: cDemo.id, amount: 900, method: 'cash', status: 'paid', month: 'May 2026', date: d('2026-05-02') },
    ],
  })

  await prisma.rentalRequest.createMany({
    data: [
      {
        propertyId: p3.id,
        tenantId: demoTenant.id,
        kind: 'rent',
        status: 'pending',
        requestedDate: d('2026-07-28'),
      },
      {
        propertyId: p6.id,
        tenantId: demoTenant.id,
        kind: 'rent',
        status: 'accepted',
        requestedDate: d('2026-07-10'),
      },
      {
        propertyId: p1.id,
        tenantId: demoTenant.id,
        kind: 'viewing',
        status: 'pending',
        requestedDate: d('2026-08-15'),
        viewingDate: d('2026-08-22'),
        viewingTime: '10:00',
        note: 'Weekday morning preferred',
      },
    ],
  })

  await prisma.savedProperty.createMany({
    data: [
      { userId: demoTenant.id, propertyId: p1.id },
      { userId: demoTenant.id, propertyId: p2.id },
    ],
  })

  const reviewRows = [
    [p1, 'linda.k@example.com', 5, 'Bright, quiet, and a short walk to cafes. Landlord was responsive on Telegram.', '2026-06-12'],
    [p1, 'sokha.m@example.com', 5, 'Exactly as listed. Pool and security made it easy to settle in.', '2026-05-02'],
    [p1, 'james.w@example.com', 4, 'Great BKK1 location. Street parking can be tight on weekends.', '2026-03-18'],
    [p2, 'nina.p@example.com', 5, 'Loved the river view. Compact but well designed for one person.', '2026-07-01'],
    [p2, 'rith.s@example.com', 4, 'Good value. A bit noisy near the night market, but the balcony helps.', '2026-04-22'],
    [p3, 'family.chan@example.com', 5, 'Garden and parking are perfect for kids. Quiet village feel.', '2026-06-28'],
    [p3, 'dara.l@example.com', 5, 'Spacious rooms and a kind landlord. Semi-furnished as described.', '2026-02-14'],
    [p4, 'mei.v@example.com', 5, 'Condo amenities are excellent. Pool view is the real highlight.', '2026-07-08'],
    [p4, 'alex.t@example.com', 5, 'Professional building, fast elevator, and 24/7 security.', '2026-05-19'],
    [p4, 'sreyneang@example.com', 4, 'Beautiful unit. Parking fee is extra, so budget for that.', '2026-03-03'],
    [p5, 'student.b@example.com', 4, 'Cheap and close to campus. Shared kitchen is basic but clean.', '2026-06-05'],
    [p5, 'vannak.u@example.com', 5, 'Best student room I found in Battambang. Wi-Fi was reliable.', '2026-04-11'],
    [p6, 'demo@tenant.com', 5, 'Waking up near the beach never gets old. Hammock terrace is a win.', '2026-07-15'],
    [p6, 'claire.h@example.com', 5, 'Relaxed stay, easy parking, and the landlord was quick to help.', '2026-05-30'],
  ]

  for (const [property, email, rating, comment, createdAt] of reviewRows) {
    const tenant = email === 'demo@tenant.com' ? demoTenant : reviewerByEmail[email]
    await prisma.review.create({
      data: {
        propertyId: property.id,
        tenantId: tenant.id,
        tenantEmail: tenant.email,
        tenantName: tenant.name,
        rating,
        comment,
        createdAt: d(createdAt),
      },
    })
  }

  const thread1 = await prisma.messageThread.create({
    data: { propertyId: p1.id, tenantId: demoTenant.id },
  })
  const thread2 = await prisma.messageThread.create({
    data: { propertyId: p6.id, tenantId: demoTenant.id },
  })
  await prisma.message.createMany({
    data: [
      {
        threadId: thread1.id,
        fromUserId: demoTenant.id,
        text: 'Hi, is the BKK1 apartment still available for a 12-month lease?',
        createdAt: new Date('2026-08-10T09:12:00.000Z'),
      },
      {
        threadId: thread1.id,
        fromUserId: landlords.sokdara.id,
        text: 'Yes it is. I can show you this week — weekday evenings work best.',
        createdAt: new Date('2026-08-10T09:40:00.000Z'),
      },
      {
        threadId: thread2.id,
        fromUserId: landlords.heng.id,
        text: 'Thanks for the viewing request. Otres is free Saturday at 10:00 if that still works.',
        createdAt: new Date('2026-08-12T03:20:00.000Z'),
      },
      {
        threadId: thread2.id,
        fromUserId: demoTenant.id,
        text: 'Saturday 10:00 is perfect. See you there.',
        createdAt: new Date('2026-08-12T04:01:00.000Z'),
      },
    ],
  })

  console.log(`Seeded PRS demo data. Admin id ${admin.id}. Password for all demo users: password123`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (err) => {
    console.error(err)
    await prisma.$disconnect()
    process.exit(1)
  })
