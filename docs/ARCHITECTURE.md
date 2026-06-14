# Architecture

How Telos works under the hood. Every decision here is intentional; the why matters more than the what.

## 1. Data flow: a donation, end to end

```
┌─────────┐                  ┌──────────────────┐
│  Donor  │  1. fill flow    │  Next.js page    │
│ browser │─────────────────▶│   /donar         │
└─────────┘                  └──────────────────┘
     │                                │
     │                                │ 2. POST /api/upload/presign
     │                                ▼
     │                       ┌──────────────────┐
     │                       │  R2 (S3-compat)  │
     │   ◀─── presigned URL ─│  PUT signed URL  │
     │                       └──────────────────┘
     │ 3. PUT proof.pdf direct to R2
     ▼
┌─────────┐ 4. POST /api/donations { reference, key, ... } ┌──────────────────┐
│ Browser │─────────────────────────────────────────────▶ │  Next.js API     │
└─────────┘                                                │  /api/donations  │
                                                          └──────────────────┘
                                                                   │
                                  5. upsert user, insert donation  │
                                  6. queue confirmation email      │
                                  ▼                                ▼
                          ┌─────────────┐                  ┌──────────┐
                          │  Neon PG    │                  │  Resend  │
                          └─────────────┘                  └──────────┘

                                  ┌─────────────────────────┐
                                  │  Telos admin reviews    │  ↩
                                  │  /admin (donation row)  │
                                  └─────────────────────────┘
                                            │
                                            │ POST /api/admin/donations/:id/confirm
                                            ▼
                          ┌──────────────────────────────────┐
                          │  donations.status = 'confirmed'  │
                          │  ledger row inserted             │
                          │  donor gets confirmation email   │
                          └──────────────────────────────────┘
```

## 2. Trust model

The hardest part of this project isn't the code; it's earning trust without payment-rails magic. The design surfaces trust signals everywhere:

- **Public ledger:** Every confirmed donation is visible at `/transparencia` with donor name (or "Anónimo · País" if they toggled anonymous), amount, destination, and a stable reference hash.
- **Public RFPs:** Open RFPs appear on the Transparencia page **before** they close, so donors can see what's being matched and who's bidding.
- **Open RFP, not hand-pick:** When a business is approved, every vetted agency in the relevant category gets emailed. No back-channel invitations. Eliminates "why wasn't I invited?" friction with agencies and gives donors a verifiable competition story.
- **Asymmetric vetting:** Agencies prove they're real (cámara de comercio, RUT, references). Businesses don't (they're informal — that's the point). Telos vouches for informal businesses with physical visits + community upvotes + an optional video URL.

## 3. Why no payment gateway in phase 1

Pros of manual:

- Zero per-transaction fees during low volume. Stripe takes 4-5% on international + foreign exchange; PSE costs 4% + IVA. On a $100 donation that's $4–5 we'd rather give to a bakery.
- No KYC headaches before incorporation finalizes.
- Forces Telos to look at every transaction and stay close to the money. At 100/mo this is sustainable.

Cons:

- Manual reconciliation. Telos admin must check the bank, find the matching reference code (`TX-2026-XXXXXX`), click confirm. Builds the muscle but doesn't scale past ~500/mo.
- 24-48h delay before public visibility.

When to switch: when donor volume crosses the manual-validation pain threshold (≈ 50 confirmed/week) OR when we want recurring donations.

## 4. Why no tax-deduction certificates

Telos doesn't yet have:

- A US 501(c)(3) fiscal sponsor (would be needed for US-deductible).
- DIAN special-regime status (would be needed for Colombian-deductible).

We could promise these and figure it out later. We're not, because broken promises here are catastrophic for the trust brand. We say so explicitly in the FAQ.

When the legal stack exists, re-add the certificate language. Don't backfill it before then.

## 5. Why open RFP instead of hand-pick

Hand-pick (what we considered first):

- Telos approves a business → Telos picks 2-3 best-fit agencies → invites them to propose.
- Tight, fast, controllable.
- Problem: every uninvited agency in the category has a "why not me?" grievance. With 18 active agencies, picking 3 means 15 unhappy partners. Compounds over time.

Open RFP (what we shipped):

- Telos approves a business → emails EVERY vetted agency in the category → anyone can submit a proposal.
- The business picks. Slower (≈ 7 days) but ungameable.
- Side effect: agencies that bid and lose get to see what won (the public ledger publishes the awarded proposal). Forces honest pricing.

## 6. Anti-abuse stack

Four layers, each cheap, none sufficient alone:

| Layer                              | Where                                                          | Defends against                |
| ---------------------------------- | -------------------------------------------------------------- | ------------------------------ |
| **Cloudflare Turnstile**           | Postulate form, vote button                                    | Headless bots / scripted abuse |
| **Per-IP + per-day uniqueness**    | `postulado_votes` unique index on (postulado, ip_hash, day)    | Same-person multi-vote         |
| **Per-IP rate limit (DB-backed)** | `rateLimit()` in `src/lib/rate-limit.ts`                       | Burst spam from a single IP    |
| **Honeypot field**                 | Hidden `name="website"` input in postulate form                | Naive form bots                |

Per-IP isn't a real identity — mobile NAT shares IPs across thousands, café wifi pools many people behind one. But combined with Turnstile (which makes bot traffic expensive) and a unique daily index, the cost of casting many fake votes climbs to "not worth it."

## 7. Schema highlights

See `src/lib/db/schema.ts` for full detail. Key things to know:

- **All amounts in cents** (`bigint`). For COP that's just `peso * 100`. Avoids floating-point.
- **Localized fields are paired** (`storyEs` + `storyEn`, etc.). Read with `pickLocalized(row, "story", lang)`.
- **`postulados`** are the community-submitted nominations. When approved, a `business` row is created and the postulado's status flips to `funded`.
- **`businesses`** are the funded SMBs. Status: `in_rfp` → `matched` → `in_progress` → `completed`.
- **`rfps`** open against a business. `categories` is a `jsonb` array of agency categories that can bid.
- **`proposals`** are agency bids on an RFP. Unique on `(rfp_id, agency_id)` — one bid per agency per RFP.
- **`ledger`** is the denormalized public feed. Every confirmed donation, every disbursement, every deliverable shows up here. Don't query the source tables for the public feed; query `ledger`.
- **`donations.anonymous`** toggles whether the donor's name appears in the ledger. Telos still has the email internally.
- **`rate_limit_buckets`** is a tiny key-value table for sliding-window counts. Cheap and stateless.

## 8. Why magic-link instead of OAuth / password

- Lowest friction at the donate→portal handoff. Donor already gave us their email at proof upload; that email is the account.
- Zero password infrastructure (no hashing, no reset flows, no forget-which-Google-account).
- Recoverable: lost magic link? Request a new one.
- Downside: depends on reliable email delivery (Resend) and donor inbox access. Acceptable trade.

## 9. Edge cases handled

- **Donor already has an account:** `POST /api/donations` upserts by email; same email → same user → portal shows full history.
- **Donor uploads but never submits the form:** R2 object exists but no `donations` row references it. Acceptable — small bytes, garbage-collectable later via key prefix scan.
- **Two agencies submit the same proposal:** rejected by unique constraint `proposals_rfp_agency_unique`.
- **Vote burst from same IP:** rate limit kicks in at 30 votes/hour/IP globally; daily uniqueness blocks per-postulado repeats.
- **Postulate submission with honeypot filled:** silently returns success without writing to DB (don't reveal the trap).
- **RFP deadline passes:** status stays `open` until Telos changes it. Future: add a cron route `/api/cron/close-rfps` to auto-flip to `review`.

## 10. What's NOT here yet (good follow-ups)

- Disbursement flow (Telos → agency payment) — schema exists, UI doesn't.
- Agency deliverable upload — R2 helpers exist, UI doesn't.
- Agency self-application form — admins manually insert agencies for now.
- Cron job to auto-close RFPs.
- Search / pagination on `/negocios` and `/postulados`.
- "Resend my magic link" rate limit visibility (we silently rate-limit at 5/hr/email).
- E2E tests. Add Playwright when traffic justifies it.
