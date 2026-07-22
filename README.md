# AuctionDesk

An automation hub for small independent used-car dealerships (5–50 cars, 1–10 people, no
enterprise DMS). Built as a customer-discovery demo for Fox Valley (Appleton/Oshkosh, WI)
dealers.

**Three jobs, one app:**

1. **Smart Inventory Hub** — post a car once, it goes everywhere (website, Facebook
   Marketplace, Craigslist), with AI-written listings you can edit before and after
   saving, edit the vehicle's own details any time (Inventory → vehicle → Details →
   Edit), your own no-code description templates, real photo uploads, and one-click
   **Mark Sold** that takes the listings down.
2. **24/7 AI Lead Responder** — every lead answered within 2 minutes using real inventory
   data, even at 9 PM, with a reply that actually varies by what the customer asked.
   Suggested test-drive times come from a real Outlook-style calendar (Settings) — click
   or drag to block time off and the AI stops offering it, instantly.
3. **Follow-Up Autopilot** — thank-you/review requests, 6-month check-ins, and trade-in
   re-engagement, personalized and automatic.

## One-command setup

```bash
cp .env.example .env      # first time only
npm install && npm run seed && npm run dev
```

Open http://localhost:3000 — the marketing landing page.

**Sign in** at http://localhost:3000/login with a seeded demo account:

| Email | Password | Role |
|---|---|---|
| `dale@foxvalleyauto.com` | `demo1234` | Owner — also manages the team in Settings |
| `jordan@foxvalleyauto.com` | `demo1234` | Staff — works leads and inventory |

Sign in as each to see the difference: only owners get **Settings → Team**, where they add
people and switch them between owner and staff.

This demo data lives **only** in your local SQLite file. Production databases are seeded by
nobody — the first real dealership is created by signing up in the app.

The dealer app is at `/app`. Each dealership also gets a **public inventory site** at
`/lot/<slug>` — the demo one is http://localhost:3000/lot/fox-valley-auto.

That's it. SQLite database, no external services. The demo ships with `MOCK_AI=true` in
`.env`, so **all AI features work offline** with realistic canned responses built from the
actual seeded data. To use the real Anthropic API instead, set `ANTHROPIC_API_KEY` in `.env`
and `MOCK_AI=false` (model: `claude-sonnet-4-6`).

Re-run `npm run seed` any time to reset to pristine demo data (it also refreshes all
timestamps relative to "now", so leads always look fresh).

**Going to production?** See **[DEPLOYMENT.md](./DEPLOYMENT.md)** — the app is already
wired for managed Postgres, S3/R2 photo storage, and health monitoring; you just supply
the credentials. `/api/health` reports which backends are live.

### Platform admin

`/admin` is a cross-tenant support console: every dealership, every user, password resets,
and a "sign them out everywhere" button. It's the one place that reads across tenants, so
access can't be granted from inside the app — sign up normally, then run:

```bash
npm run admin:grant -- you@example.com          # local
# against production, generate the Postgres client and pass the URL explicitly:
npm run db:pg:generate
DATABASE_URL="<pooler-url>" npm run admin:grant -- you@example.com
```

## 5-minute demo walkthrough script

> Before the meeting: run `npm run seed` so timestamps are fresh, open `/app` in a browser
> tab, and put your phone on the table with `/app` open too (it's fully responsive — that
> alone lands with owners who live on the lot).

### Minute 0–1 · Dashboard (the 30-second wow)

**Open `/app`.** Say: *"This is what you'd see with your morning coffee."*

- Point at **Hours Saved This Month** — "That's the Sunday nights back. Every listing you
  don't retype is 40 minutes."
- Point at **Leads Answered After Hours** and **Avg. Response Time: 2 min vs. next
  morning** — "Buyers message at 9 PM. This is what happens to them now."
- Point at **Today's action list** — "It doesn't replace you. It tells you the 3 things
  worth your time today."

### Minute 1–2.5 · Smart Inventory (pain #1: re-posting cars everywhere)

**Click Inventory → Add Vehicle.**

1. Type any 17-character VIN (e.g. `1C4RJFBG5MC712345`), tab out — watch it "decode."
   Fill mileage `41200` and price `27995`. Point at the **Description style** dropdown:
   *"These are YOUR templates — you write the pitch once in your own words, AuctionDesk
   fills in each car's numbers."* Pick "Dale's straight shooter."
2. Click **Generate Listing**. Say: *"You typed a VIN and two numbers. Here's your sales
   description in your own voice, your Facebook post, your Craigslist ad, and a photo
   shot list."* Click through the 4 tabs, then hit **Edit** on the description and change
   a word — *"nothing goes out you didn't approve."*
3. Click **Save to Inventory**, then on the vehicle page click **Add photos** and upload
   a picture from the laptop (or your phone). Then **Publish Everywhere** — let the
   checklist animate: Website ✓ Facebook ✓ Craigslist ✓ with timestamps.
   Say: *"45 minutes of retyping just became one click."*
4. Back on Inventory, point at the **days-on-lot colors** — green under 30, yellow 30–60,
   red over 60. "The red ones are the ones costing you money." Optionally open the old
   Grand Caravan and click **Mark Sold** — the listings come down the same way they went
   up.

### Minute 2.5–4 · AI Lead Responder (pain #2: after-hours leads going cold)

**Click Leads.**

1. Point at the unified inbox — "Facebook, website, Craigslist, phone, walk-ins. One list.
   No more losing track of who called about what."
2. **Open Amber Vandervelde** (the one with the purple *Answered by AuctionDesk* badge). This
   is the money screenshot: *"She messaged at 9:12 PM — you were home. AuctionDesk answered at
   9:14 with the real miles and real price, offered two test-drive slots, and she booked
   4:30 PM. You found out at breakfast."* Point at the **Escalated to you** panel — name,
   vehicle, what she wants, next step.
3. Open a fresh lead (e.g. Josh Peterson), click **AI Draft Reply** — show that it answers
   from the actual vehicle's specs, offers two slots, asks one qualifying question. Edit a
   word to show you're in control, then hit Send.
4. Show the **Auto-Pilot toggles** per source — "You choose which channels it answers on
   its own. Phone and walk-ins can stay yours."
5. **Click Settings** (15 seconds, this one lands): show business hours, and the calendar
   blocks — *"Thursday morning you're at the Milwaukee auction, so AuctionDesk never offers
   customers Thursday morning. It offers times you're actually there — see the green bar:
   that's what it's suggesting right now."* Add a block live if they look skeptical.

### Minute 4–5 · Follow-Up Autopilot (pain #3: repeat business is luck)

**Click Follow-Ups.**

1. Show the three sequences — thank-you + Google review at 3 days, check-in at 6 months,
   trade-in nudge at 30 months. Point at a preview: *"That's their actual name and their
   actual car, not a blast."*
2. Show **Revenue Radar** — "These folks bought 24+ months ago and are sitting on trade-in
   equity. One click drafts the message." Click **Draft outreach** on one, show the
   personalized text, hit Send.
3. Close on the dashboard: *"Hours back, leads answered, buyers returning — and you saw
   every piece of it in five minutes."*

**The ask:** "If I loaded YOUR inventory in here before next week, would you run it for a
month?"

## What's simulated vs. real (never overclaim)

**Real, working today:**

- **Accounts & multi-tenancy** — email/password sign-in (scrypt hashing, server-side
  sessions, httpOnly cookies). Every query is scoped to the signed-in dealership;
  verified that another tenant's record 404s on both page loads and API calls.
- **Your public inventory site** (`/lot/<slug>`) — genuinely automatic publishing to a
  channel you own. Publish/remove is one click and takes effect immediately.
- **Website lead capture** — the public listing page has a form that creates a real lead
  in the inbox, auto-matched to the vehicle, with TCPA consent captured at submit time.
- **Inbound SMS** (`/api/sms/inbound`) — texts create or continue leads. STOP is honored
  immediately and revokes consent (phone matching is format-agnostic).
- **Inbound email** (`/api/email/inbound`) — Craigslist replies arrive as email; the
  webhook parses Postmark/SendGrid/Mailgun payloads into leads and matches them back to
  the right vehicle by year/make/model.
- **Outbound SMS** — replies and follow-ups send through Twilio when configured; without
  credentials they're recorded and clearly reported as simulated.
- **TCPA enforcement** — marketing follow-ups are blocked unless the customer has opted
  in, and every marketing text carries an opt-out notice.
- The entire dealer app: inventory, AI listing/reply/follow-up generation, editable
  listings, per-channel templates, photo uploads, calendar-aware scheduling, dashboards.

**Assisted, not automated (deliberately):**

- **Facebook Marketplace and Craigslist posting.** AuctionDesk writes the listing, copies
  it to your clipboard, and opens the posting page — *you* paste and submit. Automating
  these violates both platforms' terms and risks getting the dealer's account banned, so
  we don't. You then confirm "I posted it" and AuctionDesk tracks the state per channel,
  including reminding you to take listings down when a vehicle sells.
- The **official** automated path for Facebook is their vehicle catalog partner program —
  see PRODUCTION_ROADMAP.md. Craigslist has no such path for a company this size.

**Still simulated / not built yet:**

- **Scheduled follow-up sending.** The sequences are designed and can be sent manually,
  but nothing fires them on a cron yet (Phase 4 in the roadmap).
- **VIN decode** fills sample values; production would call a VIN API.
- **Trade-in equity** uses a flat heuristic, not KBB/Black Book data.
- **AI in demo mode** (`MOCK_AI=true`) uses context-aware canned responses. Set an
  `ANTHROPIC_API_KEY` and `MOCK_AI=false` for the real model.

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS · Prisma + SQLite · Anthropic API
(`claude-sonnet-4-6`) via `lib/ai.ts` · seeded demo data in `prisma/seed.ts`

See `DEMO_NOTES.md` for how to swap in a specific dealership's real inventory in under 10
minutes before a meeting.

_Deployed via Vercel._
