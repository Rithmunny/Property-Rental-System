# Property Rental System (PRS)

A web app for browsing rental homes and managing them as a **tenant**, **landlord**, or **admin**.

The frontend is built and runnable today. Data lives in the browser (mock API + `localStorage`) so you can demo every role without a backend.

## What is done

### Public site
- Home page with search by property type and city
- Rent listings with filters (city, area, type, beds, furnished, price), sort, and a map view
- Property detail with photos, amenities, contact links, reviews, save-to-favorites, and rent / viewing requests
- Discover and About pages
- Login and register (pick a role; any email/password works in mock mode)

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
- API modules ready to point at a real server (`VITE_USE_MOCK=false`)

## Run it

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

Copy `frontend/.env.example` to `frontend/.env` if you need to change the API URL. Mock mode is on by default (`VITE_USE_MOCK=true`).

## Try the roles

On Login, use any email and password, then choose a role:

| Role | Dashboard |
|------|-----------|
| Tenant | `/dashboard/tenant` |
| Landlord | `/dashboard/landlord` |
| Admin | `/dashboard/admin` |

## Stack

React, Vite, Tailwind CSS, React Router, Leaflet (map), jsPDF (invoices). No backend is required for the current demo.

## Not done yet

A real backend (auth, database, payments) is not connected. The app is set up to switch off mock mode and call `VITE_API_URL` when that work starts.
