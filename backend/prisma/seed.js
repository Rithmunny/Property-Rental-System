import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import { PROPERTIES as FRONTEND_PROPERTIES } from '../../frontend/src/data/properties.js'

const prisma = new PrismaClient()

const KNOWN_LANDLORD_EMAILS = {
  'Sok Dara': { email: 'sokdara@prs.demo', status: 'active' },
  'Chan Sopheak': { email: 'chan.sopheak@prs.demo', status: 'active' },
  'Ly Vannak': { email: 'ly.vannak@prs.demo', status: 'active' },
  'Kim Sreymom': { email: 'kim.sreymom@prs.demo', status: 'active' },
  'Pich Rathanak': { email: 'pich.rathanak@prs.demo', status: 'pending' },
  'Heng Bopha': { email: 'heng.bopha@prs.demo', status: 'active' },
}

function landlordEmailFor(name) {
  return KNOWN_LANDLORD_EMAILS[name]?.email ?? `${name.toLowerCase().replace(/\s+/g, '.')}@prs.demo`
}

const PROPERTIES = FRONTEND_PROPERTIES.map(({ landlord, rating, reviews, id, ...listing }) => ({
  ...listing,
  landlordEmail: landlordEmailFor(landlord),
}))

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
  const superAdminHash = await bcrypt.hash('super-admin1234', 10)

  await prisma.user.deleteMany({ where: { email: 'admin@prs.local' } })

  const admin = await upsertUser(superAdminHash, {
    name: 'Rithmony',
    email: 'rithmunnysopheak@gmail.com',
    role: 'super_admin',
    status: 'active',
    telegram: '@rithmony',
  })

  const landlordByEmail = {}
  for (const listing of FRONTEND_PROPERTIES) {
    const email = landlordEmailFor(listing.landlord)
    if (landlordByEmail[email]) continue
    landlordByEmail[email] = await upsertUser(passwordHash, {
      name: listing.landlord,
      email,
      role: 'landlord',
      status: KNOWN_LANDLORD_EMAILS[listing.landlord]?.status ?? 'active',
      telegram: listing.telegram || '',
      phone: listing.phone || '',
    })
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
        fromUserId: landlordByEmail['sokdara@prs.demo'].id,
        text: 'Yes it is. I can show you this week — weekday evenings work best.',
        createdAt: new Date('2026-08-10T09:40:00.000Z'),
      },
      {
        threadId: thread2.id,
        fromUserId: landlordByEmail['heng.bopha@prs.demo'].id,
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

  console.log(
    `Seeded ${createdProperties.length} Cambodia listings and ${Object.keys(landlordByEmail).length} landlords. Super admin id ${admin.id} (rithmunnysopheak@gmail.com). Demo user password: password123`,
  )
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
