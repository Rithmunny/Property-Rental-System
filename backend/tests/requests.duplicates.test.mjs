// US-02 duplicate-request validation.
// "Repeating the same listing shows the existing request rather than a
// duplicate rent row" — sequentially, in parallel, and per tenant/kind.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildWorld, sendRequest, prisma } from './helpers.mjs'

test('US-02 · sequential duplicate rent request returns the existing row', async () => {
  const { tokens, properties } = await buildWorld()
  const first = await sendRequest(tokens.tenantA, properties.open.id, 'rent')
  const second = await sendRequest(tokens.tenantA, properties.open.id, 'rent')

  assert.equal(first.status, 201)
  assert.equal(second.status, 201, 'repeat submit is answered, not rejected')
  assert.equal(second.body.id, first.body.id, 'same request id, not a new row')
  assert.equal(second.body.status, 'pending')
  const rows = await prisma.rentalRequest.count({
    where: { propertyId: properties.open.id, kind: 'rent' },
  })
  assert.equal(rows, 1, 'exactly one rental_request row in the database')
})

test('US-02 · parallel duplicate submits collapse into one row', async () => {
  const { tokens, properties } = await buildWorld()
  const responses = await Promise.all(
    Array.from({ length: 6 }, () => sendRequest(tokens.tenantB, properties.open.id, 'rent')),
  )
  for (const res of responses) {
    assert.equal(res.status, 201, `expected 201, got ${res.status}: ${JSON.stringify(res.body)}`)
    assert.equal(res.body.tenantEmail, 'tenant.b@test.pr')
  }
  const ids = new Set(responses.map((res) => res.body.id))
  assert.equal(ids.size, 1, 'every parallel submit resolves to the same request id')
  const stored = await prisma.rentalRequest.count({
    where: { propertyId: properties.open.id, kind: 'rent' },
  })
  assert.equal(stored, 1, 'database holds exactly one row after the race')
})

test('US-02 · same tenant may hold one rent and one viewing request per listing', async () => {
  const { tokens, properties } = await buildWorld()
  const rent = await sendRequest(tokens.tenantA, properties.open.id, 'rent')
  const viewing = await sendRequest(tokens.tenantA, properties.open.id, 'viewing', {
    viewingDate: '2026-10-01',
    viewingTime: '14:00',
    note: 'after work',
  })
  assert.equal(rent.status, 201)
  assert.equal(viewing.status, 201)
  assert.notEqual(rent.body.id, viewing.body.id)
  const rows = await prisma.rentalRequest.count({ where: { propertyId: properties.open.id } })
  assert.equal(rows, 2, 'one row per (property, tenant, kind)')
})

test('US-02 · different tenants each get their own request for one listing', async () => {
  const { tokens, properties } = await buildWorld()
  const a = await sendRequest(tokens.tenantA, properties.open.id, 'rent')
  const b = await sendRequest(tokens.tenantB, properties.open.id, 'rent')
  assert.equal(a.status, 201)
  assert.equal(b.status, 201)
  assert.notEqual(a.body.id, b.body.id)
  const rows = await prisma.rentalRequest.count({
    where: { propertyId: properties.open.id, kind: 'rent' },
  })
  assert.equal(rows, 2)
})
