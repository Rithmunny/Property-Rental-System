# PRS lookup map

Where to open a file. Paths are under `frontend/src/`.

## App shell

| Look for | Open |
|----------|------|
| Route table | `App.jsx` |
| Context wrapping | `app/providers.jsx` |
| Vite entry | `main.jsx` |
| Role gate | `components/common/RequireRole.jsx` |

## Public screens

| Screen | File |
|--------|------|
| Home | `pages/Home.jsx` |
| Rent search | `pages/Rent.jsx` |
| Listing detail | `pages/PropertyDetail.jsx` |
| Discover areas | `pages/Discover.jsx` |
| About | `pages/About.jsx` |
| Login / Register | `pages/Login.jsx`, `pages/Register.jsx` |
| Role redirect | `pages/DashboardRedirect.jsx` |

## Tenant dashboard

Files in `pages/dashboard/tenant/`. Names start with `Tenant`.

| Screen | File |
|--------|------|
| Overview | `TenantOverview.jsx` |
| My rental | `TenantMyRental.jsx` |
| Payments | `TenantPayments.jsx` |
| Requests | `TenantRequests.jsx` |
| Messages | `TenantMessages.jsx` |
| Alerts | `TenantAlerts.jsx` |
| Saved homes | `TenantSavedHomes.jsx` |
| Layout | `TenantLayout.jsx` |

Settings is shared: `pages/dashboard/Settings.jsx`.

## Landlord dashboard

Files in `pages/dashboard/landlord/`. Names start with `Landlord`.

| Screen | File |
|--------|------|
| Overview | `LandlordOverview.jsx` |
| Listings | `LandlordListings.jsx` |
| Contracts | `LandlordContracts.jsx` |
| Requests | `LandlordRequests.jsx` |
| Messages | `LandlordMessages.jsx` |
| Payments | `LandlordPayments.jsx` |
| Sheet | `LandlordSheet.jsx` |
| Tenants | `LandlordTenants.jsx` |
| Layout | `LandlordLayout.jsx` |

## Admin dashboard

Files in `pages/dashboard/admin/`. Names start with `Admin`.

## API (backend seam)

| Domain | File |
|--------|------|
| Auth | `api/auth.js` |
| Properties | `api/properties.js` |
| Requests | `api/requests.js` |
| Saved homes | `api/saved.js` |
| Saved searches | `api/savedSearches.js` |
| Rentals / contracts | `api/rentals.js` |
| Payments | `api/payments.js` |
| Users (admin) | `api/users.js` |
| Messages | `api/messages.js` |
| Reviews | `api/reviews.js` |
| Settings | `api/settings.js` |
| HTTP helper | `api/client.js` |
| Mock localStorage | `api/mockStore.js` |
| Env flags | `api/config.js` |

## Data vs utils

- `data/` — seed arrays and marketing copy
- `utils/listing.js` — listing filters, coords, labels
- `utils/dashboard.js` — role paths, landlord ownership
- `utils/documents.js` — invoice/print/CSV helpers
