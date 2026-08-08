# PRS API Contract

This document defines the REST API the frontend expects. All paths are relative to `VITE_API_URL` (default `http://localhost:5000`).

Authentication uses `Authorization: Bearer <token>` on protected routes.

---

## Auth

### POST /api/auth/register

**Body**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "secret123",
  "role": "tenant"
}
```

`role`: `"tenant"` | `"landlord"` (admin is not self-registerable)

**Response** `200`
```json
{
  "user": { "name": "Jane Doe", "email": "jane@example.com", "role": "tenant" },
  "token": "jwt-or-session-token"
}
```

### POST /api/auth/login

**Body**
```json
{
  "email": "jane@example.com",
  "password": "secret123"
}
```

**Response** `200` — same shape as register. Role comes from the database, not the client.

### GET /api/auth/me

**Response** `200`
```json
{ "name": "Jane Doe", "email": "jane@example.com", "role": "tenant" }
```

### POST /api/auth/logout

**Response** `204`

---

## Properties

### GET /api/properties

**Response** `200` — array of Property objects (see schema below)

### GET /api/properties/:id

**Response** `200` — single Property

### POST /api/properties

**Auth:** landlord

**Body** — Property fields without `id`, `rating`, `reviews`

**Response** `201` — created Property

### PUT /api/properties/:id

**Auth:** landlord (owner) or admin

**Body** — partial Property updates

**Response** `200` — updated Property

### DELETE /api/properties/:id

**Auth:** landlord (owner) or admin

**Response** `204`

### Property schema

```json
{
  "id": 1,
  "title": "Modern Downtown Apartment",
  "type": "Apartment",
  "city": "Phnom Penh",
  "address": "Street 240, BKK1",
  "price": 450,
  "bedrooms": 2,
  "bathrooms": 1,
  "area": 65,
  "image": "https://example.com/photo.jpg",
  "description": "A bright, modern 2-bedroom apartment…",
  "amenities": ["Wi-Fi", "Air Conditioning", "Parking"],
  "landlord": "Sok Dara",
  "available": true,
  "rating": 4.92,
  "reviews": 128
}
```

---

## Rental requests

### POST /api/requests

**Auth:** tenant

**Body**
```json
{ "propertyId": 3 }
```

**Response** `201`
```json
{
  "id": 4,
  "propertyId": 3,
  "tenantEmail": "jane@example.com",
  "tenantName": "Jane Doe",
  "landlord": "Ly Vannak",
  "status": "pending",
  "requestedDate": "2026-08-08"
}
```

### GET /api/requests/mine

**Auth:** tenant

**Response** `200` — array of Request objects for the logged-in tenant

### GET /api/requests/inbox

**Auth:** landlord

**Response** `200` — array of Request objects for the landlord's properties

### PATCH /api/requests/:id

**Auth:** landlord

**Body**
```json
{ "status": "accepted" }
```

`status`: `"pending"` | `"accepted"` | `"declined"`

**Response** `200` — updated Request

---

## Saved homes

### GET /api/saved

**Auth:** tenant

**Response** `200` — array of property IDs or `{ propertyId }` objects

### POST /api/saved/:propertyId

**Auth:** tenant — toggles save state

**Response** `200` — array of saved property IDs

### DELETE /api/saved/:propertyId

**Auth:** tenant

**Response** `204`

---

## Rentals & contracts

### GET /api/rentals/current

**Auth:** tenant

**Response** `200`
```json
{
  "propertyId": 4,
  "landlord": "Kim Sreymom",
  "landlordTelegram": "@kim_sreymom",
  "startDate": "2026-02-01",
  "endDate": "2027-01-31",
  "rent": 900,
  "deposit": 1800,
  "paymentMethod": "aba"
}
```

Returns `404` if no active rental.

### GET /api/contracts

**Auth:** landlord

**Response** `200` — array of Contract objects

```json
{
  "id": 1,
  "propertyId": 1,
  "tenant": "Ratana Chea",
  "startDate": "2026-01-01",
  "endDate": "2026-12-31",
  "rent": 450,
  "deposit": 900,
  "status": "active"
}
```

---

## Payments

### GET /api/payments?role=tenant|landlord|admin

**Auth:** required; role must match query or be admin

**Tenant response** `200`
```json
{
  "currentRental": { "paymentMethod": "aba", "rent": 900 },
  "nextPayment": { "dueDate": "Aug 1", "amount": 900 },
  "history": [
    { "id": 1, "month": "July 2026", "amount": 900, "method": "aba", "status": "paid", "date": "2026-07-01" }
  ]
}
```

**Landlord response** `200`
```json
{
  "reminders": [
    { "id": 1, "tenant": "Sophea Meas", "property": "Cozy Studio", "dueDate": "Aug 10", "amount": 280 }
  ],
  "tenants": [
    { "id": 1, "propertyId": 1, "name": "Ratana Chea", "paymentMethod": "aba", "status": "paid", "rent": 450 }
  ]
}
```

**Admin response** `200`
```json
{
  "totalCollected": 12450,
  "pendingCount": 3,
  "methods": { "aba": 72, "cash": 28 }
}
```

---

## Admin users

### GET /api/admin/landlords

**Auth:** admin

**Response** `200`
```json
[
  { "id": 1, "name": "Sok Dara", "telegram": "@sok_dara", "listings": 1, "status": "active" }
]
```

### GET /api/admin/tenants

**Auth:** admin

**Response** `200`
```json
[
  { "id": 1, "name": "Ratana Chea", "telegram": "@ratana_chea", "status": "active" }
]
```

---

## Error responses

```json
{ "message": "Human-readable error description" }
```

Common status codes: `400` validation, `401` unauthenticated, `403` forbidden, `404` not found, `500` server error.

---

## CORS

Allow the frontend origin (e.g. `http://localhost:5173`) and headers:

- `Content-Type`
- `Authorization`

---

## Frontend integration

Mock implementations live in `frontend/src/api/*.js`. Each module checks `VITE_USE_MOCK`:

- `true` → localStorage adapters in `mockStore.js`
- `false` → HTTP via `client.js`

Replace mock behavior by implementing these endpoints; no page changes required.
