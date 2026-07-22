# Demo notes — customizing for a specific dealership

Ten minutes before a meeting, you can make the demo show *their* lot instead of the generic
Fox Valley data. Everything lives in one file: **`prisma/seed.ts`**.

## The 10-minute swap

1. **Open `prisma/seed.ts`** and find the `vehicleData` array (near the top). Each row is
   one vehicle:

   ```ts
   { vin: "1FTFW1ET5EFA10234", year: 2016, make: "Ford", model: "F-150",
     trim: "XLT SuperCrew 4x4", mileage: 98432, cost: 14200, price: 18995,
     status: "available", acquiredAt: daysAgo(22) },
   ```

   Replace 5–10 rows with vehicles from **their actual website or Facebook page** (pull
   them up right now — year/make/model/trim/mileage/price is all public). Keep `cost`
   plausible (price minus $2–4k) and vary `daysAgo(...)` so the days-on-lot colors show
   green, yellow, AND red — the red ones make the price-drop nudge land.

   > Keep at least one truck, and make the **money-shot vehicle** (see below) one of THEIR
   > nicest cars.

2. **Point the money-shot conversation at their car.** Find the comment
   `// The money-shot lead` — it looks up a CR-V via `byModel("CR-V", 0)`. Change the model
   name to one of the vehicles you entered, and update the message text (`moneyMsgs`) to
   match its year/miles/price. This is the after-hours conversation you'll show, so the
   numbers must match their car exactly.

3. **Localize the names (optional, 2 min).** The `customerData` and dealership references:
   - Customer towns are already Fox Valley (Appleton, Neenah, Kaukauna, Oshkosh) — fine
     for any lot in the area; edit if you're demoing elsewhere.
   - The dealership name shown in the UI is in two places: `DEALERSHIP` in `lib/ai.ts`
     and "Fox Valley Auto Sales" in `app/app/layout.tsx` (sidebar footer) and the mock
     replies. Search-replace "Fox Valley Auto" if you want their name on screen — huge
     effect for zero effort.
   - The dashboard greets "Dale" — change `Good morning, Dale` in `app/app/page.tsx` to
     the owner's first name.

4. **Re-run the seed:**

   ```bash
   npm run seed
   ```

   This wipes and rebuilds the database with your edits, and re-anchors every timestamp
   to "now" — so leads say "came in 14 min ago" no matter when the meeting is.

5. **Smoke-test (60 seconds):** open `/app` → dashboard numbers look sane → open the
   money-shot lead → open one inventory car → done.

## Gotchas

- **VINs must be unique** — if you copy a row, change a character in the VIN.
- **Don't delete the fresh unread leads** (`freshSpecs`) — they power "3 leads need you"
  on the dashboard. You can rename them to locally plausible names.
- **Revenue Radar needs old deals** — the `olderDealSpecs` rows (24+ months ago) power it.
  Leave them, or repoint their vehicle indexes at vehicles that exist.
- If the seed crashes, the error tells you which model failed — it's almost always a
  duplicate VIN or a vehicle index out of range in `dealSpecs`.
- `npm run seed` is always safe to re-run; it's a full wipe-and-rebuild.

## Extra personalization (worth 5 more minutes)

- **Settings → Business hours**: set them to the dealership's real hours before the
  meeting — then the AI's suggested test-drive slots match their actual open days,
  which makes the Settings beat land harder.
- **Settings → Calendar blocks**: the seed creates "Auction run — Milwaukee" next
  Thursday. If you know something real from the interview ("he's at the Shawano auction
  Wednesdays"), add that block instead.
- **Settings → Templates**: paste a paragraph from one of THEIR real listings and turn
  the specifics into placeholders (`{{year}} {{make}} {{model}}`, `{{mileage}}`,
  `{{price}}`). Generating a listing "in their own words" is the single best template
  moment in the demo.
- **Photos**: before the meeting, save 3–4 photos of their actual cars from their
  Facebook page and upload them on the matching vehicle pages. Real photos of their own
  inventory beats everything else on this list.

## Demo-day checklist

- [ ] `npm run seed` (fresh timestamps)
- [ ] `npm run dev` running, `/app` open in a tab, phone on the table with `/app`
- [ ] `MOCK_AI=true` in `.env` unless you have reliable wifi AND want live API calls
- [ ] Know which lead is your money shot (purple badge in Leads)
- [ ] Zoom browser to 100%, close other tabs
