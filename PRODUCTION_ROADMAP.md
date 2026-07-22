# AuctionDesk — Path to Production

This is the honest, step-by-step plan to take AuctionDesk from a local demo to a live product
that real Fox Valley dealers can use. It's organized so that **each phase ships something
usable** and the hardest, approval-gated integrations (Facebook, Craigslist) come *after* the
foundation is solid.

Two things up front:

- **What's already real** (works the moment you flip a switch): the whole app, the database,
  AI listing/reply/follow-up generation (set `MOCK_AI=false` + an Anthropic key), the
  inventory hub, the unified inbox, the calendar/scheduling, templates, and validation.
- **What's simulated today**: actually *sending* messages, and actually *posting/removing*
  listings on Facebook & Craigslist. Those are external integrations — some easy, some gated
  behind approvals. This doc is mostly about turning those on.

---

## Phase 0 — Infrastructure foundation ✅ CODE-COMPLETE

**The code for this phase is done.** What remains is creating three accounts and pasting in
the values — see **[DEPLOYMENT.md](./DEPLOYMENT.md)** for exact steps.

| # | Item | Status |
|---|---|---|
| 1 | **Database: SQLite → Postgres** | ✅ Connection is env-driven (`DATABASE_URL`). `npm run seed:pg` targets Postgres; `scripts/gen-pg-schema.mjs` derives the Postgres schema from the SQLite one so models can't drift. `docker-compose.yml` included for local Postgres. 
**You do:** create a Neon/Supabase database, paste the URL. |

| 2 | **Hosting** | ✅ App is deploy-ready; build command documented. 
**You do:** import the repo into Vercel. |

| 3 | **Real AI** | ✅ Already routed through `lib/ai.ts` with graceful fallback. 
**You do:** set `ANTHROPIC_API_KEY`, `MOCK_AI=false`. |

| 4 | **Photo storage → cloud** | ✅ `lib/storage.ts` writes to S3/R2 when `STORAGE_BUCKET` is set, local disk otherwise. Upload/serve/delete verified. **You do:** create a bucket, paste credentials. |

| 5 | **Secrets, monitoring, error tracking** | ✅ `.env.example` documents every variable; config is validated at boot (production refuses to start if broken); `/api/health` reports DB/storage/AI status for uptime checks; all server errors route through one Sentry-ready seam. **You do:** point an uptime monitor at `/api/health`. |

**Design constraint held throughout:** the zero-config demo still works. With no cloud
variables set, `npm install && npm run seed && npm run dev` runs exactly as before on SQLite
with local photos and mock AI.

---

## Phase 1 — Accounts & multi-tenancy ✅ BUILT

1. ✅ `Dealership`, `User`, and `Session` models. Every business record hangs off a
   dealership.
2. ✅ Every page, server action, and API route is scoped to the signed-in dealership.
   Mutations filter on `dealershipId`, so a tampered ID from another tenant matches zero
   rows. **Verified**: another dealership's vehicle 404s on page load *and* on API calls.
3. ✅ Auth built with **no external dependency** — scrypt password hashing (Node core),
   server-side sessions, httpOnly/sameSite cookies, session token stored only as a hash.
   Chosen over Auth.js/Clerk because this Next.js version has breaking changes and a
   framework that hooks deep into internals was the bigger risk.
4. ✅ Seeded demo tenant (`dale@foxvalleyauto.com` / `demo1234`) plus a second tenant used
   to prove isolation.

> Note: `middleware` is **deprecated and renamed to `proxy`** in this Next.js version, and
> the docs warn against DB lookups there. Auth is enforced in the app layout (the
> recommended App Router pattern) plus `requireUser()` at the data layer, which fails
> closed.

---

## Phase 2 — Real messaging (the unified inbox, for real)

Today the inbox is real; the *send/receive over real channels* is simulated. The right shape
is a **channel-adapter** model: one inbox, several adapters that translate each channel in and
out. Do the easy channels first — they deliver value while you pursue the gated ones.

| Channel | Inbound (receive) | Outbound (send) | Difficulty | Notes |
|---|---|---|---|---|
| **Website form** | ✅ **BUILT** — form on `/lot/<slug>/<id>` creates a lead | ✅ SMS reply | Done | Captures TCPA consent at submit. |
| **Phone / SMS** | ✅ **BUILT** — `/api/sms/inbound` | ✅ **BUILT** — Twilio REST | Done | Simulated until credentials are set. STOP honored; consent enforced on marketing. |
| **Craigslist** | ✅ **BUILT** — `/api/email/inbound` parses Postmark/SendGrid/Mailgun and matches the vehicle | Reply as email through the relay | Inbound done | No API — it's email under the hood. |
| **Facebook / Messenger** | Messenger webhook | Messenger Send API | 🔴 Gated | Requires a Meta App, a connected Page, `pages_messaging` permission, and **Meta App Review**. Weeks of lead time. |
| **Walk-in** | Manual entry (already works) | — | ✅ Done | — |

**Order of attack:** Website form → Twilio SMS → Craigslist email ingestion → Facebook
Messenger (start the Meta app-review process early since it's the long pole).

---

## Phase 3 — Real listing syndication (publish / take-down / mark-sold)

This is the "post once, everywhere" promise made real. Each channel has a different mechanism,
and this is where the honest constraints live.

### Website (✅ BUILT)
Public inventory at `/lot/<slug>` with per-vehicle detail pages, photos, SEO metadata, and a
lead-capture form. Publish/remove is one click and immediate; marking a vehicle sold pulls it
off the site automatically. No third party, no approval.

### Facebook Marketplace (✅ assisted posting BUILT · 🔴 full automation still gated)

**Built:** AuctionDesk writes the listing, copies it to the clipboard, and opens the
Marketplace posting form. You paste and submit; you then confirm "I posted it" and the app
tracks per-channel state, including prompting you to take it down when the vehicle sells.
This is the safe path — see the agent discussion below.

**Still gated (the automated path):**
- **There is no public API to post individual vehicles to Marketplace.** The legitimate route
  is Meta's **vehicle inventory partner / catalog** program: you become an approved partner and
  publish inventory through a **catalog feed** (a data feed Facebook polls, or the Catalog API).
- **Publish** = add the vehicle to your feed. **Take-down / mark-sold** = remove or flag it in
  the feed; Facebook re-syncs (there's some refresh latency — not instant).
- **Getting approved takes time and has requirements.** Realistic options:
  1. Apply to Meta directly as an inventory partner (slowest, most control).
  2. **Integrate with an existing inventory-syndication vendor** that already holds Marketplace
     access and resell/whitelabel their pipe (fastest path to a real Facebook presence).
  3. **Assisted posting** as a stopgap: the app pre-fills everything, the dealer clicks
     "post" — human-in-the-loop, no API needed.

### Craigslist (✅ assisted posting + inbound email BUILT · 🔴 automated posting not viable)

**Built:** same assisted flow as Facebook, plus inbound reply ingestion via email.

**Why there's no automated path:**
- Craigslist has **no open posting API.** Bulk posting exists only for a small set of
  contracted partners, and vehicle posts by dealers are **paid** (typically ~$5/post).
- Realistic options mirror Facebook:
  1. Become an approved bulk-posting partner (hard, contract-based).
  2. Use a syndication vendor that already posts to Craigslist.
  3. **Assisted posting** — pre-fill and let the dealer submit (this is how many small tools
     actually do it).
- **Take-down / mark-sold** = delete the post (via bulk API if you're a partner, else assisted).

> **Strategic note:** For both Facebook and Craigslist, "buy vs build" is real. Getting your
> own partner access is the highest-margin, longest-timeline path. Integrating a syndication
> aggregator gets you real listings in weeks instead of months, at a per-listing cost. Many
> successful dealer tools start with assisted posting + an aggregator, then bring it in-house.

**The good news:** the app is already built around this. `markVehicleSold` and the publish flow
already treat the status change as the single trigger — when the real channel adapters land,
"mark sold" takes the listings down everywhere by design.

---

## Phase 4 — Follow-up automation, for real (1 week, after SMS/email exist)

The three sequences (3-day thank-you, 6-month check-in, 30-month trade-in) are designed and
personalized today, but nothing actually sends on a schedule. Once Twilio/email exist:

1. Add a **scheduled job** (cron — Vercel Cron, or a worker) that runs daily, finds due
   follow-ups, generates the personalized message, and sends it.
2. Wire the Google review link to the dealership's real review URL.
3. Log every send (already modeled) and respect opt-outs.

---

## Phase 5 — Compliance, reliability, launch readiness (ongoing)

- **TCPA (texting law):** you must capture consent before texting customers and honor STOP/opt-
  out. This is a legal must, not optional. Bake it into the customer record.
- **CAN-SPAM (email):** unsubscribe link + physical address on marketing emails.
- **Backups & monitoring:** automated Postgres backups, error tracking, uptime alerts.
- **Data privacy:** a basic privacy policy; customer data handling review.

---

## Realistic sequencing summary

```
Weeks 1–2   Phase 0  Infra: Postgres, hosting, real AI, cloud photos
Weeks 2–4   Phase 1  Accounts + multi-tenancy (login)
Weeks 3–6   Phase 2  Messaging: website form → SMS → Craigslist email
            Phase 3  Website listings live (real syndication #1)
   ↳ start Meta App Review + Facebook/Craigslist partner or vendor eval EARLY (long lead time)
Weeks 6–10  Phase 2  Facebook Messenger once app-review clears
            Phase 3  Facebook/Craigslist listings via partner or aggregator
Weeks 8–10  Phase 4  Real scheduled follow-ups
Ongoing     Phase 5  Compliance, monitoring, hardening
```

**Fastest credible "real product" milestone:** Phases 0 + 1 + website listings + Twilio SMS +
Craigslist email ingestion. That's a genuinely useful product for a Fox Valley dealer *without*
waiting on any Facebook/Craigslist approval — and you pursue those in parallel.
