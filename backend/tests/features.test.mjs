// Review 2 feature validation: sandbox payment gateway and the
// content-based recommendation service. These run after the core
// request-to-rent suite proves the workflow is stable.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import {
  buildWorld,
  sendRequest,
  accept,
  agent,
  app,
  prisma,
  makeProperty,
} from './helpers.mjs'

async function rentToTenantA() {
  const world = await buildWorld()
  const request = await sendRequest(world.tokens.tenantA, world.properties.open.id, 'rent')
  const res = await accept(world.tokens.landlordA, request.body.id)
  assert.equal(res.status, 200)
  return world
}

test('Sandbox · tenant without a rental cannot start a checkout', async () => {
  const { tokens } = await buildWorld()
  const res = await agent(tokens.tenantA).post('/api/payments/checkout')
  assert.equal(res.status, 400)
  assert.match(res.body.message, /no current rental/i)
})

test('Sandbox · checkout creates a pending payment with a reference', async () => {
  const world = await rentToTenantA()
  const res = await agent(world.tokens.tenantA).post('/api/payments/checkout')
  assert.equal(res.status, 201)
  assert.match(res.body.reference, /^PRS-SBX-\d+-/)
  assert.equal(res.body.amount, world.properties.open.price)
  assert.equal(res.body.status, 'pending')
  assert.equal(res.body.sandbox, true)

  const data = await agent(world.tokens.tenantA).get('/api/payments')
  const pending = data.body.history.find((p) => p.status === 'pending')
  assert.ok(pending, 'pending payment appears in tenant history')
})

test('Sandbox · confirm pays the rent and closes the month', async () => {
  const world = await rentToTenantA()
  const checkout = await agent(world.tokens.tenantA).post('/api/payments/checkout')
  const confirm = await agent(world.tokens.tenantA).post(
    `/api/payments/checkout/${checkout.body.paymentId}/confirm`,
  )
  assert.equal(confirm.status, 200)
  assert.equal(confirm.body.receipt.alreadyPaid, false)
  assert.match(confirm.body.receipt.reference, /^PRS-SBX-\d+$/)

  const paid = confirm.body.history.find((p) => p.status === 'paid')
  assert.ok(paid, 'history now holds the paid row')
  assert.equal(paid.amount, world.properties.open.price)

  const data = await agent(world.tokens.tenantA).get('/api/payments')
  const pendingLeft = data.body.history.filter((p) => p.status === 'pending')
  assert.equal(pendingLeft.length, 0, 'no pending payment remains')
})

test('Sandbox · paying twice in one month is refused and confirm is idempotent', async () => {
  const world = await rentToTenantA()
  const checkout = await agent(world.tokens.tenantA).post('/api/payments/checkout')
  await agent(world.tokens.tenantA).post(`/api/payments/checkout/${checkout.body.paymentId}/confirm`)

  const second = await agent(world.tokens.tenantA).post('/api/payments/checkout')
  assert.equal(second.status, 409)
  assert.match(second.body.message, /already paid/i)

  const again = await agent(world.tokens.tenantA).post(
    `/api/payments/checkout/${checkout.body.paymentId}/confirm`,
  )
  assert.equal(again.status, 200)
  assert.equal(again.body.receipt.alreadyPaid, true, 'repeat confirm is idempotent')
})

test('Sandbox · a tenant cannot confirm someone else’s payment', async () => {
  const world = await rentToTenantA()
  const checkout = await agent(world.tokens.tenantA).post('/api/payments/checkout')

  const res = await agent(world.tokens.tenantB).post(
    `/api/payments/checkout/${checkout.body.paymentId}/confirm`,
  )
  assert.equal(res.status, 403)
})

test('Recommendations · guests get popular available listings', async () => {
  await buildWorld()
  const res = await request(app).get('/api/properties/recommendations')
  assert.equal(res.status, 200)
  assert.ok(Array.isArray(res.body))
  for (const item of res.body) {
    assert.equal(item.available, true)
    assert.ok(item.recommendation?.reasons?.length, 'each pick carries a reason')
  }
})

test('Recommendations · tenant signals rank matching homes first', async () => {
  const world = await buildWorld()
  const { users, properties, tokens } = world
  const tenantA = users.tenantA

  // Tenant saves the Phnom Penh apartment; saved + request signals shape the
  // preference profile that similar listings should outrank.
  await prisma.savedProperty.create({ data: { userId: tenantA.id, propertyId: properties.open.id } })
  const similar = await makeProperty(users.landlordA.id, {
    title: 'Similar PP apartment',
    city: 'Phnom Penh',
    type: 'apartment',
    price: 370,
  })
  const far = await makeProperty(users.landlordA.id, {
    title: 'Far villa',
    city: 'Siem Reap',
    type: 'villa',
    price: 1200,
    bedrooms: 5,
  })

  const res = await agent(tokens.tenantA).get('/api/properties/recommendations')
  assert.equal(res.status, 200)
  const ids = res.body.map((p) => p.id)
  assert.ok(ids.includes(similar.id), 'matching home is recommended')
  assert.ok(!ids.includes(properties.open.id), 'already-saved homes are not recommended again')
  assert.ok(!ids.includes(properties.occupied.id), 'unavailable homes are never recommended')

  const similarPick = res.body.find((p) => p.id === similar.id)
  const farIndex = ids.indexOf(far.id)
  if (farIndex !== -1) {
    assert.ok(ids.indexOf(similar.id) < farIndex, 'similar home outranks the far villa')
  }
  assert.ok(similarPick.recommendation.score >= farScore(res.body, far), 'scores are ordered')
  assert.ok(similarPick.recommendation.reasons.length >= 1)
})

function farScore(body, far) {
  const row = body.find((p) => p.id === far.id)
  return row ? row.recommendation.score : -1
}

test('Recommendations · tenant with no history falls back to popular', async () => {
  const { tokens } = await buildWorld()
  const res = await agent(tokens.tenantC).get('/api/properties/recommendations')
  assert.equal(res.status, 200)
  assert.ok(res.body.length >= 1)
  for (const item of res.body) {
    assert.equal(item.available, true)
    assert.equal(item.recommendation.reasons[0], 'Popular with tenants right now')
  }
})
