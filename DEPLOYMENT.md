# Deployment — Phase 0 Infrastructure

Everything in this guide is **code-complete**. What's left is creating three
accounts and pasting the values they give you into environment variables.

Nothing here breaks the demo: with no cloud variables set, AuctionDesk still runs
locally on SQLite with local photo storage and mock AI.

---

## What changed in Phase 0

| Area | Before | Now |
|---|---|---|
| Database connection | Hardcoded `file:./dev.db` | Reads `DATABASE_URL`; Postgres path ready |
| Photo storage | Always local disk | S3/R2 when configured, local otherwise |
| Config errors | Discovered at request time | Validated at boot; prod refuses to start if broken |
| Monitoring | None | `/api/health` + all server errors routed through one seam |

---

## Step 1 — Managed Postgres (~15 min)

SQLite is a single file on local disk. Cloud hosts replace that disk on every
deploy, so production needs a real database server.

**Recommended: [Neon](https://neon.tech)** — generous free tier, instant setup,
serverless Postgres. [Supabase](https://supabase.com) also works and bundles
auth (handy for Phase 1). AWS RDS if you want to stay in AWS.

1. Create an account and a new project/database named `auctiondesk`.
2. Copy the connection string. It looks like:
   `postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/auctiondesk?sslmode=require`
3. Set it locally to test:
   ```bash
   # in .env
   DATABASE_URL="postgresql://...?sslmode=require"
   ```
4. Create the tables and load demo data:
   ```bash
   npm run seed:pg
   ```

**How the two databases stay in sync:** `prisma/schema.prisma` (SQLite) is the
single source of truth for your models. The `db:pg:*` scripts run
`scripts/gen-pg-schema.mjs`, which derives an identical Postgres schema by
swapping only the datasource block. Never edit `prisma/schema.postgres.prisma`
by hand — it's generated and gitignored.

**Want Postgres locally too?** (recommended once you're past demos — dev/prod
parity catches bugs early). Requires Docker:
```bash
docker compose up -d
# .env: DATABASE_URL="postgresql://auctiondesk:auctiondesk@localhost:5432/auctiondesk"
npm run seed:pg
```

### Migrations
For the demo, `db push` is fine. Once real dealer data exists, switch to
versioned migrations so you never lose data on a schema change:
```bash
npm run db:pg:migrate   # development: create + apply a migration
npm run db:pg:deploy    # production/CI: apply pending migrations
```

---

## Step 2 — Photo storage: S3 or Cloudflare R2 (~15 min)

**Recommended: [Cloudflare R2](https://developers.cloudflare.com/r2/)** — S3-compatible
with **no egress fees**, which matters because vehicle photos get loaded a lot.
Plain AWS S3 works identically.

1. Create a bucket named `auctiondesk-photos`.
2. Enable public read access (photos appear in public listings) or put a CDN in front.
3. Create an API token / access key pair scoped to that bucket.
4. Set the variables:

**Cloudflare R2:**
```bash
STORAGE_BUCKET=auctiondesk-photos
STORAGE_ACCESS_KEY_ID=...
STORAGE_SECRET_ACCESS_KEY=...
STORAGE_REGION=auto
STORAGE_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
STORAGE_PUBLIC_URL=https://photos.yourdomain.com   # or the r2.dev public URL
```

**AWS S3:**
```bash
STORAGE_BUCKET=auctiondesk-photos
STORAGE_ACCESS_KEY_ID=...
STORAGE_SECRET_ACCESS_KEY=...
STORAGE_REGION=us-east-2
# leave STORAGE_ENDPOINT and STORAGE_PUBLIC_URL empty
```

The moment `STORAGE_BUCKET` is set, uploads go to the bucket instead of disk.
No code change. Verify with `/api/health` — `"storage"` should read `"s3"`.

---

## Step 3 — Real AI (~2 min)

The AI code is already written and routed through `lib/ai.ts`.

1. Get a key at [console.anthropic.com](https://console.anthropic.com).
2. Set:
   ```bash
   ANTHROPIC_API_KEY=sk-ant-...
   MOCK_AI=false
   ```
3. Confirm with `/api/health` — `"ai"` should read `"live"`.

Keep `MOCK_AI=true` for offline sales demos — it's a feature, not a fallback.
Every AI call also degrades to canned output on an API error, so a bad network
never breaks a live demo.

---

## Step 4 — Hosting on Vercel (~20 min)

Vercel is built by the Next.js team; deploys are near-zero-config.

1. Push the repo to GitHub.
2. In Vercel, **Add New → Project** and import the repo.
3. Add every variable from Step 1–3 under **Settings → Environment Variables**.
4. Set the **Build Command** so migrations run and the Postgres client is generated:
   ```
   npm run db:pg:deploy && npm run db:pg:generate && npm run build
   ```
   > This matters: the default build generates a **SQLite** client. The command
   > above generates the Postgres one and applies pending migrations.
5. Deploy, then open `https://your-app.vercel.app/api/health`.

**Expected healthy response:**
```json
{ "status": "ok", "database": "ok", "storage": "s3", "ai": "live", "issues": [] }
```

If `status` is `"degraded"`, the `issues` array names exactly what's wrong.

---

## Step 5 — Monitoring (~10 min)

1. **Uptime:** point [UptimeRobot](https://uptimerobot.com) (free) or Better Stack
   at `/api/health` every 5 minutes. It returns **503** when the database is
   unreachable or config is invalid, so alerts fire on real problems.
2. **Errors:** every server error already flows through `captureError` in
   `lib/observability.ts` (wired via `instrumentation.ts`). Today it logs to
   stdout, which Vercel captures. For real error tracking:
   ```bash
   npm install @sentry/nextjs
   ```
   then set `SENTRY_DSN` and forward from `captureError` — that one function is
   the only place you need to change.

---

## Safety net: the boot-time config check

In production, AuctionDesk **refuses to start** on a fatal misconfiguration rather
than failing mysteriously later. Verified behavior — deploying with a leftover
SQLite URL produces:

```
[config error] DATABASE_URL points at a SQLite file in production. Cloud hosts
wipe local disk on deploy — use managed Postgres (see DEPLOYMENT.md).
Error: Refusing to start with an invalid production configuration.
```

Warnings (mock AI in prod, no photo bucket) log loudly but still boot, so you
can deploy a staging environment incrementally.

---

## Phase 0 checklist

- [ ] Neon/Supabase Postgres created, `DATABASE_URL` set, `npm run seed:pg` succeeds
- [ ] R2/S3 bucket created, `STORAGE_*` set, a photo upload lands in the bucket
- [ ] `ANTHROPIC_API_KEY` set and `MOCK_AI=false`
- [ ] Deployed to Vercel with the migration-aware build command
- [ ] `/api/health` returns `200` with `"status":"ok"`
- [ ] Uptime monitor watching `/api/health`

Once these pass, **Phase 1 (accounts & multi-tenancy)** is the next step — see
[PRODUCTION_ROADMAP.md](./PRODUCTION_ROADMAP.md).

---

## Step 6 — Messaging webhooks (after Phase 1–3 build)

### Twilio SMS (~20 min)
1. Buy a local number in the [Twilio console](https://console.twilio.com).
2. Set the env vars:
   ```bash
   TWILIO_ACCOUNT_SID=AC...
   TWILIO_AUTH_TOKEN=...
   TWILIO_FROM_NUMBER=+19205550100
   ```
3. On the number's config, set **A message comes in** → Webhook, POST:
   ```
   https://your-domain/api/sms/inbound?dealership=<slug>
   ```
4. Text the number — a lead should appear in the inbox. Reply STOP and confirm the
   customer is marked opted out.

> Until the vars are set, replies and follow-ups are **recorded and clearly labeled
> simulated** — the app is fully usable for demos without a Twilio account.

### Inbound email for Craigslist replies (~20 min)
1. In Postmark (or SendGrid/Mailgun), set up an **inbound stream** and point its webhook at:
   ```
   https://your-domain/api/email/inbound?dealership=<slug>&token=<INBOUND_EMAIL_TOKEN>
   ```
2. Set `INBOUND_EMAIL_TOKEN` to a random string so only your provider can post.
3. Forward the mailbox you use on Craigslist posts to that inbound address.
4. Send a test email with a subject like `Re: 2019 Honda CR-V EX AWD - $21,995` — a
   Craigslist lead should appear, matched to that vehicle.

### Per-dealership routing
Both webhooks take `?dealership=<slug>`, so one deployment serves many dealerships: give
each its own Twilio number and inbound email address, each with its own slug.

---

## ⚠️ Before you text a single customer: TCPA

Texting consumers is regulated. AuctionDesk enforces the mechanics — marketing follow-ups
are blocked unless `smsConsent` is set, every marketing message carries an opt-out notice,
and STOP immediately revokes consent — but **the policy side is yours**:

- Keep the consent checkbox on the lead form (it's unchecked by default — leave it that way).
- Don't bulk-import old customers and mark them consented. Consent has to be real.
- Have a lawyer review your consent language before the first campaign.

Replying to someone who just messaged you is fine. Proactive marketing is what's regulated.
