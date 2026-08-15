# PRS — Production Next Steps

Status after Agents 1 (UI) + 2 (Features): **frontend demo is end-to-end on mock data**. Real production still needs your backend friend + a short checklist from you.

---

## What works now (demo script)

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

### 1. Tenant (Customer)

1. Login with any email/password, role **Tenant**
2. Browse Listings → open a property → **Save** → **Request to Rent**
3. Dashboard → Requests / Saved Homes (live)
4. Payments → **Pay via ABA QR** → **Mark as paid** → history updates

### 2. Landlord

1. Register/login as Landlord with name exactly `Sok Dara` to see seed listings, **or** use **Add Listing** (always shows via `landlordOwned`)
2. Requests → **Accept** / **Decline** (Accept creates a contract stub)
3. Contracts → **New Contract** (modal) → list refreshes
4. Listings → Add / Edit / Delete

### 3. Admin

1. Login role **Admin**
2. Landlords → **Approve** / **Suspend** (e.g. Pich Rathanak starts pending)
3. Properties → **Mark rented** / **Mark available**
4. Sidebar promo shows pending landlord count after you navigate

### Shared UX

- Role badge on every dashboard
- Settings / Help / Search / Bell → toast “Coming soon” (not silent dead buttons)

---

## What YOU should do next this week (ordered)

1. **Smoke the demo script above** on your machine. If data looks weird, clear site localStorage for localhost:5173 and retry.
2. **Commit all local changes** to git (do not push until you have a GitHub repo ready).
3. **Share with your backend friend:**
   - Repo (or zip) of this project
   - [`API_CONTRACT.md`](./API_CONTRACT.md) including “Frontend mock extensions (Agent 2)”
   - [`HANDOFF.md`](./HANDOFF.md)
   - This file
4. **Agree stack + deadline** with friend (Node/Express, Nest, Laravel, etc. — any REST that matches the contract).
5. **Create a GitHub repo** and push when ready so you both work from one remote.
6. When friend’s API has auth + CORS: copy `frontend/.env.example` → `.env`, set:
   ```
   VITE_USE_MOCK=false
   VITE_API_URL=http://localhost:5000
   ```
7. **Remove or hide the Login role picker** once real login returns role from the database (security).

---

## What your BACKEND FRIEND must implement

| Priority | Area | Endpoints / rules |
|----------|------|-------------------|
| P0 | Auth | `POST /api/auth/register`, `/login`, `/logout`, `GET /me` — JWT or sessions; **bcrypt passwords**; role from DB only |
| P0 | Properties | CRUD + ownership checks; `available` toggle |
| P0 | Requests | create / mine / **inbox filtered by landlord** / PATCH status; on `accepted` create contract if missing |
| P0 | Contracts + rental | `GET/POST /api/contracts`, `GET /api/rentals/current` |
| P1 | Payments | `GET /api/payments?role=`; `POST /api/payments/mark-paid` (later: ABA Payway webhook) |
| P1 | Admin | `GET` landlords/tenants; `PATCH /api/admin/landlords/:id` `{ status }` |
| P0 | CORS | Allow `http://localhost:5173` + `Authorization` + `Content-Type` |

Frontend already switches via `VITE_USE_MOCK` in `frontend/src/api/*.js`.

---

## Production readiness gaps (honest)

| Gap | Today | Needed for production |
|-----|--------|------------------------|
| Backend / DB | None — localStorage mock | Real API + PostgreSQL/MySQL |
| Auth security | Fake token; password ignored; anyone can pick Admin | JWT + hashed passwords; no client role override |
| Payments | Placeholder QR + mock history | ABA Payway (or similar) + webhooks |
| Images | URL / Unsplash paste | Upload to S3/Cloudinary |
| Email | None | Verify email, rent reminders |
| Landlord inbox | Mock returns all requests | Filter by landlord ownership |
| Tests / CI | Lint + build only | Auth + request + payment tests; GitHub Actions |
| Deploy | Local Vite only | Frontend (Vercel/Netlify) + API host |

---

## Demo tip — landlord seed listings

Login name must match listing `landlord` field (e.g. `Sok Dara`), or create a new listing after login. Email-only login uses the email local-part as name, which often **won’t** match seed landlords.

---

## Definition of “production-like frontend” (current)

- Three roles usable end-to-end in mock mode
- Primary CTAs persist and show toasts
- API seam ready for friend’s backend

**Not yet production:** security, real money, hosting, multi-user server DB.
