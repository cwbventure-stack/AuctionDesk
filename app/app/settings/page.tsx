import { HoursEditor, TemplatesEditor } from "@/components/settings-editors";
import { SchedulerCalendar } from "@/components/scheduler-calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { requireDealershipId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { nextTestDriveSlots } from "@/lib/schedule";
import { CalendarClock, Clock, FileText } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const dealershipId = await requireDealershipId();
  const [hours, blocks, templates, slots] = await Promise.all([
    prisma.businessHours.findMany({ where: { dealershipId } }),
    prisma.scheduleBlock.findMany({
      where: { dealershipId, endsAt: { gte: new Date() } },
      orderBy: { startsAt: "asc" },
    }),
    prisma.template.findMany({ where: { dealershipId }, orderBy: { createdAt: "asc" } }),
    nextTestDriveSlots(dealershipId, 2),
  ]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500">
          Your hours, your calendar, your voice — AuctionDesk works around them.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4 text-blue-600" /> Business hours
          </CardTitle>
          <p className="text-xs text-slate-500">The AI only offers test drives inside these hours.</p>
        </CardHeader>
        <CardContent>
          <HoursEditor initial={hours} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarClock className="h-4 w-4 text-violet-600" /> Calendar
          </CardTitle>
          <p className="text-xs text-slate-500">
            Out of office, auction runs, lunch — block time and AuctionDesk will never suggest a test
            drive during it.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <SchedulerCalendar
            hours={hours}
            blocks={blocks.map((b) => ({
              id: b.id,
              title: b.title,
              startsAt: b.startsAt.toISOString(),
              endsAt: b.endsAt.toISOString(),
            }))}
          />
          <div className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
            With today&apos;s schedule, AuctionDesk is currently offering: <strong>{slots[0]}</strong> and{" "}
            <strong>{slots[1]}</strong>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4 text-emerald-600" /> Listing templates
          </CardTitle>
          <p className="text-xs text-slate-500">
            A separate voice for each channel — your website description doesn&apos;t have to
            read like your Facebook post. Pick templates when adding a vehicle.
          </p>
        </CardHeader>
        <CardContent>
          <TemplatesEditor templates={templates} />
        </CardContent>
      </Card>
    </div>
  );
}
