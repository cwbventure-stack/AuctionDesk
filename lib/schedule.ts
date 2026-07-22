import { prisma } from "@/lib/prisma";

// Suggests concrete test-drive slots inside business hours, skipping any
// calendar blocks (out of office, auction runs, ...). One slot per day so
// customers always get a choice of days, alternating morning/afternoon.
const PREFERRED_TIMES = [
  ["10:00", "16:30", "13:30"],
  ["16:30", "10:00", "13:30"],
];

function parseTime(base: Date, hhmm: string): Date {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date(base);
  d.setHours(h, m, 0, 0);
  return d;
}

function labelFor(slot: Date, daysOut: number): string {
  const time = slot.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  if (daysOut === 1) return `tomorrow at ${time}`;
  const weekday = slot.toLocaleDateString("en-US", { weekday: "long" });
  return `${weekday} at ${time}`;
}

export async function nextTestDriveSlots(dealershipId: string, count = 2): Promise<string[]> {
  try {
    const [hours, blocks] = await Promise.all([
      prisma.businessHours.findMany({ where: { dealershipId } }),
      prisma.scheduleBlock.findMany({
        where: { dealershipId, endsAt: { gte: new Date() } },
      }),
    ]);
    const byDay = new Map(hours.map((h) => [h.weekday, h]));
    const out: string[] = [];

    for (let d = 1; d <= 10 && out.length < count; d++) {
      const base = new Date();
      base.setHours(0, 0, 0, 0);
      base.setDate(base.getDate() + d);
      const h = byDay.get(base.getDay());
      if (!h?.open || !h?.close) continue;

      const open = parseTime(base, h.open);
      const close = parseTime(base, h.close);
      for (const t of PREFERRED_TIMES[out.length % 2]) {
        const slot = parseTime(base, t);
        const end = new Date(slot.getTime() + 60 * 60_000); // 1-hour appointment
        if (slot < open || end > close) continue;
        const blocked = blocks.some(
          (b) => slot < new Date(b.endsAt) && end > new Date(b.startsAt),
        );
        if (blocked) continue;
        out.push(labelFor(slot, d));
        break; // one slot per day
      }
    }

    return out.length >= count
      ? out
      : [...out, "tomorrow at 10:00 AM", "tomorrow at 4:30 PM"].slice(0, count);
  } catch {
    return ["tomorrow at 10:00 AM", "tomorrow at 4:30 PM"];
  }
}
