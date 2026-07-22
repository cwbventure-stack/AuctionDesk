// Thin server-side wrapper around the Anthropic API.
// MOCK_AI=true (or a missing ANTHROPIC_API_KEY) returns realistic canned
// responses built from the actual vehicle/customer data, so the demo runs
// flawlessly offline. Real calls also fall back to mock on any error —
// nothing may look broken during a live demo.
import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-sonnet-4-6";
const DEALERSHIP = "Fox Valley Auto Sales";

function useMock() {
  return process.env.MOCK_AI === "true" || !process.env.ANTHROPIC_API_KEY;
}

async function callClaude(system: string, user: string): Promise<string> {
  const client = new Anthropic();
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 2000,
    system,
    messages: [{ role: "user", content: user }],
  });
  const block = response.content.find((b) => b.type === "text");
  if (!block || block.type !== "text") throw new Error("No text in response");
  return block.text;
}

export interface VehicleInput {
  year: number;
  make: string;
  model: string;
  trim: string;
  mileage: number;
  price: number;
  vin: string;
}

export interface GeneratedListing {
  description: string;
  facebook: string;
  craigslist: string;
  shotList: string[];
}

export interface ListingTemplate {
  name: string;
  body: string;
}

// Fills a dealer-defined template with the vehicle's data. Supported
// placeholders: {{year}} {{make}} {{model}} {{trim}} {{mileage}} {{price}} {{vin}}
export function renderTemplate(body: string, v: VehicleInput): string {
  const values: Record<string, string> = {
    year: String(v.year),
    make: v.make,
    model: v.model,
    trim: v.trim,
    mileage: v.mileage.toLocaleString(),
    price: v.price.toLocaleString(),
    vin: v.vin,
  };
  return body.replace(/\{\{\s*(\w+)\s*\}\}/g, (m, key: string) => values[key.toLowerCase()] ?? m);
}

// One optional template per posting channel — a dealer might want a plain,
// detail-heavy voice for their website description but a punchy, emoji-heavy
// voice for Facebook, and something else again for Craigslist.
export interface ListingTemplates {
  description?: ListingTemplate | null;
  facebook?: ListingTemplate | null;
  craigslist?: ListingTemplate | null;
}

export async function generateListing(
  v: VehicleInput,
  templates?: ListingTemplates,
): Promise<GeneratedListing> {
  const mock = mockListing(v, templates);
  if (useMock()) return mock;
  try {
    const fieldNotes = (["description", "facebook", "craigslist"] as const)
      .map((field) => {
        const t = templates?.[field];
        if (!t) return null;
        return `For "${field}", the dealer has a personal template named "${t.name}" — follow its structure, tone, and wording as closely as possible, filling in this vehicle's real data:\n---\n${renderTemplate(t.body, v)}\n---`;
      })
      .filter((n): n is string => !!n);
    const templateInstruction = fieldNotes.length ? ` ${fieldNotes.join(" ")}` : "";
    const raw = await callClaude(
      `You write vehicle listings for ${DEALERSHIP}, a small independent used-car dealership in Appleton, Wisconsin. Honest, warm, no hype that can't be backed up.${templateInstruction} Respond ONLY with JSON matching: {"description": string (about 120 words), "facebook": string (short, friendly, a few tasteful emoji), "craigslist": string (plain text, no emoji, includes price and mileage), "shotList": string[] (exactly 5 photo shots to take)}.`,
      `Write the listing set for: ${v.year} ${v.make} ${v.model} ${v.trim}, ${v.mileage.toLocaleString()} miles, asking $${v.price.toLocaleString()}, VIN ${v.vin}.`,
    );
    const json = JSON.parse(raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1));
    return {
      description: json.description ?? mock.description,
      facebook: json.facebook ?? mock.facebook,
      craigslist: json.craigslist ?? mock.craigslist,
      shotList: Array.isArray(json.shotList) && json.shotList.length ? json.shotList : mock.shotList,
    };
  } catch {
    return mock;
  }
}

function mockListing(v: VehicleInput, templates?: ListingTemplates): GeneratedListing {
  const title = `${v.year} ${v.make} ${v.model} ${v.trim}`;
  const miles = v.mileage.toLocaleString();
  const price = v.price.toLocaleString();
  return {
    description: templates?.description
      ? renderTemplate(templates.description.body, v)
      : `Looking for a ${v.make} that's ready for Wisconsin roads? This ${title} has ${miles} well-maintained miles and it shows. Clean inside and out, serviced and inspected by our own shop before it hit the lot — fresh oil change, tires checked, brakes verified. It starts strong on cold mornings and everything works the way it should. No stories, no surprises: we'll pull the history report up on the screen while you're here. At $${price}, it's priced to move against anything comparable between Appleton and Oshkosh. Stop by for a no-pressure test drive — kick the tires, bring your mechanic if you like. Family owned, and we're here after the sale too.`,
    facebook: templates?.facebook
      ? renderTemplate(templates.facebook.body, v)
      : `🚗 ${title} — $${price}\n✅ ${miles} miles, clean & serviced\n✅ Inspected in our own shop\n✅ Cold-weather ready\n📍 Appleton, WI — easy to find, easy to deal with\nMessage us to set up a test drive this week! 🤝`,
    craigslist: templates?.craigslist
      ? renderTemplate(templates.craigslist.body, v)
      : `${title} - $${price} (Appleton)\n\n${miles} miles. Clean title. Serviced and inspected in our shop: fresh oil change, tires and brakes checked. Runs and drives excellent.\n\nNo-pressure test drives welcome. Trade-ins considered. Financing available.\n\nFox Valley Auto Sales — family owned, Appleton WI. Call or text to schedule a look.\nVIN: ${v.vin}`,
    shotList: [
      "Front 3/4 angle in open daylight (no buildings in background)",
      "Full interior from driver's door — seats and dash visible",
      "Odometer close-up showing actual mileage",
      "Tire tread close-up on the front driver side",
      "Engine bay, straight down, after a quick wipe-down",
    ],
  };
}

export interface ReplyInput {
  leadName: string;
  question: string;
  vehicle: (VehicleInput & { status: string }) | null;
  // Concrete open slots from the dealer's actual schedule (business hours minus
  // calendar blocks) — see lib/schedule.ts.
  slots: string[];
}

export async function draftReply(input: ReplyInput): Promise<string> {
  const mock = mockReply(input);
  if (useMock()) return mock;
  try {
    return await callClaude(
      `You answer customer leads for ${DEALERSHIP}, a small used-car lot in Appleton, Wisconsin. Friendly and helpful, never pushy. Rules: answer their actual question using the vehicle data provided; offer exactly these two test-drive time slots (they come from the owner's real calendar): ${input.slots.join(" or ")}; ask exactly one qualifying question (trade-in, financing, or timeline) that they haven't already answered. Keep it under 90 words. Plain text only.`,
      `Lead name: ${input.leadName}\nTheir message: "${input.question}"\nVehicle: ${
        input.vehicle
          ? `${input.vehicle.year} ${input.vehicle.make} ${input.vehicle.model} ${input.vehicle.trim}, ${input.vehicle.mileage.toLocaleString()} miles, $${input.vehicle.price.toLocaleString()}, status: ${input.vehicle.status}`
          : "not specified"
      }`,
    );
  } catch {
    return mock;
  }
}

// Demo-mode reply: varies with what the customer actually asked, so drafts
// don't all read the same. Production (MOCK_AI=false) uses the real model.
function mockReply({ leadName, question, vehicle, slots }: ReplyInput): string {
  const first = leadName.split(" ")[0];
  const offer = `I have ${slots[0] ?? "tomorrow at 10:00 AM"} or ${slots[1] ?? "tomorrow at 4:30 PM"} open`;
  if (!vehicle) {
    return `Hi ${first}! Thanks for reaching out. Happy to help — could you let me know which vehicle caught your eye? ${offer} for a test drive. Also, will you have a trade-in?`;
  }
  const title = `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim}`;
  const miles = vehicle.mileage.toLocaleString();
  const price = vehicle.price.toLocaleString();
  const q = question.toLowerCase();

  if (/rust|underneath|undercarriage|frame/.test(q)) {
    return `Hi ${first}! Fair question — Wisconsin winters are no joke. We put the ${title} on the hoist during our inspection: the frame and rockers are solid, with only light surface rust typical for the year, nothing structural. Come look underneath yourself — ${offer}. Would you be trading anything in?`;
  }
  if (/tow|pull|camper|trailer|haul/.test(q)) {
    return `Hi ${first}! The ${title} is well suited for towing — we'll pull the exact factory tow rating up for you and check the hitch wiring together. It has ${miles} miles and is listed at $${price}. Want to see it in person? ${offer}. What are you planning to pull with it?`;
  }
  if (/financ|payment|monthly|credit/.test(q)) {
    return `Hi ${first}! Yes — we work with several local lenders and can usually have an answer the same day, whatever your credit story is. The ${title} is $${price}, and payments on that typically land in a comfortable range. Easiest is to run real numbers in person — ${offer}. What kind of monthly payment are you aiming for?`;
  }
  if (/trade/.test(q)) {
    return `Hi ${first}! Absolutely, we take trades — and we'll give you a real number on your vehicle, not a lowball. The ${title} is listed at $${price} with ${miles} miles. Bring your trade by and we'll appraise it while you test drive: ${offer}. Are you looking to finance the difference or pay cash?`;
  }
  if (/cash|negotiable|best price|obo|lower|deal/.test(q)) {
    return `Hi ${first}! We price to sell — the ${title} is at $${price}, which is sharp for ${miles} miles in this market. That said, come drive it and let's talk like neighbors; cash does make things simple. ${offer}. When are you hoping to have your next vehicle in the driveway?`;
  }
  if (/owner|carfax|history|accident/.test(q)) {
    return `Hi ${first}! Good question — we'll pull the full history report up on the screen for you, no charge. The ${title} shows a clean title, and it went through our own shop inspection before hitting the lot. Come see the report and the truck together: ${offer}. Will you have a trade-in?`;
  }
  if (/test drive|come see|take it for|this weekend|stop by/.test(q)) {
    return `Hi ${first}! You bet — the ${title} is ready to drive: ${miles} miles, $${price}, fully inspected in our shop. ${offer}, and we'll have it pulled up front for you. Are you financing or paying cash?`;
  }
  return `Hi ${first}! Great question — the ${title} is ${
    vehicle.status === "available" ? "still available" : "getting a lot of attention, so don't wait"
  }: ${miles} miles, listed at $${price}, and it's been through our shop with a full inspection. Want to take it for a spin? ${offer}. Will you be trading anything in?`;
}

export interface OutreachInput {
  customerName: string;
  town: string;
  vehicle: string; // e.g. "2019 Ford Escape SE"
  purchaseDate: Date;
  type: "thankyou" | "checkin" | "tradein";
  estimatedEquity?: number;
}

export async function draftOutreach(input: OutreachInput): Promise<string> {
  const mock = mockOutreach(input);
  if (useMock()) return mock;
  try {
    const goal =
      input.type === "thankyou"
        ? "a 3-day post-sale thank-you that asks for a Google review (include the placeholder link https://g.page/r/fox-valley-auto/review)"
        : input.type === "checkin"
          ? "a 6-month friendly check-in offering a free multi-point inspection"
          : `a re-engagement message noting their trade-in is likely worth more than they think (estimated equity around $${(input.estimatedEquity ?? 4000).toLocaleString()})`;
    return await callClaude(
      `You write short follow-up texts for ${DEALERSHIP} in Appleton, Wisconsin. Warm, personal, small-town tone. Under 70 words. Plain text. Sign off as "Fox Valley Auto".`,
      `Write ${goal}. Customer: ${input.customerName} from ${input.town}. Vehicle purchased: ${input.vehicle} on ${input.purchaseDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}.`,
    );
  } catch {
    return mock;
  }
}

function mockOutreach({ customerName, town, vehicle, purchaseDate, type, estimatedEquity }: OutreachInput): string {
  const first = customerName.split(" ")[0];
  const when = purchaseDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  switch (type) {
    case "thankyou":
      return `Hi ${first}, thanks again for choosing us for your ${vehicle} — it was a pleasure! If everything's running great, would you take 30 seconds to leave us a Google review? It means the world to a small shop like ours: https://g.page/r/fox-valley-auto/review — Fox Valley Auto`;
    case "checkin":
      return `Hi ${first}! Hard to believe it's been six months since you drove home in your ${vehicle}. How's it treating you? Swing by any time for a free multi-point inspection before winter — no appointment needed for ${town} neighbors. — Fox Valley Auto`;
    case "tradein":
      return `Hi ${first}, quick heads-up: used values are strong right now, and your ${vehicle} (purchased ${when}) could be worth around $${(estimatedEquity ?? 4000).toLocaleString()} in trade — more than most folks expect. If you've been thinking about an upgrade, this is a good moment. Want me to run real numbers? — Fox Valley Auto`;
  }
}
