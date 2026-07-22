import { OutreachButton } from "@/components/outreach-button";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { draftOutreach } from "@/lib/ai";
import { requireDealershipId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fullDate, money, timeAgo } from "@/lib/utils";
import { CalendarClock, Heart, Radar, RefreshCcw, Star } from "lucide-react";

export const dynamic = "force-dynamic";

const TWO_YEARS_MS = 24 * 30.44 * 86_400_000;

export default async function CustomersPage() {
  const dealershipId = await requireDealershipId();
  const customers = await prisma.customer.findMany({
    where: { dealershipId },
    include: {
      deals: { include: { vehicle: true }, orderBy: { closedAt: "desc" } },
      followUps: { orderBy: { scheduledFor: "desc" }, take: 1 },
    },
    orderBy: { name: "asc" },
  });

  const withDeals = customers.filter((c) => c.deals.length > 0);
  const sample = withDeals[0];
  const sampleVehicle = sample
    ? `${sample.deals[0].vehicle.year} ${sample.deals[0].vehicle.make} ${sample.deals[0].vehicle.model}`
    : "2019 Ford Escape SE";

  // Personalized previews for the three pre-built sequences (mock-mode: instant)
  const [thankyouPreview, checkinPreview, tradeinPreview] = await Promise.all(
    (["thankyou", "checkin", "tradein"] as const).map((type) =>
      draftOutreach({
        customerName: sample?.name ?? "Dale Vandenberg",
        town: sample?.town ?? "Appleton",
        vehicle: sampleVehicle,
        purchaseDate: sample?.deals[0]?.closedAt ?? new Date(),
        type,
        estimatedEquity: sample ? Math.round((sample.deals[0].price * 0.45) / 100) * 100 : 4000,
      }),
    ),
  );

  const sequences = [
    {
      type: "thankyou" as const,
      icon: Star,
      title: "3-day thank-you + review request",
      trigger: "3 days after every sale",
      accent: "bg-amber-50 text-amber-600",
      preview: thankyouPreview,
    },
    {
      type: "checkin" as const,
      icon: Heart,
      title: "6-month service check-in",
      trigger: "6 months after every sale",
      accent: "bg-emerald-50 text-emerald-600",
      preview: checkinPreview,
    },
    {
      type: "tradein" as const,
      icon: RefreshCcw,
      title: "“Your trade-in is worth more than you think”",
      trigger: "30 months after every sale",
      accent: "bg-blue-50 text-blue-600",
      preview: tradeinPreview,
    },
  ];

  // Revenue Radar: bought 24+ months ago
  const radar = withDeals
    .filter((c) => Date.now() - new Date(c.deals[0].closedAt).getTime() > TWO_YEARS_MS)
    .map((c) => ({
      ...c,
      equity: Math.round((c.deals[0].price * 0.45) / 100) * 100,
    }))
    .sort((a, b) => b.equity - a.equity);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Follow-Up Autopilot</h1>
        <p className="text-sm text-slate-500">
          Repeat business on purpose, not on luck — {withDeals.length} past buyers in your book.
        </p>
      </div>

      {/* Sequences */}
      <div className="grid gap-4 lg:grid-cols-3">
        {sequences.map((s) => (
          <Card key={s.type} className="flex flex-col">
            <CardHeader>
              <div className="flex items-center gap-2">
                <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.accent}`}>
                  <s.icon className="h-4 w-4" />
                </span>
                <div>
                  <CardTitle>{s.title}</CardTitle>
                  <p className="flex items-center gap-1 text-[11px] text-slate-400">
                    <CalendarClock className="h-3 w-3" /> {s.trigger} · automatic
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-3">
              <div className="flex-1 rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
                <p className="mb-1 font-medium text-slate-400">
                  Preview — personalized for {sample?.name.split(" ")[0] ?? "each customer"}:
                </p>
                “{s.preview}”
              </div>
              <Badge variant="green" className="self-start">
                Sequence active
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        {/* Revenue Radar */}
        <Card className="border-blue-200 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Radar className="h-4 w-4 text-blue-600" /> Revenue Radar
            </CardTitle>
            <p className="text-xs text-slate-500">
              Bought 24+ months ago — sitting on trade-in equity and probably shopping soon.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {radar.length === 0 ? (
              <p className="text-sm text-slate-400">No customers in the radar window yet.</p>
            ) : (
              radar.map((c) => (
                <div key={c.id} className="space-y-2 rounded-lg border border-slate-200 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{c.name}</p>
                      <p className="text-xs text-slate-500">
                        {c.deals[0].vehicle.year} {c.deals[0].vehicle.make} {c.deals[0].vehicle.model} ·{" "}
                        {fullDate(c.deals[0].closedAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-700">≈ {money(c.equity)}</p>
                      <p className="text-[10px] text-slate-400">est. trade equity</p>
                    </div>
                  </div>
                  <OutreachButton customerId={c.id} type="tradein" />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Customer list */}
        <Card className="overflow-hidden lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">Customers</CardTitle>
          </CardHeader>
          <div className="max-h-[560px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-slate-50">
                <tr className="border-b border-slate-200 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  <th className="px-4 py-2.5">Customer</th>
                  <th className="hidden px-4 py-2.5 sm:table-cell">Purchased</th>
                  <th className="px-4 py-2.5">Last contact</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60">
                    <td className="px-4 py-2.5">
                      <p className="font-medium text-slate-900">{c.name}</p>
                      <p className="text-xs text-slate-500">{c.town} · {c.phone}</p>
                    </td>
                    <td className="hidden px-4 py-2.5 sm:table-cell">
                      {c.deals[0] ? (
                        <>
                          <p className="text-slate-700">
                            {c.deals[0].vehicle.year} {c.deals[0].vehicle.make} {c.deals[0].vehicle.model}
                          </p>
                          <p className="text-xs text-slate-400">
                            {money(c.deals[0].price)} · {fullDate(c.deals[0].closedAt)}
                          </p>
                        </>
                      ) : (
                        <span className="text-xs text-slate-400">No purchase yet</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      {c.lastContactAt ? (
                        <span className="text-xs text-slate-600">{timeAgo(c.lastContactAt)}</span>
                      ) : (
                        <Badge variant="red">Never</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
