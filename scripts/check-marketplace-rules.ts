// Assertions for the Marketplace rules. No test framework in this project, so
// this is a script: `npx tsx scripts/check-marketplace-rules.ts`.
import { checkFacebookListing, checkPace, takedownOverdueBy } from "../lib/marketplace-rules";

let failures = 0;
function check(label: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) {
    failures++;
    console.error(`FAIL ${label}\n  expected ${JSON.stringify(expected)}\n  actual   ${JSON.stringify(actual)}`);
  } else {
    console.log(`ok   ${label}`);
  }
}

const clean = {
  title: "2019 Honda CR-V EX AWD",
  body: "68,400 miles. Serviced in our shop before listing. Clean title. Trades considered.",
  price: 21995,
  photoCount: 6,
};

check("clean listing passes", checkFacebookListing(clean).length, 0);

check(
  "financing phrase blocks",
  checkFacebookListing({ ...clean, body: clean.body + " Financing available!" })
    .filter((i) => i.severity === "block").length,
  1,
);

check(
  "finance phrase reported once, not per variant",
  checkFacebookListing({ ...clean, body: "We finance. No credit check. Bad credit ok." })
    .filter((i) => i.severity === "block").length,
  1,
);

check("bait price blocks", checkFacebookListing({ ...clean, price: 1 }).some((i) => i.severity === "block"), true);
check("real price passes", checkFacebookListing({ ...clean, price: 16750 }).length, 0);

check("all-caps title blocks", checkFacebookListing({ ...clean, title: "CLEAN HONDA CRV MUST GO" }).some((i) => i.severity === "block"), true);
check("normal title passes", checkFacebookListing(clean).some((i) => i.severity === "block"), false);
// "2019 Honda CR-V EX AWD" is short and has legitimate acronyms — must not trip.
check("short title with acronyms passes", checkFacebookListing({ ...clean, title: "2020 BMW X3 AWD" }).some((i) => i.severity === "block"), false);

check(
  "emoji spam warns",
  checkFacebookListing({ ...clean, body: "🔥🔥🔥✅✅✅🚗🚗 great truck" }).some((i) => i.severity === "warn"),
  true,
);
check("a few emoji pass", checkFacebookListing({ ...clean, body: "🔥 Great truck ✅" }).length, 0);

check("no photos warns", checkFacebookListing({ ...clean, photoCount: 0 }).some((i) => i.severity === "warn"), true);

// --- pace ---
const t = (min: number) => new Date(Date.UTC(2026, 6, 22, 12, min, 0));

check("fresh day can post", checkPace(0, null, t(0)).canPostNow, true);
check("at limit blocks", checkPace(10, null, t(0)).canPostNow, false);
check("over limit blocks", checkPace(11, null, t(0)).canPostNow, false);
check("remaining counts down", checkPace(7, null, t(0)).remainingToday, 3);
check("spacing blocks within 5min", checkPace(3, t(0), t(2)).canPostNow, false);
check("spacing reports wait", checkPace(3, t(0), t(2)).waitMinutes, 3);
check("spacing clears after 5min", checkPace(3, t(0), t(6)).canPostNow, true);
// Daily limit must win over spacing — otherwise a long gap would appear to reset it.
check("limit beats spacing", checkPace(10, t(0), t(600)).canPostNow, false);

// --- takedown ---
const hoursAgo = (h: number) => new Date(Date.UTC(2026, 6, 22, 12) - h * 3_600_000);
check("fresh sale not overdue", takedownOverdueBy(hoursAgo(2), t(0)), 0);
check("exactly 24h not overdue", takedownOverdueBy(hoursAgo(24), t(0)), 0);
check("30h is 6h overdue", takedownOverdueBy(hoursAgo(30), t(0)), 6);

console.log(failures === 0 ? "\nAll checks passed." : `\n${failures} check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
