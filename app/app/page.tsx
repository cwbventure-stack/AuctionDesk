import { LeadsChart, type MonthBucket } from "@/components/leads-chart";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { daysOnLot } from "@/lib/utils";
import { AlarmClock, ArrowRight, Clock, Inbox, MessageSquareText, Send, TimerReset, TrendingDown } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const user = await requireUser();
  const dealershipId = user.dealershipId;

  const [allListed, afterHoursAnswered, followUpsSent, unreadLeads, vehicles, leads, scheduledFollowUps] =
    await Promise.all([
      prisma.vehicle.count({ where: { dealershipId, listedWebsiteAt: { not: null } } }),
      prisma.lead.count({ where: { dealershipId, autoHandled: true } }),
      prisma.followUp.count({ where: { status: "sent", customer: { dealershipId } } }),
      prisma.lead.findMany({ where: { dealershipId, unread: true }, orderBy: { createdAt: "desc" } }),
      prisma.vehicle.findMany({ where: { dealershipId, status: "available" } }),
      prisma.lead.findMany({ where: { dealershipId }, select: { source: true, createdAt: true } }),
      prisma.followUp.count({ where: { status: "scheduled", customer: { dealershipId } } }),
    ]);

  // Time saved: every syndicated listing used to take ~40 minutes by hand.
  const hoursSaved = ((allListed * 40) / 60).toFixed(1);

  const staleVehicles = vehicles
    .map((v) => ({ ...v, dol: daysOnLot(v.acquiredAt) }))
    .filter((v) => v.dol > 60)
    .sort((a, b) => b.dol - a.dol);

  // Last 6 months of leads by source
  const months: MonthBucket[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    const label = d.toLocaleDateString("en-US", { month: "short" });
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    const counts: Record<string, number> = {};
    for (const l of leads) {
      const t = new Date(l.createdAt);
      if (t >= start && t < end) counts[l.source] = (counts[l.source] ?? 0) + 1;
    }
    months.push({ label, counts });
  }

  const stats = [
    {
      label: "Hours Saved This Month",
      value: `≈ ${hoursSaved} hrs`,
      sub: `${allListed} listings syndicated × 40 min each`,
      icon: TimerReset,
      accent: "bg-blue-50 text-blue-700",
    },
    {
      label: "Leads Answered After Hours",
      value: String(afterHoursAnswered),
      sub: "While the lot was closed",
      icon: AlarmClock,
      accent: "bg-violet-50 text-violet-700",
    },
    {
      label: "Avg. Response Time",
      value: "2 min",
      sub: "Before AuctionDesk: next morning",
      icon: Clock,
      accent: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Follow-Ups Sent Automatically",
      value: String(followUpsSent),
      sub: `${scheduledFollowUps} more scheduled`,
      icon: Send,
      accent: "bg-amber-50 text-amber-700",
    },
  ];

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Good morning, {user.name.split(" ")[0]}
        </h1>
        <p className="text-sm text-slate-500">{today} · Here&apos;s what AuctionDesk handled while you were on the lot.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-start gap-3 p-5">
              <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${s.accent}`}>
                <s.icon className="h-4.5 w-4.5" />
              </span>
              <div className="min-w-0">
                <p className="text-2xl font-bold tracking-tight text-slate-900">{s.value}</p>
                <p className="text-xs font-medium text-slate-600">{s.label}</p>
                <p className="mt-0.5 text-[11px] text-slate-400">{s.sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Action list */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Today&apos;s action list</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              href="/app/leads"
              className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 transition-colors hover:border-blue-300 hover:bg-blue-50/40"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600">
                <Inbox className="h-4 w-4" />
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-800">
                  {unreadLeads.length} lead{unreadLeads.length === 1 ? "" : "s"} need you
                </p>
                <p className="text-xs text-slate-500">
                  {unreadLeads[0] ? `Newest: ${unreadLeads[0].name}` : "All caught up"}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Link>

            <Link
              href="/app/inventory"
              className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 transition-colors hover:border-blue-300 hover:bg-blue-50/40"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <TrendingDown className="h-4 w-4" />
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-800">
                  {staleVehicles.length} car{staleVehicles.length === 1 ? "" : "s"} hit 60+ days on lot
                </p>
                <p className="text-xs text-slate-500">
                  {staleVehicles[0]
                    ? `${staleVehicles[0].year} ${staleVehicles[0].make} ${staleVehicles[0].model} (${staleVehicles[0].dol} days) — consider a price drop`
                    : "Inventory is moving well"}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Link>

            <Link
              href="/app/customers"
              className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 transition-colors hover:border-blue-300 hover:bg-blue-50/40"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <MessageSquareText className="h-4 w-4" />
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-800">
                  {scheduledFollowUps} follow-up{scheduledFollowUps === 1 ? "" : "s"} going out at 10 AM
                </p>
                <p className="text-xs text-slate-500">Review requests &amp; check-ins on autopilot</p>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Link>
          </CardContent>
        </Card>

        {/* Chart */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Leads by source — last 6 months</CardTitle>
            <Badge variant="blue">All sources</Badge>
          </CardHeader>
          <CardContent>
            <LeadsChart months={months} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
