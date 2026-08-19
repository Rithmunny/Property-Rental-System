---
name: organize-code
description: Checks and reorganizes the Property Rental System (PRS) frontend so files are easy to look up. Use when the user asks to organize, clean up, tidy, restructure, find messy code, or make the codebase easier to navigate.
---

# Organize PRS code

Audit and fix frontend structure without changing product behavior.

## Target layout

```
frontend/src/
  app/              # providers only
  api/              # one module per domain; mock vs HTTP lives here
  components/
    common/         # reused on public + dashboard
    layout/         # Navbar, Footer, PublicLayout, AuthLayout
    dashboard/      # dashboard chrome and widgets
    documents/      # invoices / print
    rent/           # Rent page map/search UI
  context/          # React providers + hooks
  data/             # seed + static content (not API logic)
  hooks/
  pages/
    *.jsx           # public screens (unique names)
    dashboard/
      tenant/       # TenantOverview.jsx, TenantPayments.jsx, ...
      landlord/     # LandlordOverview.jsx, ...
      admin/        # AdminOverview.jsx, ...
  utils/
```

Full lookup map: [STRUCTURE.md](STRUCTURE.md)

## Workflow

Copy and track:

```
Organize:
- [ ] Inventory duplicates, deep imports, oversized files, misplaced UI
- [ ] Report the plan (files to rename/move/split)
- [ ] Apply structural moves only — no feature rewrites
- [ ] Update imports, barrels, README/AGENTS.md
- [ ] Run frontend lint + build
```

### 1. Check

Run from repo root:

```bash
node .cursor/skills/organize-code/scripts/check-structure.mjs
```

Also search for:

- Duplicate filenames (`Overview.jsx`, `Payments.jsx`, `Messages.jsx`)
- Imports with `../../../`
- Components used outside their folder (e.g. dashboard icon on a public page)
- Files over ~350 lines that mix filters, layout, and data
- Missing barrel `index.js` in `api`, `context`, `utils`, component groups

### 2. Organize (allowed)

- Rename dashboard pages so the filename matches the export (`TenantOverview.jsx`)
- Move misplaced components to the folder that matches usage
- Extract `app/providers.jsx` and `components/layout/PublicLayout.jsx`
- Keep barrels as lookup indexes; do not import a barrel from inside the same folder
- Prefer `@/` imports for anything outside the current folder
- Split a file only when it has two distinct jobs (e.g. page + filter form)

### 3. Do not

- Change routes, API shapes, or mock storage keys
- Merge visually different cards just because they look similar
- Convert the project to TypeScript
- Add `pages/Dashboard.jsx` (clashes with `pages/dashboard/` on Windows; use `DashboardRedirect.jsx`)
- Rewrite CSS class names or visual layout
- Re-export `mockStore` from `api/index.js` (internal to adapters)

## Import rules

```js
// Prefer
import { PageHeader, StatusPill } from '@/components/dashboard'
import { useAuth } from '@/context'
import * as paymentsApi from '@/api/payments'

// Avoid
import PageHeader from '../../../components/dashboard/PageHeader'
```

Same-folder imports may stay relative (`./RentMegaMenu`).

## After changes

1. `cd frontend && npm run lint`
2. `cd frontend && npm run build`
3. Update `README.md` project structure and `AGENTS.md` if folders changed
