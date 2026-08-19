# PRS agent notes

Frontend-only rental app (React + Vite) in `frontend/`. Mock API is on by default.

## Look up files here

| Need | Path |
|------|------|
| Routes | `frontend/src/App.jsx` |
| Providers | `frontend/src/app/providers.jsx` |
| Public pages | `frontend/src/pages/*.jsx` (`DashboardRedirect.jsx` sends users to their role) |
| Tenant screens | `frontend/src/pages/dashboard/tenant/Tenant*.jsx` |
| Landlord screens | `frontend/src/pages/dashboard/landlord/Landlord*.jsx` |
| Admin screens | `frontend/src/pages/dashboard/admin/Admin*.jsx` |
| API seam | `frontend/src/api/` |
| Shared UI | `frontend/src/components/common/` |
| Dashboard widgets | `frontend/src/components/dashboard/` |

Organize / tidy the tree with the `organize-code` skill. Full map: `.cursor/skills/organize-code/STRUCTURE.md`.

## Do not break

- JSON field names in `API_CONTRACT.md`
- Route paths in `frontend/src/App.jsx`
- `localStorage` keys in `frontend/src/api/config.js`
