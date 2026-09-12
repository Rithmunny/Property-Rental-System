// Reliability validation of the request-to-rent workflow.
//
// Each test maps to a Review 1 requirement so results can be reported
// directly in the Review 2 document:
//   US-02  duplicate request handling
//   US-03  accept -> contract -> listing unavailable
//   NFR-01 role and ownership access control
//   NFR-04 second tenant cannot receive accepted status on the same listing
//
// Every test rebuilds the world from scratch, so tests are order-independent.
import { test, after } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import {
  app,
  prisma,
  buildWorld,
  resetWorld,
  agent,
  sendRequest,
  accept,
  activeContractOn,
} from './helpers.mjs'

after(async () => {
  await resetWorld()
  await prisma.$disconnect()
})

test('US-02: repeating a request for the same listing returns the existing row', async () => {
  const w = await buildWorld()
  const first = await sendRequest(w.tokens.tenantA, w.properties.open.id, 'rent')
  assert.equal(first.status, 201)
  const second = await sendRequest(w.tokens.tenantA, w.properties.open.id, 'rent')
  assert.equal(second.status, 201)
  assert.equal(second.body.id, first.body.id, 'same request row must be returned')

  const rows = await prisma.rentalRequest.count({
    where: { propertyId: w.properties.open.id, tenantId: w.users.tenantA.id, kind: 'rent' },
  })
  assert.equal(rows, 1)
})

test('US-02: parallel duplicate submits create exactly one row', async () => {
  const w = await buildWorld()
  const responses = await Promise.all(
    Array.from({ length: 5 }, () => sendRequest(w.tokens.tenantB, w.properties.open.id, 'rent')),
  )
  for (const res of responses) {
    assert.ok([200, 201].includes(res.status), `expected success, got ${res.status}`)
    assert.equal(res.body.id, responses[0].body.id, 'all submits return the same row')
  }
  const rows = await prisma.rentalRequest.count({
    where: { propertyId: w.properties.open.id, tenantId: w.users.tenantB.id, kind: 'rent' },
  })
  assert.equal(rows, 1)
})

test('US-02: rent and viewing requests stay separate kinds', async () => {
  const w = await buildWorld()
  const rent = await sendRequest(w.tokens.tenantC, w.properties.open.id, 'rent')
  const viewing = await sendRequest(w.tokens.tenantC, w.properties.open.id, 'viewing', {
    viewingDate: '2026-09-20',
    viewingTime: '14:00',
    note: 'after lunch',
  })
  assert.equal(rent.status, 201)
  assert.equal(viewing.status, 201)
  assert.notEqual(rent.body.id, viewing.body.id)
  const rows = await prisma.rentalRequest.count({
    where: { propertyId: w.properties.open.id, tenantId: w.users.tenantC.id },
  })
  assert.equal(rows, 2, 'one row per kind, not merged and not duplicated')
})

test('US-03: accepting a rent request creates exactly one active contract and hides the listing', async () => {
  const w = await buildWorld()
  const created = await sendRequest(w.tokens.tenantA, w.properties.open.id, 'rent')
  const accepted = await accept(w.tokens.landlordA, created.body.id)
  assert.equal(accepted.status, 200)
  assert.equal(accepted.body.status, 'accepted')

  const contract = await activeContractOn(prisma, w.properties.open.id)
  assert.ok(contract, 'contract exists')
  assert.equal(contract.tenantId, w.users.tenantA.id)

  const property = await prisma.property.findUnique({ where: { id: w.properties.open.id } })
  assert.equal(property.available, false, 'listing is no longer offered')

  const mine = await agent(w.tokens.tenantA).get('/api/requests/mine')
  assert.equal(mine.status, 200)
  assert.ok(mine.body.some((r) => r.id === created.body.id && r.status === 'accepted'))
})

test('NFR-04: repeated acceptance of the same request is idempotent — still one contract', async () => {
  const w = await buildWorld()
  const created = await sendRequest(w.tokens.tenantA, w.properties.open.id, 'rent')
  await accept(w.tokens.landlordA, created.body.id)
  const again = await accept(w.tokens.landlordA, created.body.id)
  assert.equal(again.status, 200)

  const contracts = await prisma.contract.count({
    where: { propertyId: w.properties.open.id, status: 'active' },
  })
  assert.equal(contracts, 1, 'no duplicate contract for the same tenant')
})

test('NFR-04: second tenant cannot be accepted on an occupied listing (sequential)', async () => {
  const w = await buildWorld()
  // Both tenants request while the listing is still open.
  const firstReq = await sendRequest(w.tokens.tenantA, w.properties.open.id, 'rent')
  const secondReq = await sendRequest(w.tokens.tenantB, w.properties.open.id, 'rent')
  assert.equal(firstReq.status, 201)
  assert.equal(secondReq.status, 201)

  const firstAccept = await accept(w.tokens.landlordA, firstReq.body.id)
  assert.equal(firstAccept.status, 200)

  const secondAccept = await accept(w.tokens.landlordA, secondReq.body.id)
  assert.equal(secondAccept.status, 409, 'accepting a second tenant must be rejected')

  const contracts = await prisma.contract.count({
    where: { propertyId: w.properties.open.id, status: 'active' },
  })
  assert.equal(contracts, 1, 'only one valid accepted occupancy')

  const rejected = await prisma.rentalRequest.findUnique({ where: { id: secondReq.body.id } })
  assert.notEqual(rejected.status, 'accepted', 'second tenant must not end up accepted')
})

test('NFR-04: simultaneous acceptance attempts for different tenants produce exactly one contract', async () => {
  const w = await buildWorld()
  const requests = await Promise.all([
    sendRequest(w.tokens.tenantA, w.properties.open.id, 'rent'),
    sendRequest(w.tokens.tenantB, w.properties.open.id, 'rent'),
    sendRequest(w.tokens.tenantC, w.properties.open.id, 'rent'),
  ])
  for (const r of requests) assert.equal(r.status, 201)

  const attempts = await Promise.all([
    accept(w.tokens.landlordA, requests[0].body.id),
    accept(w.tokens.landlordA, requests[1].body.id),
    accept(w.tokens.landlordA, requests[2].body.id),
  ])

  const winners = attempts.filter((r) => r.status === 200)
  const losers = attempts.filter((r) => r.status === 409)
  assert.equal(
    winners.length, 1,
    `exactly one accept may succeed, got statuses ${attempts.map((a) => a.status).join(',')}`,
  )
  assert.equal(losers.length, 2, 'the competing accepts must be rejected with 409')

  const contracts = await prisma.contract.count({
    where: { propertyId: w.properties.open.id, status: 'active' },
  })
  assert.equal(contracts, 1, 'the database allows exactly one active contract per property')

  const property = await prisma.property.findUnique({ where: { id: w.properties.open.id } })
  assert.equal(property.available, false)
})

test('Reliability: rent requests for unavailable listings are rejected', async () => {
  const w = await buildWorld()
  const res = await sendRequest(w.tokens.tenantA, w.properties.occupied.id, 'rent')
  assert.equal(res.status, 409)
  const rows = await prisma.rentalRequest.count({
    where: { propertyId: w.properties.occupied.id, tenantId: w.users.tenantA.id },
  })
  assert.equal(rows, 0, 'no request row is created')
})

test('Reliability: accepting a stale request after the listing was taken is rejected', async () => {
  const w = await buildWorld()
  // A pending request that predates the listing filling up.
  const legacy = await prisma.rentalRequest.create({
    data: {
      propertyId: w.properties.open.id,
      tenantId: w.users.tenantB.id,
      kind: 'rent',
      status: 'pending',
      requestedDate: new Date('2026-09-01'),
    },
  })

  // The listing is then contracted through the manual path.
  const manual = await agent(w.tokens.landlordA)
    .post('/api/contracts')
    .send({
      propertyId: w.properties.open.id,
      tenant: 'tenant.a@test.pr',
      startDate: '2026-09-13',
      endDate: '2027-09-12',
      rent: 350,
      deposit: 700,
    })
  assert.equal(manual.status, 201)

  const lateAccept = await accept(w.tokens.landlordA, legacy.id)
  assert.equal(lateAccept.status, 409, 'accepting on an occupied listing must be rejected')

  const contracts = await prisma.contract.count({
    where: { propertyId: w.properties.open.id, status: 'active' },
  })
  assert.equal(contracts, 1)
})

test('Reliability: an accepted rent request cannot be moved back to pending or declined', async () => {
  const w = await buildWorld()
  const created = await sendRequest(w.tokens.tenantA, w.properties.open.id, 'rent')
  await accept(w.tokens.landlordA, created.body.id)

  const toPending = await agent(w.tokens.landlordA)
    .patch(`/api/requests/${created.body.id}`)
    .send({ status: 'pending' })
  assert.equal(toPending.status, 409)

  const toDeclined = await agent(w.tokens.landlordA)
    .patch(`/api/requests/${created.body.id}`)
    .send({ status: 'declined' })
  assert.equal(toDeclined.status, 409)

  const row = await prisma.rentalRequest.findUnique({ where: { id: created.body.id } })
  assert.equal(row.status, 'accepted')
})

test('NFR-01: unauthenticated callers cannot create or update requests', async () => {
  const created = await request(app).post('/api/requests').send({ propertyId: 1, kind: 'rent' })
  assert.equal(created.status, 401)
  const patched = await request(app).patch('/api/requests/1').send({ status: 'accepted' })
  assert.equal(patched.status, 401)
})

test('NFR-01: landlords cannot send tenant requests and tenants cannot update requests', async () => {
  const w = await buildWorld()
  const asLandlord = await sendRequest(w.tokens.landlordA, w.properties.open.id, 'rent')
  assert.equal(asLandlord.status, 403)

  const created = await sendRequest(w.tokens.tenantA, w.properties.open.id, 'rent')
  const tenantPatch = await accept(w.tokens.tenantA, created.body.id)
  assert.equal(tenantPatch.status, 403, 'tenants must not accept their own requests')
})

test('NFR-01: a landlord cannot accept requests for another landlord’s listing', async () => {
  const w = await buildWorld()
  const created = await sendRequest(w.tokens.tenantA, w.properties.foreign.id, 'rent')
  assert.equal(created.status, 201)

  const stranger = await accept(w.tokens.landlordA, created.body.id)
  assert.equal(stranger.status, 403, 'cross-ownership acceptance must be rejected')

  const owner = await accept(w.tokens.landlordB, created.body.id)
  assert.equal(owner.status, 200, 'the real owner can still accept')
})

test('NFR-01: suspended landlords cannot operate on requests', async () => {
  const w = await buildWorld()
  const created = await sendRequest(w.tokens.tenantA, w.properties.suspendedListing.id, 'rent')
  assert.equal(created.status, 201)
  const res = await accept(w.tokens.suspendedLandlord, created.body.id)
  assert.equal(res.status, 403)
  const row = await prisma.rentalRequest.findUnique({ where: { id: created.body.id } })
  assert.equal(row.status, 'pending', 'suspended landlord cannot change the outcome')
})

test('NFR-01: admin can override an acceptance on behalf of a landlord', async () => {
  const w = await buildWorld()
  const created = await sendRequest(w.tokens.tenantA, w.properties.open.id, 'rent')
  const res = await accept(w.tokens.admin, created.body.id)
  assert.equal(res.status, 200)
  const contract = await activeContractOn(prisma, w.properties.open.id)
  assert.ok(contract, 'admin acceptance still produces the single contract')
})

test('NFR-01: admin role cannot be self-assigned at register', async () => {
  const w = await buildWorld()
  const res = await request(app).post('/api/auth/register').send({
    name: 'Sneaky User',
    email: 'sneaky@test.pr',
    password: 'password123',
    role: 'admin',
  })
  assert.equal(res.status, 400)
  const user = await prisma.user.findUnique({ where: { email: 'sneaky@test.pr' } })
  assert.equal(user, null, 'no admin account was created')
})

test('Reliability: the manual contract path also enforces one active contract per property', async () => {
  const w = await buildWorld()
  const first = await agent(w.tokens.landlordA)
    .post('/api/contracts')
    .send({
      propertyId: w.properties.open.id,
      tenant: 'tenant.a@test.pr',
      startDate: '2026-09-13',
      endDate: '2027-09-12',
    })
  assert.equal(first.status, 201)

  const second = await agent(w.tokens.landlordA)
    .post('/api/contracts')
    .send({
      propertyId: w.properties.open.id,
      tenant: 'tenant.b@test.pr',
      startDate: '2026-09-13',
      endDate: '2027-09-12',
    })
  assert.equal(second.status, 409, 'manual double-booking must be rejected')

  const contracts = await prisma.contract.count({
    where: { propertyId: w.properties.open.id, status: 'active' },
  })
  assert.equal(contracts, 1)
})

test('Reliability: parallel manual contracts for one property produce exactly one', async () => {
  const w = await buildWorld()
  const body = { startDate: '2026-09-13', endDate: '2027-09-12' }
  const attempts = await Promise.all([
    agent(w.tokens.landlordA).post('/api/contracts').send({ ...body, propertyId: w.properties.open.id, tenant: 'tenant.a@test.pr' }),
    agent(w.tokens.landlordA).post('/api/contracts').send({ ...body, propertyId: w.properties.open.id, tenant: 'tenant.b@test.pr' }),
  ])
  const statuses = attempts.map((a) => a.status).sort()
  assert.deepEqual(statuses, [201, 409])
  const contracts = await prisma.contract.count({
    where: { propertyId: w.properties.open.id, status: 'active' },
  })
  assert.equal(contracts, 1)
})

test('Reliability: a landlord cannot create a contract for someone else’s listing', async () => {
  const w = await buildWorld()
  const res = await agent(w.tokens.landlordA)
    .post('/api/contracts')
    .send({
      propertyId: w.properties.foreign.id,
      tenant: 'tenant.a@test.pr',
      startDate: '2026-09-13',
      endDate: '2027-09-12',
    })
  assert.equal(res.status, 403)
})
