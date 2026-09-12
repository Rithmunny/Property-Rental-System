# Property Rental System (PRS)

A web app for browsing rental homes and managing them as a **tenant**, **landlord**, or **admin**.

The React frontend talks to an Express + PostgreSQL API in `backend/`. Mock mode (`VITE_USE_MOCK=true`) still works for frontend-only demos.

## Run it

You need Node.js 18+ and Docker (for PostgreSQL). The database is published on host port **5433** so it does not clash with a local Postgres on 5432.

```bash
# 1. Start Postgres
docker compose up -d

# 2. API
cd backend
copy .env.example .env   # Windows; on macOS/Linux: cp .env.example .env
npm install
npx prisma migrate dev --name init
npx prisma db seed
npm run dev              # http://localhost:5000

# 3. Frontend (separate terminal)
cd frontend
copy .env.example .env   # set VITE_USE_MOCK=false to use the API
npm install
npm run dev              # http://localhost:5173
```

Open http://localhost:5173

## Demo accounts

Password for seeded tenant and landlord users: `password123`

| Role | Email | Dashboard |
|------|-------|-----------|
| Tenant | `demo@tenant.com` | `/dashboard/tenant` |
| Landlord | `sokdara@prs.demo` | `/dashboard/landlord` |
| Super Admin | `rithmunnysopheak@gmail.com` | `/dashboard/admin` |

Super Admin password: `super-admin1234`. This is the only admin account.

Other landlords: `chan.sopheak@prs.demo`, `ly.vannak@prs.demo`, `kim.sreymom@prs.demo`, `heng.bopha@prs.demo`, `pich.rathanak@prs.demo` (pending). On the live API, login uses the account’s stored role (the role dropdown is ignored).

Frontend-only mock: set `VITE_USE_MOCK=true`. Any email/password works; pick a role on the login form.

## What is done

### Public site
- Home page with search by property type and city
- Rent listings with filters (city, area, type, beds, furnished, price), sort, and a map view
- Property detail with photos, amenities, contact links, reviews, save-to-favorites, and rent / viewing requests
- Discover and About pages
- Login and register (tenant or landlord)

### Tenant dashboard
- Overview, current rental, payments (including invoice print)
- Viewing/rent requests, messages, saved homes, and search alerts
- Account settings

### Landlord dashboard
- Overview, listings CRUD, incoming requests, contracts, tenants
- Messages, payments, and a rent sheet
- Add/edit listing form grouped into sections: Property, Location, Space, Rent & terms, Photos, Description, Contact
- Account settings

### Admin dashboard
- Overview with landlord, tenant, property, and payment stats
- Manage landlords, tenants, and properties
- Payments overview and settings

### App foundation
- Role-based routes and layouts
- Shared UI (buttons, dialogs, forms) with a common theme
- REST API in `backend/` (`VITE_USE_MOCK=false`)

### Review 2 — reliability, sandbox payments, recommendations
- Request-to-rent workflow is race-safe: one active contract per property is enforced by a database unique index, acceptance runs in a transaction, duplicate requests collapse into one row, and unavailable listings refuse rent requests
- 53 API tests in `backend/tests/` (run with `npm test` in `backend/`, uses a local `prs_test` database on port 5433)
- Sandbox ABA-style checkout for tenants (`PAYMENT_GATEWAY=sandbox`): pending payment, simulated gateway confirm, receipt, no card data stored
- "Recommended for you" on the tenant dashboard: content-based scoring over saved homes, requests and contracts, with explainable reasons

## Stack

Frontend: React, Vite, Tailwind CSS, React Router, Leaflet (map), jsPDF (invoices).

Backend: Node.js, Express, PostgreSQL, Prisma, JWT auth. Payments are ABA/cash rows with an optional sandbox checkout (`PAYMENT_GATEWAY=sandbox`, no real gateway yet, no card data stored). Property photos are URL strings.
