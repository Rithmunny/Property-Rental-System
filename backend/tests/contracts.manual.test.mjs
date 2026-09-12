// Contract integrity through the manual landlord path: the same
// one-active-occupancy-per-property invariant must hold outside the
// request-to-rent flow.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import { buildWorld, agent, app, prisma, activeContractOn } from './helpers.mjs'

function contractBody(tenantName, extra = {}) {
  return { tenant: tenantName, startDate: '2026-10-01', endDate: '2027-09-30', ...extra }
}

test('Manual path · landlord creates one contract and the listing closes', async () => {
  const { tokens, users, properties } = await buildWorld()
  const res = await agent(tokens.landlordA)
    .post('/api/contracts')
    .send(contractBody(users.tenantA.name, { propertyId: properties.open.id, rent: 380 }))
  assert.equal(res.status, 201)
  assert.equal(res.body.status, 'active')

  const property = await prisma.property.findUnique({ where: { id: properties.open.id } })
  assert.equal(property.available, false, 'manual contract also marks the listing unavailable')
})

test('Manual path · a second active contract on the same property is rejected', async () => {
  const { tokens, users, properties } = await buildWorld()
  const first = await agent(tokens.landlordA)
    .post('/api/contracts')
    .send(contractBody(users.tenantA.name, { propertyId: properties.open.id }))
  assert.equal(first.status, 201)

  const second = await agent(tokens.landlordA)
    .post('/api/contracts')
    .send(contractBody(users.tenantB.name, { propertyId: properties.open.id }))
  assert.equal(second.status, 409)
  assert.match(second.body.message, /active contract/i)
  const contracts = await prisma.contract.count({ where: { propertyId: properties.open.id } })
  assert.equal(contracts, 1)
})

test('Manual path · landlord cannot contract a foreign listing', async () => {
  const { tokens, users, properties } = await buildWorld()
  const res = await agent(tokens.landlordB)
    .post('/api/contracts')
    .send(contractBody(users.tenantA.name, { propertyId: properties.open.id }))
  assert.equal(res.status, 403)
  assert.match(res.body.message, /your listings/i)
})

test('Manual path · unknown tenant name is rejected', async () => {
  const { tokens, properties } = await buildWorld()
  const res = await agent(tokens.landlordA)
    .post('/api/contracts')
    .send(contractBody('ghost tenant', { propertyId: properties.open.id }))
  assert.equal(res.status, 400)
  assert.match(res.body.message, /must have an account/i)
})

test('Manual path · occupied listing blocks the request-to-rent bridge', async () => {
  const { tokens, users, properties } = await buildWorld()
  // Occupy via manual contract, then confirm a tenant rent request is refused.
  await agent(tokens.landlordA)
    .post('/api/contracts')
    .send(contractBody(users.tenantA.name, { propertyId: properties.open.id }))
  const res = await request(app)
    .post('/api/requests')
    .set('Authorization', `Bearer ${tokens.tenantB}`)
    .send({ propertyId: properties.open.id, kind: 'rent' })
  assert.equal(res.status, 409)
  assert.match(res.body.message, /no longer available/i)
})
