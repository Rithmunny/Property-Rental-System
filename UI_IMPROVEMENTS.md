# PRS UI Improvements Spec

Prioritized from read-only audit of `frontend/src`. Implementation scope: **P0 + P1** (P2 deferred).

---

## P0 — Must fix (demo consistency)

| ID | Problem | Files | Fix | Effort |
|----|---------|-------|-----|--------|
| P0-01 | PropertyCard heart uses local state | `components/common/PropertyCard.jsx` | Wire `useSaved()` + `useAuth()`; login redirect for guests; stop propagation | S |
| P0-02 | Tenant Overview static saved IDs | `pages/dashboard/tenant/Overview.jsx` | Use `useSaved()` | S |
| P0-03 | Tenant Overview static requests | `pages/dashboard/tenant/Overview.jsx` | Use `useRequests()` | S |
| P0-04 | Tenant Overview static rental/payments | `pages/dashboard/tenant/Overview.jsx` | Fetch via `api/rentals` + `api/payments` | M |
| P0-05 | Landlord Overview static data | `pages/dashboard/landlord/Overview.jsx` | Fetch via `api/rentals` + `api/payments` | M |
| P0-06 | Admin Overview static users | `pages/dashboard/admin/Overview.jsx` | Fetch via `api/users` + `api/payments` | M |
| P0-07 | Landlord Tenants static | `pages/dashboard/landlord/Tenants.jsx` | Use `api/payments` landlord tenants | M |
| P0-08 | Admin Payments static | `pages/dashboard/admin/Payments.jsx` | Use `api/payments` admin role | M |
| P0-09 | Admin Properties static landlord count | `pages/dashboard/admin/Properties.jsx` | Use `api/users.listLandlords()` | S |
| P0-11 | Navbar "Contact us" → register | `components/layout/Navbar.jsx` | Rename to "Sign up" | S |
| P0-12 | Ticker says BOOKING | `components/layout/Navbar.jsx` | Rental copy | S |
| P0-13 | Home sends `Any`, Listings expects `All` | `pages/Home.jsx`, `pages/Listings.jsx` | Normalize `Any` → `All` in Listings | S |
| P0-16 | Tenant Overview saved empty state | `pages/dashboard/tenant/Overview.jsx` | Add empty message + link | S |
| P0-17 | Tenant Overview missing rental fallback | `pages/dashboard/tenant/Overview.jsx` | Show empty state when no rental | S |

---

## P1 — Presentation polish

| ID | Problem | Files | Fix | Effort |
|----|---------|-------|-----|--------|
| P1-01 | "All Stays" title | `pages/Listings.jsx` | Rename to "Available Rentals" | S |
| P1-08 | Plain text loading | Listings + dashboard pages | Add `SkeletonCard`, `SkeletonRow` components | M |
| P1-09 | Listings error no retry | `pages/Listings.jsx` | Add retry via `refresh()` | S |
| P1-10 | Listings empty no clear filters | `pages/Listings.jsx` | Add clear filters button | S |
| P1-15 | 2-col grid on mobile | `pages/Listings.jsx` | `grid-cols-1 sm:grid-cols-2` | S |
| P1-21 | Heart color rose vs forest | `PropertyCard.jsx` | Use forest fill when saved | S |
| P1-22 | Overview pages no loading | Overview pages | Skeleton while fetching | M |
| P1-03 | About page dev copy | `pages/About.jsx` | User-facing copy + "How it works" 3 steps | S |
| P1-05 | CTA label inconsistency | Navbar (done in P0-11) | Standardize "Sign up" | S |
| — | Toast for save/request | `PropertyDetail.jsx`, `PropertyCard.jsx` | Add `ToastContext` | M |
| — | 404 button shape | `pages/NotFound.jsx` | `rounded-full` | S |

---

## P2 — Deferred

Non-functional dashboard buttons, URL filter sync, map view, image gallery, KHR toggle, dark mode.

---

## Implementation order

1. ToastContext + Skeleton components (foundation)
2. P0 data wiring (PropertyCard → Overviews → static pages)
3. P0 copy (Navbar, Home/Listings filter)
4. P1 polish (loading, empty states, About, NotFound, Listings grid)
