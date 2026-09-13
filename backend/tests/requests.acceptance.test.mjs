// NFR-04 / US-03 acceptance validation.
// "After an accepted rent request, a second tenant cannot receive accepted
// status on the same listing" — repeated, sequential and simultaneous
// acceptance attempts must leave exactly one active occupancy per property.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildWorld, sendRequest, accept, agent, prisma, activeContractOn } from './helpers.mjs'

test('NFR-04 · accepting the same request twice keeps one contract', async () => {
  const { tokens, properties, users } = await buildWorld()
  const request = await sendRequest(tokens.tenantA, properties.open.id, 'rent')
  const first = await accept(tokens.landlordA, request.body.id)
  const second = await accept(tokens.landlordA, request.body.id)

  assert.equal(first.status, 200)
  assert.equal(second.status, 200, 'repeat accept is idempotent, not an error')
  assert.equal(second.body.status, 'accepted')
  const contracts = await prisma.contract.count({ where: { propertyId: properties.open.id } })
  assert.equal(contracts, 1, 'exactly one contract after repeated acceptance')
  const contract = await activeContractOn(prisma, properties.open.id)
  assert.equal(contract.tenantId, users.tenantA.id)
  const property = await prisma.property.findUnique({ where: { id: properties.open.id } })
  assert.equal(property.available, false, 'listing marked unavailable (US-03)')
})

test('NFR-04 · second tenant cannot be accepted after a first acceptance', async () => {
  const { tokens, properties } = await buildWorld()
  const a = await sendRequest(tokens.tenantA, properties.open.id, 'rent')
  const b = await sendRequest(tokens.tenantB, properties.open.id, 'rent')
  const first = await accept(tokens.landlordA, a.body.id)
  const second = await accept(tokens.landlordA, b.body.id)

  assert.equal(first.status, 200)
  assert.equal(second.status, 409)
  assert.match(second.body.message, /active contract/i)
  const contracts = await prisma.contract.count({ where: { propertyId: properties.open.id, status: 'active' } })
  assert.equal(contracts, 1, 'only one valid accepted occupancy')
  const loser = await prisma.rentalRequest.findUnique({ where: { id: b.body.id } })
  assert.equal(loser.status, 'pending', 'losing request stays pending, not accepted')
})

test('NFR-04 · simultaneous acceptance attempts yield exactly one contract', async () => {
  const { tokens, properties } = await buildWorld()
  const requests = await Promise.all([
    sendRequest(tokens.tenantA, properties.open.id, 'rent'),
    sendRequest(tokens.tenantB, properties.open.id, 'rent'),
    sendRequest(tokens.tenantC, properties.open.id, 'rent'),
  ])
  for (const r of requests) assert.equal(r.status, 201)

  const attempts = await Promise.allSettled(
    requests.map((r) => accept(tokens.landlordA, r.body.id)),
  )
  const results = attempts.map((a) => a.value)
  const accepted = results.filter((res) => res.status === 200)
  const rejected = results.filter((res) => res.status === 409)
  assert.equal(accepted.length, 1, `exactly one accept wins, got ${accepted.length}`)
  assert.equal(rejected.length, 2, `the others are occupancy conflicts, got ${rejected.length}`)
  for (const res of rejected) assert.match(res.body.message, /active contract/i)

  const contracts = await prisma.contract.count({ where: { propertyId: properties.open.id, status: 'active' } })
  assert.equal(contracts, 1, 'database still holds exactly one active contract')
  const acceptedRequests = await prisma.rentalRequest.count({
    where: { propertyId: properties.open.id, status: 'accepted' },
  })
  assert.equal(acceptedRequests, 1, 'exactly one accepted request row')
})

test('US-03 · acceptance creates the contract and tenant sees their rental', async () => {
  const { tokens, properties, users } = await buildWorld()
  const request = await sendRequest(tokens.tenantA, properties.open.id, 'rent')
  await accept(tokens.landlordA, request.body.id)

  const contract = await activeContractOn(prisma, properties.open.id)
  assert.ok(contract, 'contract exists')
  assert.equal(contract.tenantId, users.tenantA.id)
  assert.equal(contract.rent, properties.open.price)
  assert.equal(contract.deposit, properties.open.price * 2, 'deposit = two months')

  const current = await agent(tokens.tenantA).get('/api/rentals/current')
  assert.equal(current.status, 200)
  assert.equal(current.body.propertyId, properties.open.id, 'tenant dashboard sees the rental')
  assert.equal(current.body.rent, properties.open.price)

  const mine = await agent(tokens.tenantA).get('/api/requests/mine')
  const acceptedRow = mine.body.find((r) => r.id === request.body.id)
  assert.equal(acceptedRow.status, 'accepted', 'tenant sees accepted after refresh')
})

test('NFR-04 · an accepted request cannot move back to pending or declined', async () => {
  const { tokens, properties } = await buildWorld()
  const request = await sendRequest(tokens.tenantA, properties.open.id, 'rent')
  await accept(tokens.landlordA, request.body.id)

  const toPending = await agent(tokens.landlordA)
    .patch(`/api/requests/${request.body.id}`)
    .send({ status: 'pending' })
  const toDeclined = await agent(tokens.landlordA)
    .patch(`/api/requests/${request.body.id}`)
    .send({ status: 'declined' })

  assert.equal(toPending.status, 409)
  assert.equal(toDeclined.status, 409)
  const contracts = await prisma.contract.count({ where: { propertyId: properties.open.id, status: 'active' } })
  assert.equal(contracts, 1, 'contract survives, state stays consistent')
})

test('Reliability · rent request on an unavailable listing is rejected', async () => {
  const { tokens, properties } = await buildWorld()
  const res = await sendRequest(tokens.tenantA, properties.occupied.id, 'rent')
  assert.equal(res.status, 409)
  assert.match(res.body.message, /no longer available/i)
  const rows = await prisma.rentalRequest.count({ where: { propertyId: properties.occupied.id } })
  assert.equal(rows, 0, 'no request row is created')
})

test('Reliability · decline keeps the listing available and creates no contract', async () => {
  const { tokens, properties } = await buildWorld()
  const request = await sendRequest(tokens.tenantA, properties.open.id, 'rent')
  const res = await agent(tokens.landlordA)
    .patch(`/api/requests/${request.body.id}`)
    .send({ status: 'declined' })
  assert.equal(res.status, 200)
  assert.equal(res.body.status, 'declined')
  const contracts = await prisma.contract.count({ where: { propertyId: properties.open.id } })
  assert.equal(contracts, 0)
  const property = await prisma.property.findUnique({ where: { id: properties.open.id } })
  assert.equal(property.available, true)
})

test('Reliability · accepting a viewing request never creates a contract', async () => {
  const { tokens, properties } = await buildWorld()
  const request = await sendRequest(tokens.tenantA, properties.open.id, 'viewing', {
    viewingDate: '2026-10-02',
  })
  const res = await accept(tokens.landlordA, request.body.id)
  assert.equal(res.status, 200)
  const contracts = await prisma.contract.count({ where: { propertyId: properties.open.id } })
  assert.equal(contracts, 0, 'viewing acceptance is occupancy-free')
  const property = await prisma.property.findUnique({ where: { id: properties.open.id } })
  assert.equal(property.available, true)
})
