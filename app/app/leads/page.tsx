import { AutoPilotToggle } from "@/components/autopilot-toggle";
import { LeadsInbox } from "@/components/leads-inbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { requireDealershipId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SOURCE_LABELS } from "@/lib/utils";
import { Globe, MessageCircle, MessagesSquare, Phone, Store, Zap } from "lucide-react";

export const dynamic = "force-dynamic";

const sourceIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  facebook: MessagesSquare,
  website: Globe,
  phone: Phone,
  walkin: Store,
  craigslist: MessageCircle,
};

export default async function LeadsPage() {
  const dealershipId = await requireDealershipId();
  const [leads, settings] = await Promise.all([
    prisma.lead.findMany({
      where: { dealershipId },
      include: { vehicle: true, messages: { orderBy: { createdAt: "desc" }, take: 1 } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.sourceSetting.findMany({ where: { dealershipId } }),
  ]);

  const autoPilotBySource = Object.fromEntries(settings.map((s) => [s.source, s.autoPilot]));
  const sources = ["facebook", "website", "phone", "walkin", "craigslist"];
  const unreadCount = leads.filter((l) => l.unread).length;

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Lead Inbox</h1>
        <p className="text-sm text-slate-500">
          Every channel in one place · {unreadCount} unread
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LeadsInbox
            leads={leads.map((l) => ({
              id: l.id,
              name: l.name,
              source: l.source,
              unread: l.unread,
              autoHandled: l.autoHandled,
              afterHours: l.afterHours,
              createdAt: l.createdAt.toISOString(),
              vehicle: l.vehicle
                ? { year: l.vehicle.year, make: l.vehicle.make, model: l.vehicle.model }
                : null,
              lastMessage: l.messages[0]?.body ?? null,
            }))}
          />
        </div>

        {/* Auto-pilot panel */}
        <div>
          <Card className="lg:sticky lg:top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Zap className="h-4 w-4 text-violet-600" /> 24/7 Auto-Pilot
              </CardTitle>
              <p className="text-xs text-slate-500">
                When a source is on, AuctionDesk answers new leads within 2 minutes using your actual
                vehicle data — nights, weekends, Packers games.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {sources.map((s) => {
                const Icon = sourceIcons[s];
                return (
                  <div key={s} className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5">
                    <Icon className="h-4 w-4 text-slate-400" />
                    <span className="flex-1 text-sm font-medium text-slate-700">{SOURCE_LABELS[s]}</span>
                    <AutoPilotToggle source={s} initial={autoPilotBySource[s] ?? false} />
                  </div>
                );
              })}
              <p className="text-[11px] text-slate-400">
                Every AI conversation ends with a handoff summary — you always get the final say.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
