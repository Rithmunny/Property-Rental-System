// Shared harness for the reliability test suite.
//
// IMPORTANT: the environment must be configured before any app module is
// evaluated, and ESM hoists static imports — so the app is imported here
// dynamically, after the test-database URL is in place. Every test file runs
// in its own node process and must go through this module first.
import process from 'node:process'
import bcrypt from 'bcryptjs'
import request from 'supertest'

process.env.DATABASE_URL = 'postgresql://prs:prs@localhost:5433/prs_test'
process.env.DIRECT_URL = process.env.DATABASE_URL
process.env.JWT_SECRET = 'prs-test-secret'
process.env.PORT = '0'
process.env.FRONTEND_ORIGIN = 'http://localhost:5173'

const { prisma } = await import('../src/config/prisma.js')
const { default: app } = await import('../src/app.js')

export { app, prisma }

export const TEST_PASSWORD = 'password123'

export async function resetWorld() {
  await prisma.payment.deleteMany()
  await prisma.contract.deleteMany()
  await prisma.rentalRequest.deleteMany()
  await prisma.review.deleteMany()
  await prisma.message.deleteMany()
  await prisma.messageThread.deleteMany()
  await prisma.savedSearch.deleteMany()
  await prisma.savedProperty.deleteMany()
  await prisma.property.deleteMany()
  await prisma.user.deleteMany()
}

export async function makeUser(email, role, overrides = {}) {
  return prisma.user.create({
    data: {
      name: overrides.name ?? email.split('@')[0],
      email,
      passwordHash: await bcrypt.hash(overrides.password ?? TEST_PASSWORD, 4),
      role,
      status: overrides.status ?? 'active',
    },
  })
}

export async function makeProperty(landlordId, overrides = {}) {
  const suffix = Math.random().toString(36).slice(2, 7)
  return prisma.property.create({
    data: {
      landlordId,
      title: overrides.title ?? `Test listing ${suffix}`,
      type: 'apartment',
      city: 'Phnom Penh',
      price: 350,
      ...overrides,
    },
  })
}

export async function login(email, password = TEST_PASSWORD) {
  const res = await request(app).post('/api/auth/login').send({ email, password })
  if (res.status !== 200) {
    throw new Error(`login failed for ${email}: ${res.status} ${JSON.stringify(res.body)}`)
  }
  return res.body.token
}

export function agent(token) {
  const auth = (req) => req.set('Authorization', `Bearer ${token}`)
  return {
    get: (url) => auth(request(app).get(url)),
    post: (url) => auth(request(app).post(url)),
    patch: (url) => auth(request(app).patch(url)),
  }
}

// A fresh world of users and listings for one test. landlordA owns the open
// and the occupied listing; landlordB exists for ownership-violation checks.
export async function buildWorld() {
  await resetWorld()
  const landlordA = await makeUser('landlord.a@test.pr', 'landlord', { name: 'Landlord A' })
  const landlordB = await makeUser('landlord.b@test.pr', 'landlord', { name: 'Landlord B' })
  const suspendedLandlord = await makeUser('suspended@test.pr', 'landlord', {
    name: 'Suspended Landlord',
    status: 'suspended',
  })
  const tenantA = await makeUser('tenant.a@test.pr', 'tenant', { name: 'Tenant A' })
  const tenantB = await makeUser('tenant.b@test.pr', 'tenant', { name: 'Tenant B' })
  const tenantC = await makeUser('tenant.c@test.pr', 'tenant', { name: 'Tenant C' })
  const admin = await makeUser('admin@test.pr', 'admin', { name: 'Super Admin' })

  const open = await makeProperty(landlordA.id, { title: 'Open listing' })
  const occupied = await makeProperty(landlordA.id, { title: 'Occupied listing', available: false })
  const foreign = await makeProperty(landlordB.id, { title: 'Foreign listing' })
  const suspendedListing = await makeProperty(suspendedLandlord.id, { title: 'Suspended listing' })

  return {
    users: { landlordA, landlordB, suspendedLandlord, tenantA, tenantB, tenantC, admin },
    properties: { open, occupied, foreign, suspendedListing },
    tokens: {
      landlordA: await login('landlord.a@test.pr'),
      landlordB: await login('landlord.b@test.pr'),
      suspendedLandlord: await login('suspended@test.pr'),
      tenantA: await login('tenant.a@test.pr'),
      tenantB: await login('tenant.b@test.pr'),
      tenantC: await login('tenant.c@test.pr'),
      admin: await login('admin@test.pr'),
    },
  }
}

export async function countContracts(prismaRef, where = {}) {
  return prismaRef.contract.count({ where })
}

export async function activeContractOn(prismaRef, propertyId) {
  return prismaRef.contract.findFirst({ where: { propertyId, status: 'active' } })
}

export async function sendRequest(token, propertyId, kind = 'rent', extras = {}) {
  return agent(token)
    .post('/api/requests')
    .send({ propertyId, kind, ...extras })
}

export async function accept(token, requestId) {
  return agent(token).patch(`/api/requests/${requestId}`).send({ status: 'accepted' })
}
