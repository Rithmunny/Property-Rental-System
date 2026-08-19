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
  "neighbourhood": "BKK1",
  "address": "Street 240, BKK1",
  "price": 450,
  "bedrooms": 2,
  "bathrooms": 1,
  "area": 65,
  "image": "https://example.com/photo.jpg",
  "images": [
    "https://example.com/photo.jpg",
    "https://example.com/living.jpg",
    "https://example.com/kitchen.jpg"
  ],
  "lat": 11.5521,
  "lng": 104.9284,
  "description": "A bright, modern 2-bedroom apartment…",
  "amenities": ["Wi-Fi", "Air Conditioning", "Parking"],
  "landlord": "Sok Dara",
  "available": true,
  "rating": 4.92,
  "reviews": 128,
  "furnished": "furnished",
  "leaseTermMonths": 12,
  "depositMonths": 2,
  "electricityRate": 0.25,
  "parkingFee": 0,
  "telegram": "@sokdara",
  "whatsapp": "+85512900111",
  "phone": "+855 12 900 111"
}
```

`area` is floor size in m². `neighbourhood` is the sangkat / area name used by `/rent?area=BKK1`.

`furnished`: `"furnished"` | `"semi"` | `"unfurnished"`

`leaseTermMonths`: `6` | `12` | `0` (`0` = flexible / short-term)

`depositMonths`: `1` or `2`

`electricityRate`: USD/kWh number, or `null` if unknown

`parkingFee`: USD/month (`0` if included or none)

`telegram`, `whatsapp`, `phone`: contact strings; empty string if not listed

`image` is the cover photo. `images` is the full gallery (cover first).

`lat` / `lng` are WGS84 coordinates used by the Rent map. If omitted, the frontend falls back to neighbourhood/city centers.

---

## Rental requests

### POST /api/requests

**Auth:** tenant

**Body**
```json
{
  "propertyId": 3,
  "kind": "viewing",
  "viewingDate": "2026-08-22",
  "viewingTime": "10:00",
  "note": "Prefer late morning"
}
```

`kind`: `"rent"` | `"viewing"`. Defaults to `"rent"` if omitted.

For `kind: "viewing"`, `viewingDate` (YYYY-MM-DD), `viewingTime` (`HH:MM`), and optional `note` are accepted.

Uniqueness is `(propertyId, tenantEmail, kind)` so a tenant can have both a viewing and a rent request on the same listing.

**Response** `201`
```json
{
  "id": 4,
  "propertyId": 3,
  "tenantEmail": "jane@example.com",
  "tenantName": "Jane Doe",
  "landlord": "Ly Vannak",
  "kind": "viewing",
  "status": "pending",
  "requestedDate": "2026-08-08",
  "viewingDate": "2026-08-22",
  "viewingTime": "10:00",
  "note": "Prefer late morning"
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

Accepting `kind: "rent"` (or a request with no `kind`) should create an active contract stub if one does not already exist for that property + tenant. Accepting `kind: "viewing"` only updates status — do **not** create a contract.

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

---

## Frontend mock extensions (Agent 2)

These shapes are used by the frontend mock layer and should be mirrored by a real backend when ready. Existing GET contracts above are unchanged.

### POST /api/payments/mark-paid

**Auth:** tenant

**Body**
```json
{ "amount": 900, "month": "August 2026", "date": "2026-08-10" }
```

All fields optional; mock defaults from current rental / today.

**Response** `200` — full tenant payments payload (same as `GET /api/payments?role=tenant`) with the new history row prepended.

### POST /api/contracts

**Auth:** landlord

**Body**
```json
{
  "propertyId": 1,
  "tenant": "Ratana Chea",
  "rent": 450,
  "deposit": 900,
  "startDate": "2026-08-01",
  "endDate": "2027-07-31",
  "status": "active"
}
```

**Response** `200` — created Contract object.

Note: Accepting a **rent** request (`PATCH /api/requests/:id` with `{ "status": "accepted" }`) also creates an active contract stub in the mock store when one does not already exist for that property + tenant. Accepting a **viewing** request does not create a contract.

### PATCH /api/admin/landlords/:id

**Auth:** admin

**Body**
```json
{ "status": "active" }
```

`status` is one of `active` | `pending` | `suspended`.

**Response** `200` — updated landlord object.

### PUT /api/properties/:id (availability)

Admin UI toggles availability via existing `updateProperty` with `{ "available": true|false }`.

---

## Messages (mock)

Thread uniqueness is `(propertyId, tenantEmail)`.

### GET /api/messages

**Auth:** tenant or landlord

**Response** `200` — array of Thread objects for the current user

```json
{
  "id": 1,
  "propertyId": 1,
  "tenantEmail": "jane@example.com",
  "tenantName": "Jane Doe",
  "landlord": "Sok Dara",
  "messages": [
    {
      "id": 1,
      "fromEmail": "jane@example.com",
      "fromRole": "tenant",
      "text": "Is this still available?",
      "createdAt": "2026-08-10T09:12:00.000Z"
    }
  ]
}
```

### POST /api/messages

**Auth:** tenant or landlord

**Body**
```json
{
  "propertyId": 1,
  "tenantEmail": "jane@example.com",
  "text": "Hi, can I schedule a viewing?"
}
```

`tenantEmail` is required when a landlord starts or replies to a thread. Tenants default to their own email.

**Response** `200` — updated Thread

---

## Reviews (mock)

`rating` and `reviews` on Property are computed from stored reviews.

### GET /api/reviews?propertyId=1

**Response** `200` — array of Review objects

```json
{
  "id": 1,
  "propertyId": 1,
  "tenantEmail": "linda.k@example.com",
  "tenantName": "Linda K.",
  "rating": 5,
  "comment": "Bright and quiet.",
  "createdAt": "2026-06-12"
}
```

### POST /api/reviews

**Auth:** tenant with an accepted **rent** request (or current rental) for that property. One review per tenant per property.

**Body**
```json
{ "propertyId": 1, "rating": 5, "comment": "Great stay." }
```

**Response** `201` — created Review

---

## Saved searches / alerts (mock, in-app only)

### GET /api/saved-searches

**Auth:** tenant

**Response** `200` — array of saved searches

```json
{
  "id": 1,
  "filters": { "city": "Phnom Penh", "type": "Apartment", "maxPrice": "800" },
  "createdAt": "2026-08-19T02:00:00.000Z",
  "lastSeenMaxId": 6
}
```

### POST /api/saved-searches

**Auth:** tenant

**Body** — `{ "filters": { ... } }`

**Response** `201` — created saved search

### DELETE /api/saved-searches/:id

**Auth:** tenant

**Response** `204`

New matching listings (`id > lastSeenMaxId`) appear as in-app alerts. Marking a search seen updates `lastSeenMaxId`.

---

## Settings (mock)

Stored per logged-in email in `localStorage` (`prs-settings`).

### GET /api/settings

**Auth:** required

**Response** `200`

```json
{
  "phone": "+855 12 000 000",
  "telegram": "@username",
  "notifyListings": true,
  "notifyRequests": true,
  "notifyPayments": true,
  "preferredContact": "telegram"
}
```

`preferredContact` is one of `telegram` | `whatsapp` | `phone` | `email`.

### PUT /api/settings

**Auth:** required

**Body** — same fields as GET (partial updates merge)

**Response** `200` — saved settings

### PATCH /api/auth/profile

**Auth:** required

**Body** — `{ "name": "Updated Name" }`

**Response** `200` — updated session `{ user, token }`

### POST /api/auth/password

**Auth:** required

**Body** — `{ "currentPassword": "...", "newPassword": "secret1" }`

Mock mode does not verify the current password. New password must be at least 6 characters.

**Response** `200` — `{ "ok": true }`
