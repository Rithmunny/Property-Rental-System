# Backend Handoff Notes

For the developer implementing the PRS backend.

## What exists today

- **Frontend only** — React + Vite + Tailwind in `frontend/`
- **All screens built** — public site + tenant / landlord / admin dashboards
- **API seam ready** — `frontend/src/api/` abstracts all data access

## Switching from mock to real API

1. Copy `frontend/.env.example` → `frontend/.env`
2. Set `VITE_USE_MOCK=false`
3. Set `VITE_API_URL=http://localhost:5000` (or your server)
4. Implement endpoints in [API_CONTRACT.md](./API_CONTRACT.md)
5. Enable CORS for the Vite dev server origin

No React page rewrites needed if response shapes match the contract.

## Screen → API mapping

| UI screen | API module | Endpoints |
|-----------|------------|-----------|
| Login / Register | `api/auth.js` | `/api/auth/*` |
| Listings, Property detail, Landlord listings CRUD | `api/properties.js` | `/api/properties/*` |
| Request to Rent, Tenant Requests, Landlord Requests | `api/requests.js` | `/api/requests/*` |
| Save heart, Tenant Saved Homes | `api/saved.js` | `/api/saved/*` |
| Tenant My Rental, Landlord Contracts | `api/rentals.js` | `/api/rentals/current`, `/api/contracts` |
| Tenant/Landlord/Admin Payments | `api/payments.js` | `/api/payments?role=` |
| Admin Landlords / Tenants | `api/users.js` | `/api/admin/landlords`, `/api/admin/tenants` |

## Mock seed data

Initial demo data is in `frontend/src/data/`:

- `properties.js` — listing catalog
- `tenant.js` — sample requests, rental, payments
- `landlord.js` — contracts, tenants, payment reminders
- `admin.js` — landlord registry

Mock store (`api/mockStore.js`) loads these into localStorage on first use.

## Auth expectations

- Frontend stores `{ user, token }` in localStorage key `prs-session`
- Protected routes use `RequireRole` — checks `user.role`
- Login form still has a role picker **only in mock mode**; real login should return role from DB
- Register allows `tenant` or `landlord` only

## Do not change without syncing

- JSON field names in API_CONTRACT.md
- Route paths in `frontend/src/App.jsx`
- Context provider shapes in `frontend/src/context/`

If you add fields or change shapes, update both the contract and the corresponding `api/*.js` HTTP adapter.

## Suggested backend stack

Any stack works. Suggested minimum:

- REST API with JWT or session cookies
- PostgreSQL or MySQL for users, properties, requests, contracts, payments
- Role column on users: `tenant` | `landlord` | `admin`

## Testing the integration

1. Start backend on port 5000
2. Set `VITE_USE_MOCK=false` in frontend `.env`
3. Run `npm run dev` in `frontend/`
4. Walk through: register → browse → request → landlord accept → tenant sees updated status

## Questions?

See [README.md](./README.md) for run instructions and [API_CONTRACT.md](./API_CONTRACT.md) for full endpoint specs.
