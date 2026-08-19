# Property Rental System (PRS)

Frontend for a property rental platform connecting tenants, landlords, and admins.

## Quick start

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Environment variables

Copy `frontend/.env.example` to `frontend/.env`:

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:5000` | Backend base URL (used when mock is off) |
| `VITE_USE_MOCK` | `true` | Use localStorage mock adapters when `true` |

## Mock mode (current default)

With `VITE_USE_MOCK=true`, the app runs fully in the browser:

- Auth, properties, requests, saved homes, payments use localStorage + seed data
- No backend required for demo or frontend development

## Connecting the real backend

1. Implement endpoints in [API_CONTRACT.md](./API_CONTRACT.md)
2. Set `VITE_USE_MOCK=false` and `VITE_API_URL` to your server
3. Enable CORS on the backend for the frontend origin

## Demo roles

Log in with any email/password and pick a role:

| Role | Dashboard path |
|------|----------------|
| Tenant | `/dashboard/tenant` — requests, saved homes, payments |
| Landlord | `/dashboard/landlord` — listings CRUD, incoming requests, contracts |
| Admin | `/dashboard/admin` — landlords, tenants, properties overview |

## Project structure

```
frontend/src/
  app/            # AppProviders (context wrapping)
  api/            # One module per domain + mock adapters
  components/
    common/       # Shared UI (cards, logo, role gate)
    layout/       # Navbar, Footer, PublicLayout, AuthLayout
    dashboard/    # Dashboard chrome and widgets
    documents/    # Invoice / print
    rent/         # Rent map
  context/        # React providers
  data/           # Seed data + static copy
  hooks/
  pages/          # Public screens (Home, Rent, ...)
    dashboard/
      tenant/     # TenantOverview.jsx, TenantPayments.jsx, ...
      landlord/   # LandlordOverview.jsx, ...
      admin/      # AdminOverview.jsx, ...
  utils/
```

Quick lookup map: `AGENTS.md` and `.cursor/skills/organize-code/STRUCTURE.md`.

## Docs for backend developer

- [API_CONTRACT.md](./API_CONTRACT.md) — REST endpoints and JSON shapes
- [HANDOFF.md](./HANDOFF.md) — screen map and integration notes

## Scripts

```bash
npm run dev      # development server
npm run build    # production build
npm run preview  # preview production build
npm run lint     # oxlint
```
