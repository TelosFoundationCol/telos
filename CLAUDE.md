# CLAUDE.md — context for Claude Code sessions

This file is the durable handoff between Claude Code sessions working on this repo. Read it first.

## What this is

Telos is a transparency-first foundation platform. Donors transfer money manually, upload proof, Telos validates within 24–48h, then disburses to vetted agencies that deliver services to small informal businesses in Colombia. Every transaction is in a public ledger. See `README.md` for the elevator pitch.

## Phase-1 invariants (do NOT undo these without asking)

- **No payment gateway.** Donations are manual bank/USDC transfers + uploaded proof. No Stripe/Wompi/etc.
- **No tax-deduction certificates.** Telos does not yet have a US 501(c)(3) fiscal sponsor or DIAN special-regime status. Do not write copy claiming receipts are tax-deductible.
- **No fee.** 100% of donations go to services. Telos's operating costs are a separate stream (operations-earmarked donations + grants). Never add a percentage cut to the donation flow.
- **No required signup.** Donors give email at proof upload — that email IS the implicit account. Sign in is passwordless via magic link (15-min TTL).
- **Anonymous donation toggle.** When checked, the public ledger shows "Anónimo · País", but Telos still has the email for notification.
- **Open RFP, not hand-pick.** When a business is approved, every vetted agency in the relevant category gets emailed. Anyone in those categories can submit a proposal. The business picks. Don't reintroduce a "Telos invites 2-3 agencies" model — user explicitly rejected it.
- **Don't ask businesses for RUT or financials.** Target audience is informal businesses; if they had RUT they wouldn't need Telos. Agencies, on the other hand, DO get vetted with RUT + cámara + references — that asymmetry is intentional.
- **Verification of informal businesses:** physical visit by Telos + optional YouTube video URL provided by the postulante + community upvotes. Not paperwork.

## Stack

- Next.js 16 (App Router) + React 19
- TypeScript strict
- Tailwind CSS v4 (theme in `src/app/globals.css` `@theme` block; no `tailwind.config.ts`)
- Drizzle ORM + Neon Postgres (serverless)
- Cloudflare R2 for file storage (via aws-sdk/s3)
- Resend + react-email for transactional email
- Cloudflare Turnstile for CAPTCHA
- `jose` for JWT signing (passwordless magic-link auth)
- `zod` for input validation

## Where things live

- DB schema: `src/lib/db/schema.ts`. Generate migration with `npm run db:generate`. Use `npm run db:push` during early dev, `npm run db:migrate` for prod.
- i18n: `src/lib/i18n/dictionaries.ts` — ES is default, EN is the secondary toggle. Add keys to BOTH. Server Components read lang from `getT()` (`src/lib/i18n/server.ts`); client uses `useT()` from `context.tsx`.
- Auth: magic links in `src/lib/auth/magic-link.ts`. Session JWTs in `src/lib/auth/session.ts`. Role gates in `src/lib/auth/rbac.ts`. Edge middleware at `src/middleware.ts` re-implements verify with jose-only (no DB import) since middleware runs on Edge.
- Storage: `src/lib/storage/r2.ts` — produces presigned PUT URLs. Browser uploads direct to R2; we never stream files through serverless.
- Email: `src/lib/email/send.ts` for the typed senders. Templates in `src/lib/email/templates/`. Render with `@react-email/render`.
- Rate limiting: `src/lib/rate-limit.ts` — cheap DB-backed sliding-window. If volume grows, swap to Upstash Redis.
- Public data access: `src/lib/data/queries.ts` — all read queries used by Server Components. Errors are logged + fall back to empty arrays so the site doesn't crash during early setup.

## Conventions

- Dictionaries: ES default, EN toggle. Keys are dotted (`don.up.email`). Always add to both languages.
- DB amounts: stored as cents (`bigint`). For COP that's just `peso * 100`. Format with `fmtCop` / `fmtUsd` / `fmtMoney` from `src/lib/utils.ts`.
- Localized fields use the `*Es` / `*En` convention (e.g. `storyEs`, `storyEn`). Read with `pickLocalized(row, "story", lang)`.
- Server Components: prefer fetching with `lib/data/queries.ts`. Client Components: fetch via `/api/*` endpoints (don't import the DB into "use client" code).
- Server actions are not used yet (we use route handlers). If you add server actions, keep them in `app/.../actions.ts` files and run them through the same zod schemas.

## Things deliberately stubbed (good follow-ups)

- Disbursement creation flow (Telos → agency payment). Schema exists (`disbursements` table) but no UI yet.
- Agency deliverable upload (R2 helper `deliverableKey` exists, no UI).
- Agency self-application form (only Telos can create agency records right now via direct DB insert / future admin form).
- Real bank reconciliation. Admin marks donations confirmed manually.
- Cron job to auto-close RFPs at deadline. Right now `rfp.status` stays `open` past the deadline until Telos changes it — easy follow-up: a daily cron route at `/api/cron/close-rfps`.

## Don't

- Don't import the DB or any node-only libs in `middleware.ts` (Edge runtime).
- Don't add `dotenv/config` imports — Next.js loads `.env.local` automatically. `tsx` loads `.env` by default too.
- Don't promise tax-deductibility in any copy, email, or UI.
- Don't add password forms or required-signup gates.
- Don't ask a business postulado for RUT, cámara de comercio, or financial statements.

## Useful commands

```bash
npm run typecheck       # quick sanity
npm run lint
npm run db:push         # apply schema during dev
npm run db:seed         # load sample data
npm run email:dev       # preview email templates
```
