// NFR-01 access-control validation for the request-to-rent path:
// role mismatches, ownership violations, suspended landlords, admin override.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import { buildWorld, sendRequest, accept, agent, app, prisma } from './helpers.mjs'

test('NFR-01 · unauthenticated user cannot create a request', async () => {
  const { properties } = await buildWorld()
  const res = await request(app)
    .post('/api/requests')
    .send({ propertyId: properties.open.id, kind: 'rent' })
  assert.equal(res.status, 401)
})

test('NFR-01 · landlord cannot send a rental request', async () => {
  const { tokens, properties } = await buildWorld()
  const res = await sendRequest(tokens.landlordA, properties.open.id, 'rent')
  assert.equal(res.status, 403)
})

test('NFR-01 · landlord cannot update requests on someone else’s listing', async () => {
  const { tokens, properties } = await buildWorld()
  const request = await sendRequest(tokens.tenantA, properties.foreign.id, 'rent')
  const res = await accept(tokens.landlordA, request.body.id)
  assert.equal(res.status, 403)
  assert.match(res.body.message, /cannot update/i)
  const row = await prisma.rentalRequest.findUnique({ where: { id: request.body.id } })
  assert.equal(row.status, 'pending', 'request untouched by the foreign landlord')
})

test('NFR-01 · tenant cannot act on the landlord inbox', async () => {
  const { tokens } = await buildWorld()
  const inbox = await agent(tokens.tenantA).get('/api/requests/inbox')
  assert.equal(inbox.status, 403)
  const patch = await agent(tokens.tenantA).patch('/api/requests/1').send({ status: 'accepted' })
  assert.equal(patch.status, 403)
})

test('NFR-01 · suspended landlord cannot accept requests', async () => {
  const { tokens, properties } = await buildWorld()
  const request = await sendRequest(tokens.tenantA, properties.suspendedListing.id, 'rent')
  const res = await accept(tokens.suspendedLandlord, request.body.id)
  assert.equal(res.status, 403)
  assert.match(res.body.message, /suspended/i)
  const contracts = await prisma.contract.count({ where: { propertyId: properties.suspendedListing.id } })
  assert.equal(contracts, 0)
})

test('NFR-01 · admin may override and accept on any listing', async () => {
  const { tokens, properties, users } = await buildWorld()
  const request = await sendRequest(tokens.tenantA, properties.foreign.id, 'rent')
  const res = await accept(tokens.admin, request.body.id)
  assert.equal(res.status, 200, 'admin override is allowed by the permissions table')
  const contract = await prisma.contract.findFirst({
    where: { propertyId: properties.foreign.id, status: 'active' },
  })
  assert.equal(contract.tenantId, users.tenantA.id)
})

test('NFR-01 · admin role cannot be self-assigned at register', async () => {
  await buildWorld()
  const res = await request(app).post('/api/auth/register').send({
    name: 'Sneaky Admin',
    email: 'sneaky@test.pr',
    password: 'password123',
    role: 'admin',
  })
  assert.equal(res.status, 400)
  assert.match(res.body.message, /role/i)
  const user = await prisma.user.findUnique({ where: { email: 'sneaky@test.pr' } })
  assert.equal(user, null, 'no admin account was created')
})

test('NFR-01 · login rejects a wrong password', async () => {
  const { users } = await buildWorld()
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: users.tenantA.email, password: 'wrong-password' })
  assert.equal(res.status, 401)
})

test('NFR-01 · tenant cannot create listings', async () => {
  const { tokens } = await buildWorld()
  const res = await agent(tokens.tenantA).post('/api/properties').send({ title: 'Nope' })
  assert.equal(res.status, 403)
})
