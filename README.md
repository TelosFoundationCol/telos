# Telos

Transparency-first foundation channeling donations to professional services for small businesses in Colombia.

**Model.** Donors transfer money → upload proof → Telos validates → 100% goes to vetted agencies that deliver services (marketing, tech, accounting, legal, export) to small informal businesses. Every peso is traceable in a public ledger.

**Phase 1 is intentional about NOT having:**

- No payment gateway. Donations are manual bank transfers + uploaded proof → manually validated by Telos within 24–48h.
- No tax-deduction certificates yet (fiscal sponsor + DIAN special regime not set up).
- No fee. 100% of every donation goes to services. Telos's operating costs are funded by a separate stream.

**The matching model is open RFP, not hand-picked.** When Telos approves a nominated business, it emails every vetted agency in the relevant category. Anyone can submit a proposal. The business picks (with Telos's help if needed).

## Tech stack

| Layer       | Service                                                   | Free tier               |
| ----------- | --------------------------------------------------------- | ----------------------- |
| App + API   | **Next.js 16** on **Vercel**                              | 100 GB bandwidth        |
| Database    | **Neon Postgres** (serverless)                            | 0.5 GB, 191 compute hrs |
| File store  | **Cloudflare R2** (S3-compatible, **zero egress**)         | 10 GB, 1M reads         |
| Email       | **Resend** + react-email templates                        | 100/day, 3K/mo          |
| CAPTCHA     | **Cloudflare Turnstile**                                  | unlimited               |
| Auth        | Roll-your-own passwordless magic links (jose-signed JWT)  | free                    |

Everything is free at MVP scale. See `docs/ACCOUNT_SETUP.md` for the per-service setup walkthrough.

## Quick start

```bash
# Prerequisites: Node 20+, accounts created (see docs/ACCOUNT_SETUP.md)

# 1. Install
npm install --legacy-peer-deps

# 2. Copy env and fill in values
cp .env.example .env.local
# Edit .env.local with your Neon / R2 / Resend / Turnstile keys

# 3. Apply schema to your Neon database
npm run db:push

# 4. Seed with sample data
npm run db:seed

# 5. Run dev
npm run dev
# → http://localhost:3000
```

Sign in as admin: hit any "Portal" link → enter the email you set in `ADMIN_EMAILS` → check inbox for magic link.

## Project layout

```
src/
├── app/
│   ├── (public)/           # Public pages (home, transparencia, etc.)
│   ├── portal/             # Auth-gated portals (donor, agency)
│   ├── admin/              # Admin panel (admin role only)
│   ├── auth/               # Magic-link request + verify
│   ├── api/                # Route handlers
│   └── layout.tsx          # Root layout (i18n provider, fonts)
├── components/             # Shared React components
├── lib/
│   ├── auth/               # Magic-link tokens, JWT session, RBAC
│   ├── db/                 # Drizzle schema, migrate, seed
│   ├── email/              # Resend client + react-email templates
│   ├── i18n/               # ES/EN dictionaries + context
│   ├── storage/            # Cloudflare R2 (signed PUT/GET URLs)
│   ├── data/queries.ts     # Server Component data access
│   ├── env.ts              # Typed env access
│   ├── rate-limit.ts       # DB-backed rate limiter
│   ├── turnstile.ts        # Server-side CAPTCHA verify
│   └── utils.ts
├── middleware.ts           # Gates /portal/* and /admin
prototype/                  # Original HTML prototype (reference only)
drizzle/                    # Generated SQL migrations
```

## Scripts

- `npm run dev` — local dev server
- `npm run typecheck` — TypeScript only
- `npm run lint` — ESLint
- `npm run build` — production build
- `npm run db:generate` — generate SQL from schema changes
- `npm run db:push` — apply schema directly (use during early dev)
- `npm run db:migrate` — apply generated migrations (use in production)
- `npm run db:seed` — load sample data (overwrites everything in dev DB)
- `npm run db:studio` — open Drizzle Studio (DB browser)
- `npm run email:dev` — preview email templates at http://localhost:3001

## How the flows work

**Donation:** [/donar](src/app/(public)/donar/page.tsx) — 4-step client flow:

1. Amount + currency
2. Destination (general / specific business / category)
3. Transfer instructions with reference code (Bancolombia / Nequi / USDC / wire)
4. Upload PDF/screenshot proof → `POST /api/donations`

Backend: presigned PUT URL to R2 (`/api/upload/presign`), file uploaded direct from browser, then `/api/donations` creates a `donations` row with `status='pending_proof'`. Telos admin marks confirmed in `/admin`, which appends to `ledger` and emails the donor.

**Postulating a business:** [/postular](src/app/(public)/postular/page.tsx) — Anyone (owner, friend, customer) submits with name, city, address (private), category, story, need, optional YouTube URL. We do NOT ask for RUT or financials — informal businesses are the target. Protected by Turnstile + honeypot + per-IP rate limit.

**Voting:** localStorage cooldown for UX, Turnstile + per-IP-per-day uniqueness for security (`postulado_votes` unique index on `(postulado_id, ip_hash, vote_day)`).

**Open RFP:** When admin approves a postulado, it's promoted to a `business`, an `rfp` opens for 7 days with the relevant categories, and all vetted agencies in those categories get emailed. Any of them can `POST /api/rfps/:id/proposals`. Admin awards via `/api/rfps/:id/award`.

## Architecture decisions

See `docs/ARCHITECTURE.md` for the why-not-X reasoning on payment gateway, tax certificates, RFP-not-hand-pick, anti-abuse layers, etc.

## License

Private (for now). Going public at launch.
