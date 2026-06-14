# Account setup walkthrough

You have to create these accounts and paste their keys into `.env.local`. Everything below is on a free tier; you'll only pay if/when you hit MVP-graduation traffic.

Suggested order (≈ 30 minutes total):

1. [Neon](#1-neon-database) — database
2. [Cloudflare](#2-cloudflare-r2--turnstile) — file storage + CAPTCHA (same account does both)
3. [Resend](#3-resend-email) — transactional email
4. [Generate AUTH_SECRET](#4-auth_secret)
5. [Vercel](#5-vercel-deployment) — deploy
6. [Optional: domain](#6-optional-buy-and-attach-a-domain)

After you finish, populate `.env.local` and run `npm run db:push && npm run db:seed && npm run dev`.

---

## 1. Neon (database)

1. Go to https://console.neon.tech → **Sign up** (use Google or GitHub for fastest).
2. After login, click **Create project**.
   - Project name: `telos`
   - Region: `AWS · us-east-2 (Ohio)` (cheapest, closest to Colombia in latency)
   - Postgres version: 17
3. Click **Create project**. You land on the Dashboard.
4. In the left nav: **Connection Details**.
5. Toggle **Pooled connection** ON. Copy the full `postgresql://…?sslmode=require` string.
6. Paste it into `.env.local` as `DATABASE_URL=...`.

That's it. Free tier: 0.5 GB storage, ~191 compute-hours/month (plenty for MVP).

## 2. Cloudflare R2 + Turnstile

These are two products under the same Cloudflare account. Create the account once and do both.

### Sign up

1. https://dash.cloudflare.com → **Sign up**. Email + password.
2. Verify your email.

### R2 (file storage)

1. In the left nav, click **R2 Object Storage**.
2. If it's your first time, you'll see a "Subscribe to R2" prompt. Subscribe — there's no credit card requirement for the free tier, just an upgrade path if you exceed limits.
3. Click **Create bucket**.
   - Name: `telos-uploads`
   - Location: `Automatic` (or `EEUR` if you want EU)
   - Click **Create bucket**.
4. Top-right of R2 dashboard → **Manage R2 API Tokens** → **Create API token**.
   - Token name: `telos-app`
   - Permissions: `Object Read & Write`
   - Specify bucket: `telos-uploads`
   - TTL: leave blank (no expiry)
   - Click **Create API token**.
5. Copy the values immediately (they're shown only once):
   - **Access Key ID** → `R2_ACCESS_KEY_ID`
   - **Secret Access Key** → `R2_SECRET_ACCESS_KEY`
6. Get your **Account ID** from the right side of the main Cloudflare dashboard → `R2_ACCOUNT_ID`.
7. `R2_BUCKET=telos-uploads`

Leave `R2_PUBLIC_URL=""` for now — we use signed read URLs.

### Turnstile (CAPTCHA)

1. Left nav → **Turnstile**.
2. Click **Add site**.
   - Site name: `Telos`
   - Domain: `localhost` (and add your prod domain later)
   - Widget mode: `Managed` (recommended)
   - Click **Create**.
3. Copy the two keys shown:
   - **Site key** → `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
   - **Secret key** → `TURNSTILE_SECRET_KEY`

Free tier: unlimited verifications.

## 3. Resend (email)

1. https://resend.com → **Sign up** (GitHub login is fastest).
2. After login, you'll be on the Dashboard. Click **API Keys** → **Create API Key**.
   - Name: `telos-app`
   - Permission: `Sending access`
   - Domain: `All domains`
   - Click **Add**.
3. Copy the `re_…` key → `RESEND_API_KEY`.
4. **Sending from a domain:** in dev you can use the default `onboarding@resend.dev` (deliverable but marked as test). For production add a domain (next section).
5. For now set: `RESEND_FROM="Telos <onboarding@resend.dev>"`

Once you own the telos.foundation domain, come back and:

1. Resend dashboard → **Domains** → **Add Domain** → `telos.foundation`.
2. Add the DNS records Resend gives you (SPF, DKIM, optionally DMARC).
3. Wait for verification (~minutes).
4. Update `.env.local`: `RESEND_FROM="Telos <no-reply@telos.foundation>"`

Free tier: 100 emails/day, 3,000/month.

## 4. AUTH_SECRET

Generate a 32-byte random string for JWT signing:

```bash
openssl rand -base64 32
```

Paste the result into `.env.local` as `AUTH_SECRET="…"`. Don't commit this anywhere.

## 5. Vercel (deployment)

1. https://vercel.com → **Sign up with GitHub**.
2. After login, click **Add New** → **Project**.
3. Pick `TelosFoundationCol/telos`. (You may need to grant Vercel access to the org — click **Adjust GitHub App Permissions** and add it.)
4. Configure project:
   - Framework: `Next.js` (auto-detected)
   - Build command: `npm run build`
   - Install command: `npm install --legacy-peer-deps`
   - Output directory: `.next` (default)
5. **Environment Variables** section: copy every key from your `.env.local` into Vercel. Make sure `NEXT_PUBLIC_APP_URL` is set to your Vercel preview URL or custom domain (e.g. `https://telos.foundation`).
6. Click **Deploy**.

After the first deploy:

- Update Turnstile to add your Vercel domain to the allowed-domains list.
- Update Resend `RESEND_FROM` to use your verified domain.
- Update `ADMIN_EMAILS` so you'll get admin role on first sign-in.

## 6. Optional: buy and attach a domain

Recommended: register `telos.foundation` (or whatever you decide) via Cloudflare Registrar (cheapest, at-cost).

1. Cloudflare dashboard → **Domain Registration** → **Register Domains** → search `telos.foundation`.
2. Once registered, the domain auto-uses Cloudflare DNS.
3. Vercel project → **Settings** → **Domains** → add `telos.foundation` → Vercel gives you a CNAME / A record to add to Cloudflare DNS.
4. Done.

---

## Final .env.local checklist

```bash
DATABASE_URL=...                              # from Neon
AUTH_SECRET=...                               # openssl rand -base64 32
RESEND_API_KEY=re_...                         # from Resend
RESEND_FROM="Telos <onboarding@resend.dev>"   # or your verified domain
R2_ACCOUNT_ID=...                             # from Cloudflare dashboard
R2_ACCESS_KEY_ID=...                          # from R2 API token
R2_SECRET_ACCESS_KEY=...                      # from R2 API token (shown once!)
R2_BUCKET=telos-uploads
R2_PUBLIC_URL=
NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x...          # from Turnstile
TURNSTILE_SECRET_KEY=0x...                    # from Turnstile
NEXT_PUBLIC_APP_URL=http://localhost:3000     # change in Vercel for prod
ADMIN_EMAILS=your@email.com                   # comma-separated; auto-promotes to admin on sign-in
```

## First-run sequence

```bash
npm install --legacy-peer-deps
npm run db:push       # creates all tables in Neon
npm run db:seed       # populates sample agencies / postulados / businesses / RFPs
npm run dev
```

Open http://localhost:3000 → "Portales" menu → "Portal donante" → enter your `ADMIN_EMAILS` email → check inbox for magic link → click → you're in.

## Cost ceiling cheat sheet

| Service     | Free tier ceiling                              | What happens if exceeded                          |
| ----------- | ---------------------------------------------- | ------------------------------------------------- |
| Neon        | 0.5 GB storage, 191 compute hrs/mo             | Upgrade $19/mo for 10 GB                          |
| R2          | 10 GB storage, 1M reads, 0 egress              | $0.015/GB/mo storage; reads $0.36/M               |
| Resend      | 100/day, 3,000/mo                              | $20/mo for 50K                                    |
| Turnstile   | Unlimited                                       | n/a                                               |
| Vercel      | 100 GB bandwidth, unlimited fn invocations     | $20/mo Pro for 1 TB                               |

The first thing that'll likely cost money is **Resend** if you broadcast every RFP to 50+ agencies × 4 RFPs/week + donor magic links. That's still under $20/mo.
