import { PrismaClient } from "@prisma/client";
import { randomBytes, scrypt as scryptCb } from "crypto";
import { promisify } from "util";

const prisma = new PrismaClient();

// Mirrors lib/auth.ts hashPassword — kept inline so the seed has no app imports.
const scrypt = promisify(scryptCb) as (p: string, s: string, k: number) => Promise<Buffer>;
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = await scrypt(password, salt, 64);
  return `scrypt:${salt}:${derived.toString("hex")}`;
}

// The demo dealership's logins. Documented in README so demos can sign in.
// Same password for both — this data only ever lives in a local SQLite file.
const DEMO_EMAIL = "dale@foxvalleyauto.com";
const DEMO_STAFF_EMAIL = "jordan@foxvalleyauto.com";
const DEMO_PASSWORD = "demo1234";

// Helpers to build dates relative to "now" so the demo always looks live.
const now = new Date();
const minutesAgo = (m: number) => new Date(now.getTime() - m * 60_000);
const hoursAgo = (h: number) => new Date(now.getTime() - h * 3_600_000);
const daysAgo = (d: number) => new Date(now.getTime() - d * 86_400_000);
// A specific evening time N days ago (e.g. 21:14 = 9:14 PM)
const eveningOf = (d: number, hh: number, mm: number) => {
  const dt = daysAgo(d);
  dt.setHours(hh, mm, 0, 0);
  return dt;
};

async function main() {
  // Wipe in FK-safe order
  await prisma.message.deleteMany();
  await prisma.followUp.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.photo.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.sourceSetting.deleteMany();
  await prisma.template.deleteMany();
  await prisma.businessHours.deleteMany();
  await prisma.scheduleBlock.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  await prisma.dealership.deleteMany();

  // ---------------------------------------------------------------
  // Tenant + login
  // ---------------------------------------------------------------
  const dealership = await prisma.dealership.create({
    data: {
      name: "Fox Valley Auto Sales",
      slug: "fox-valley-auto",
      city: "Appleton",
      state: "WI",
      phone: "(920) 555-0100",
      email: "sales@foxvalleyauto.com",
      reviewUrl: "https://g.page/r/fox-valley-auto/review",
    },
  });
  const dealershipId = dealership.id;

  await prisma.user.create({
    data: {
      email: DEMO_EMAIL,
      name: "Dale Vandenberg",
      passwordHash: await hashPassword(DEMO_PASSWORD),
      role: "owner",
      dealershipId,
    },
  });

  // A salesperson, so the demo shows what staff can and can't do: Dale sees
  // Settings → Team, Jordan doesn't.
  await prisma.user.create({
    data: {
      email: DEMO_STAFF_EMAIL,
      name: "Jordan Reyes",
      passwordHash: await hashPassword(DEMO_PASSWORD),
      role: "staff",
      dealershipId,
    },
  });

  // A second tenant with its own vehicle, so cross-tenant isolation is provable.
  const other = await prisma.dealership.create({
    data: { name: "Lakeshore Motors", slug: "lakeshore-motors", city: "Oshkosh", state: "WI" },
  });
  await prisma.user.create({
    data: {
      email: "owner@lakeshoremotors.com",
      name: "Pat Lakeshore",
      passwordHash: await hashPassword(DEMO_PASSWORD),
      role: "owner",
      dealershipId: other.id,
    },
  });
  await prisma.vehicle.create({
    data: {
      dealershipId: other.id,
      vin: "OTHERTENANT000001",
      year: 2020,
      make: "Toyota",
      model: "Tacoma",
      trim: "SR5",
      mileage: 51000,
      cost: 24000,
      price: 29995,
      status: "available",
      bodyStyle: "TRUCK",
      exteriorColor: "Silver",
      transmission: "AUTOMATIC",
      fuelType: "GASOLINE",
      acquiredAt: daysAgo(10),
    },
  });

  // ---------------------------------------------------------------
  // 14 vehicles — a real Fox Valley independent lot
  // ---------------------------------------------------------------
  const vehicleData = [
    { vin: "1FTFW1ET5EFA10234", year: 2016, make: "Ford", model: "F-150", trim: "XLT SuperCrew 4x4", mileage: 98432, cost: 14200, price: 18995, status: "available", acquiredAt: daysAgo(22) },
    { vin: "3GCUKREC1FG204851", year: 2015, make: "Chevrolet", model: "Silverado 1500", trim: "LT Double Cab", mileage: 112870, cost: 12800, price: 16750, status: "available", acquiredAt: daysAgo(41) },
    { vin: "2GNALBEK4E6294103", year: 2017, make: "Chevrolet", model: "Equinox", trim: "LT AWD", mileage: 87215, cost: 8900, price: 11995, status: "available", acquiredAt: daysAgo(12) },
    { vin: "4S4BSANC8J3287410", year: 2018, make: "Subaru", model: "Outback", trim: "2.5i Premium", mileage: 76540, cost: 13500, price: 17450, status: "available", acquiredAt: daysAgo(8) },
    { vin: "2C4RDGCG5ER384920", year: 2014, make: "Dodge", model: "Grand Caravan", trim: "SXT", mileage: 128340, cost: 4800, price: 6995, status: "available", acquiredAt: daysAgo(67) },
    { vin: "5J6RW2H85KL003471", year: 2019, make: "Honda", model: "CR-V", trim: "EX AWD", mileage: 54210, cost: 17800, price: 21995, status: "available", acquiredAt: daysAgo(5) },
    { vin: "1FTEW1EP3JFB58204", year: 2018, make: "Ford", model: "F-150", trim: "Lariat SuperCrew", mileage: 84920, cost: 19500, price: 23995, status: "pending", acquiredAt: daysAgo(35) },
    { vin: "3GNAXKEV1LL229834", year: 2020, make: "Chevrolet", model: "Equinox", trim: "LS FWD", mileage: 43850, cost: 14100, price: 17995, status: "available", acquiredAt: daysAgo(19) },
    { vin: "4S4BTAAC4M3178452", year: 2021, make: "Subaru", model: "Outback", trim: "Base CVT", mileage: 38470, cost: 18900, price: 23450, status: "available", acquiredAt: daysAgo(3) },
    { vin: "2C4RDGBG9GR192837", year: 2016, make: "Dodge", model: "Grand Caravan", trim: "SE Plus", mileage: 104520, cost: 6200, price: 8995, status: "recon", acquiredAt: daysAgo(6) },
    { vin: "5J6RW1H53HL014392", year: 2017, make: "Honda", model: "CR-V", trim: "LX AWD", mileage: 91230, cost: 12400, price: 15995, status: "available", acquiredAt: daysAgo(52) },
    { vin: "1GCVKREC7FZ318209", year: 2015, make: "Chevrolet", model: "Silverado 1500", trim: "LS Regular Cab", mileage: 132480, cost: 9200, price: 12495, status: "available", acquiredAt: daysAgo(74) },
    { vin: "1FMCU9GD4KUA47281", year: 2019, make: "Ford", model: "Escape", trim: "SE 4WD", mileage: 62340, cost: 12900, price: 16495, status: "sold", acquiredAt: daysAgo(48) },
    { vin: "4T1B11HK1KU203847", year: 2019, make: "Toyota", model: "Camry", trim: "LE", mileage: 58920, cost: 15200, price: 18995, status: "sold", acquiredAt: daysAgo(88) },
  ];

  // Meta's vehicle catalog feed requires body style, color, transmission, and
  // fuel type — a vehicle missing any of them is dropped from the feed. Derived
  // from the model rather than hand-typed on 14 rows.
  const BODY_STYLES: Record<string, string> = {
    "F-150": "TRUCK",
    "Silverado 1500": "TRUCK",
    Tacoma: "TRUCK",
    "Grand Caravan": "MINIVAN",
    Camry: "SEDAN",
    Outback: "WAGON",
  };
  const COLORS = ["White", "Silver", "Black", "Gray", "Blue", "Dark Red", "Green"];
  const specsFor = (model: string, i: number) => ({
    bodyStyle: BODY_STYLES[model] ?? "SUV",
    exteriorColor: COLORS[i % COLORS.length],
    transmission: "AUTOMATIC",
    fuelType: "GASOLINE",
  });

  const vehicles = [] as { id: string; year: number; make: string; model: string }[];
  for (const [i, v] of vehicleData.entries()) {
    // Most available vehicles are already syndicated (feeds the time-saved counter)
    const listed = v.status === "available" || v.status === "pending" || v.status === "sold";
    const listedAt = listed ? new Date(v.acquiredAt.getTime() + 2 * 86_400_000) : null;
    const created = await prisma.vehicle.create({
      data: {
        ...v,
        ...specsFor(v.model, i),
        dealershipId,
        listedWebsiteAt: listedAt,
        listedFacebookAt: listedAt ? new Date(listedAt.getTime() + 4 * 60_000) : null,
        listedCraigslistAt: listedAt ? new Date(listedAt.getTime() + 9 * 60_000) : null,
      },
    });
    vehicles.push({ id: created.id, year: v.year, make: v.make, model: v.model });
    void i;
  }
  const byModel = (model: string, idx = 0) =>
    vehicles.filter((v) => v.model === model)[idx] ?? vehicles[0];

  // ---------------------------------------------------------------
  // 25 customers — Wisconsin names & towns
  // ---------------------------------------------------------------
  const customerData: [string, string][] = [
    ["Dale Vandenberg", "Appleton"], ["Karen Schmitt", "Neenah"], ["Troy Kaufman", "Kaukauna"],
    ["Brenda Olszewski", "Oshkosh"], ["Gary Hietpas", "Little Chute"], ["Susan Vanderloop", "Appleton"],
    ["Mike Jansen", "Menasha"], ["Deb Kowalski", "Oshkosh"], ["Randy Verhagen", "Kaukauna"],
    ["Linda Baumgartner", "Neenah"], ["Scott Wierzba", "Appleton"], ["Peggy Lamers", "Kimberly"],
    ["Kevin Schroeder", "Oshkosh"], ["Cindy Van Handel", "Appleton"], ["Tom Reinke", "Neenah"],
    ["Barb Nowak", "Menasha"], ["Jeff Coenen", "Kaukauna"], ["Diane Pfeifer", "Oshkosh"],
    ["Steve Gerrits", "Appleton"], ["Nancy Krueger", "Neenah"], ["Paul Vandehey", "Little Chute"],
    ["Carol Steffen", "Oshkosh"], ["Brian Mielke", "Appleton"], ["Judy Hammen", "Kimberly"],
    ["Rick Van Zeeland", "Kaukauna"],
  ];
  const customers = [] as { id: string; name: string }[];
  for (const [i, [name, town]] of customerData.entries()) {
    const c = await prisma.customer.create({
      data: {
        dealershipId,
        name,
        town,
        phone: `(920) 5${String(10 + i).padStart(2, "0")}-${String(1000 + i * 37).slice(0, 4)}`,
        email: `${name.toLowerCase().replace(/[^a-z]+/g, ".")}@gmail.com`,
        lastContactAt: daysAgo(10 + i * 9),
      },
    });
    customers.push({ id: c.id, name });
  }

  // ---------------------------------------------------------------
  // 12 completed deals over the past 6 months
  // ---------------------------------------------------------------
  const dealSpecs: [number, number, number, number][] = [
    // [customerIdx, vehicleIdx, price, daysAgo]
    [0, 12, 16495, 9], [1, 13, 18995, 26], [2, 0, 17500, 44], [3, 5, 21200, 58],
    [4, 3, 16900, 73], [5, 7, 17200, 88], [6, 10, 15400, 102], [7, 2, 11500, 118],
    [8, 1, 16100, 133], [9, 8, 22800, 147], [10, 4, 6800, 160], [11, 11, 12100, 175],
  ];
  // Older purchases (24+ months ago) — these power the Revenue Radar panel.
  const olderDealSpecs: [number, number, number, number][] = [
    [12, 13, 17200, 745], [13, 12, 14900, 812], [14, 6, 21400, 890],
    [15, 9, 8200, 960], [16, 10, 13800, 1030],
  ];
  dealSpecs.push(...olderDealSpecs);
  for (const [ci, vi, price, d] of dealSpecs) {
    await prisma.deal.create({
      data: {
        customerId: customers[ci].id,
        vehicleId: vehicles[vi].id,
        price,
        closedAt: daysAgo(d),
      },
    });
  }

  // ---------------------------------------------------------------
  // Follow-ups (some scheduled, some sent)
  // ---------------------------------------------------------------
  const followUps = [
    { ci: 0, type: "thankyou", status: "scheduled", scheduledFor: new Date(now.getTime() + 2 * 86_400_000), sentAt: null },
    { ci: 1, type: "thankyou", status: "sent", scheduledFor: daysAgo(23), sentAt: daysAgo(23) },
    { ci: 2, type: "checkin", status: "scheduled", scheduledFor: new Date(now.getTime() + 86_400_000), sentAt: null },
    { ci: 4, type: "checkin", status: "sent", scheduledFor: daysAgo(2), sentAt: daysAgo(2) },
    { ci: 6, type: "checkin", status: "sent", scheduledFor: daysAgo(7), sentAt: daysAgo(7) },
    { ci: 7, type: "tradein", status: "sent", scheduledFor: daysAgo(4), sentAt: daysAgo(4) },
    { ci: 9, type: "tradein", status: "scheduled", scheduledFor: new Date(now.getTime() + 3 * 86_400_000), sentAt: null },
    { ci: 5, type: "thankyou", status: "sent", scheduledFor: daysAgo(85), sentAt: daysAgo(85) },
    { ci: 8, type: "checkin", status: "sent", scheduledFor: daysAgo(12), sentAt: daysAgo(12) },
    { ci: 10, type: "tradein", status: "sent", scheduledFor: daysAgo(9), sentAt: daysAgo(9) },
    { ci: 3, type: "thankyou", status: "sent", scheduledFor: daysAgo(55), sentAt: daysAgo(55) },
    { ci: 11, type: "checkin", status: "sent", scheduledFor: daysAgo(1), sentAt: daysAgo(1) },
  ];
  for (const f of followUps) {
    await prisma.followUp.create({
      data: {
        customerId: customers[f.ci].id,
        type: f.type,
        status: f.status,
        scheduledFor: f.scheduledFor,
        sentAt: f.sentAt,
      },
    });
  }

  // ---------------------------------------------------------------
  // 40 leads across sources, several after hours
  // ---------------------------------------------------------------
  const firstNames = ["Josh", "Amber", "Tyler", "Megan", "Chad", "Katie", "Derek", "Sarah", "Brandon", "Emily", "Justin", "Heather", "Cory", "Jess", "Matt", "Alyssa", "Nick", "Rachel", "Zach", "Molly", "Aaron", "Beth", "Dustin", "Erin", "Kyle", "Dana", "Travis", "Holly", "Shane", "Lisa", "Curt", "Jenna", "Wes", "Tara", "Logan", "Kim", "Drew", "Sam"];
  const lastNames = ["Peterson", "Vandervelde", "Schultz", "Behnke", "Miller", "Thompson", "Wolf", "Bergstrom", "Kraus", "Hoffman", "Delwiche", "Sanders", "Riehl", "Otto", "Green", "Fischer", "Lom", "Bauer", "Kappell", "Simon", "Doering", "Weber", "Grant", "Radtke", "Voss", "Ebert", "Klein", "Mayer", "Falk", "Neuman", "Boldt", "Sipple", "Hein", "Grimm", "Prell", "Stark", "Roth", "Beck"];
  const sources = ["facebook", "website", "phone", "walkin", "craigslist"];
  const questions = [
    (v: string) => `Is the ${v} still available?`,
    (v: string) => `What's your best price on the ${v}?`,
    (v: string) => `Does the ${v} have any rust underneath? Wisconsin winters, you know how it is.`,
    (v: string) => `Can I take the ${v} for a test drive this weekend?`,
    (v: string) => `Would you take a trade-in toward the ${v}? I've got a 2012 Impala.`,
    (v: string) => `How many owners has the ${v} had? Any accidents on the Carfax?`,
    (v: string) => `Do you do in-house financing on the ${v}?`,
    (v: string) => `Is the price on the ${v} negotiable if I pay cash?`,
  ];

  // The money-shot lead: after-hours, auto-answered at 9:14 PM, booked a test drive.
  const crv = byModel("CR-V", 0);
  const moneyLead = await prisma.lead.create({
    data: {
      dealershipId,
      name: "Amber Vandervelde",
      contact: "amber.vv@gmail.com",
      source: "facebook",
      status: "booked",
      unread: false,
      afterHours: true,
      autoHandled: true,
      vehicleId: crv.id,
      createdAt: eveningOf(1, 21, 12), // 9:12 PM yesterday
    },
  });
  const moneyMsgs = [
    ["customer", "Hi! Is the 2019 CR-V EX still available? Just saw it on Marketplace.", eveningOf(1, 21, 12)],
    ["ai", "Hi Amber! Yes, the 2019 Honda CR-V EX AWD is still available — 54,210 miles, listed at $21,995. It's one of the cleanest CR-Vs we've had this year. Would tomorrow at 10:00 AM or 4:30 PM work for a test drive? Also, will you be trading anything in?", eveningOf(1, 21, 14)],
    ["customer", "Wow, quick reply! 4:30 works great. No trade-in.", eveningOf(1, 21, 22)],
    ["ai", "Perfect — you're booked for 4:30 PM tomorrow. We'll have the CR-V pulled up front and ready. See you then!", eveningOf(1, 21, 23)],
  ] as const;
  for (const [sender, body, at] of moneyMsgs) {
    await prisma.message.create({
      data: { leadId: moneyLead.id, sender, body, createdAt: at as Date },
    });
  }

  // A second auto-pilot after-hours conversation
  const f150 = byModel("F-150", 0);
  const auto2 = await prisma.lead.create({
    data: {
      dealershipId,
      name: "Derek Kraus",
      contact: "(920) 555-0184",
      source: "website",
      status: "replied",
      unread: false,
      afterHours: true,
      autoHandled: true,
      vehicleId: f150.id,
      createdAt: eveningOf(2, 22, 41), // 10:41 PM two days ago
    },
  });
  for (const [sender, body, at] of [
    ["customer", "Does the 2016 F-150 XLT have the tow package? Looking to pull a 6000lb camper.", eveningOf(2, 22, 41)],
    ["ai", "Hi Derek! The 2016 F-150 XLT SuperCrew has the 3.5L EcoBoost with the factory tow package — rated for up to 10,700 lbs, so your 6,000 lb camper is well within range. Want to come see it? I have Thursday at 9:00 AM or Friday at 5:00 PM open. Are you looking to finance or pay cash?", eveningOf(2, 22, 43)],
  ] as const) {
    await prisma.message.create({
      data: { leadId: auto2.id, sender, body, createdAt: at as Date },
    });
  }

  // Fresh unread leads for the "3 leads need you" dashboard item
  const freshSpecs = [
    { name: "Josh Peterson", contact: "(920) 555-0142", source: "facebook", vi: 3, minsAgo: 14, q: questions[0] },
    { name: "Katie Behnke", contact: "katie.behnke@yahoo.com", source: "website", vi: 8, minsAgo: 47, q: questions[3] },
    { name: "Tyler Schultz", contact: "(920) 555-0173", source: "phone", vi: 1, minsAgo: 96, q: questions[4] },
  ];
  for (const s of freshSpecs) {
    const v = vehicles[s.vi];
    const lead = await prisma.lead.create({
      data: {
        dealershipId,
        name: s.name,
        contact: s.contact,
        source: s.source,
        status: "new",
        unread: true,
        afterHours: false,
        vehicleId: v.id,
        createdAt: minutesAgo(s.minsAgo),
      },
    });
    await prisma.message.create({
      data: {
        leadId: lead.id,
        sender: "customer",
        body: s.q(`${v.year} ${v.make} ${v.model}`),
        createdAt: minutesAgo(s.minsAgo),
      },
    });
  }

  // Remaining 35 leads spread over the past 45 days
  let nameIdx = 0;
  for (let i = 0; i < 35; i++) {
    const v = vehicles[i % vehicles.length];
    const source = sources[i % sources.length];
    // ~30% after hours (8 PM – midnight)
    const isAfterHours = i % 3 === 0;
    const d = 1 + Math.floor((i / 35) * 168); // spread across ~6 months
    const createdAt = isAfterHours
      ? eveningOf(d, 20 + (i % 4), (i * 13) % 60)
      : (() => { const t = daysAgo(d); t.setHours(9 + (i % 9), (i * 17) % 60, 0, 0); return t; })();
    const name = `${firstNames[nameIdx % firstNames.length]} ${lastNames[(nameIdx * 7 + 3) % lastNames.length]}`;
    nameIdx++;
    const status = i % 5 === 0 ? "new" : i % 5 === 1 ? "replied" : i % 5 === 2 ? "booked" : "closed";
    const lead = await prisma.lead.create({
      data: {
        dealershipId,
        name,
        contact: i % 2 === 0 ? `(920) 555-0${String(200 + i)}` : `${name.toLowerCase().replace(/[^a-z]+/g, ".")}@gmail.com`,
        source,
        status,
        unread: status === "new" && i % 10 === 0,
        afterHours: isAfterHours,
        autoHandled: isAfterHours && i % 6 === 0,
        vehicleId: v.id,
        createdAt,
      },
    });
    await prisma.message.create({
      data: {
        leadId: lead.id,
        sender: "customer",
        body: questions[i % questions.length](`${v.year} ${v.make} ${v.model}`),
        createdAt,
      },
    });
    if (status !== "new") {
      await prisma.message.create({
        data: {
          leadId: lead.id,
          sender: lead.autoHandled ? "ai" : "owner",
          body: `Thanks for reaching out! Yes, the ${v.year} ${v.make} ${v.model} is on the lot. Happy to set up a time for you to come take a look — what works for your schedule?`,
          createdAt: new Date(createdAt.getTime() + (lead.autoHandled ? 2 : 640) * 60_000),
        },
      });
    }
  }

  // ---------------------------------------------------------------
  // Business hours, schedule blocks, listing templates
  // ---------------------------------------------------------------
  const hours: [number, string | null, string | null][] = [
    [0, null, null],        // Sunday — closed
    [1, "08:00", "18:00"],
    [2, "08:00", "18:00"],
    [3, "08:00", "18:00"],
    [4, "08:00", "18:00"],
    [5, "08:00", "18:00"],
    [6, "09:00", "15:00"],  // Saturday
  ];
  for (const [weekday, open, close] of hours) {
    await prisma.businessHours.create({ data: { dealershipId, weekday, open, close } });
  }

  // Two upcoming calendar blocks (Outlook-style) that slot suggestions must avoid
  const nextWeekday = (target: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() + ((target - d.getDay() + 7) % 7 || 7));
    return d;
  };
  const thu = nextWeekday(4);
  thu.setHours(9, 0, 0, 0);
  const thuEnd = new Date(thu);
  thuEnd.setHours(12, 0, 0, 0);
  await prisma.scheduleBlock.create({
    data: { dealershipId, title: "Auction run — Milwaukee", startsAt: thu, endsAt: thuEnd },
  });
  const fri = nextWeekday(5);
  fri.setHours(15, 0, 0, 0);
  const friEnd = new Date(fri);
  friEnd.setHours(18, 0, 0, 0);
  await prisma.scheduleBlock.create({
    data: { dealershipId, title: "Out of office", startsAt: fri, endsAt: friEnd },
  });

  await prisma.template.create({
    data: {
      dealershipId,
      name: "Dale's straight shooter",
      channel: "description",
      body: `{{year}} {{make}} {{model}} {{trim}} — {{mileage}} miles, \${{price}}.

Serviced and inspected in our own shop before it hit the lot. Fresh oil change, tires and brakes checked. Clean title, history report on the screen while you're here. No stories, no surprises.

Cash, trade, or financing — all welcome. Stop by for a no-pressure test drive. Fox Valley Auto Sales, Appleton. VIN {{vin}}.`,
    },
  });
  await prisma.template.create({
    data: {
      dealershipId,
      name: "Family friendly",
      channel: "description",
      body: `Looking for a dependable {{make}} {{model}} for the family? This {{year}} {{trim}} has {{mileage}} well-cared-for miles and is ready for school runs, up-north weekends, and Wisconsin winters.

We went through it bumper to bumper in our own shop, and we'll walk you through everything we found — good and bad. Priced at \${{price}}.

Family owned, and we're here after the sale too. Come take it for a spin!`,
    },
  });
  await prisma.template.create({
    data: {
      dealershipId,
      name: "Dale's Facebook style",
      channel: "facebook",
      body: `🔥 {{year}} {{make}} {{model}} — \${{price}} 🔥
✅ {{mileage}} miles
✅ Inspected in our own shop
✅ Clean title
📍 Fox Valley Auto, Appleton — DM us or stop by!`,
    },
  });
  await prisma.template.create({
    data: {
      dealershipId,
      name: "Dale's Craigslist style",
      channel: "craigslist",
      body: `{{year}} {{make}} {{model}} {{trim}} - \${{price}} (Appleton)

{{mileage}} miles. Clean title. Serviced in our shop before listing.

No-pressure test drives. Trades considered. Financing available.
Fox Valley Auto Sales. VIN {{vin}}.`,
    },
  });

  // Auto-pilot source settings
  for (const source of sources) {
    await prisma.sourceSetting.create({
      data: { dealershipId, source, autoPilot: source === "facebook" || source === "website" },
    });
  }

  const counts = {
    vehicles: await prisma.vehicle.count(),
    customers: await prisma.customer.count(),
    leads: await prisma.lead.count(),
    deals: await prisma.deal.count(),
    messages: await prisma.message.count(),
  };
  console.log("Seeded:", counts);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
