import { DraftReplyPanel } from "@/components/draft-reply";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { requireDealershipId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { clockTime, cn, fullDate, money, SOURCE_LABELS, timeAgo } from "@/lib/utils";
import { ArrowLeft, Bot, Car, Moon, User, UserCheck, Zap } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

const statusVariant: Record<string, "blue" | "green" | "amber" | "slate"> = {
  new: "blue",
  replied: "amber",
  booked: "green",
  closed: "slate",
};

export default async function LeadDetail({ params }: { params: Promise<{ id: string }> }) {
  const dealershipId = await requireDealershipId();
  const { id } = await params;
  // findFirst with the tenant filter: another dealership's lead ID 404s here
  // rather than rendering.
  const lead = await prisma.lead.findFirst({
    where: { id, dealershipId },
    include: { vehicle: true, messages: { orderBy: { createdAt: "asc" } } },
  });
  if (!lead) notFound();

  if (lead.unread) {
    await prisma.lead.update({ where: { id: lead.id }, data: { unread: false } });
  }

  const wantsTestDrive = lead.messages.some((m) =>
    /test drive|come see|take it for|booked/i.test(m.body),
  );
  const nextStep =
    lead.status === "booked"
      ? "Test drive is booked — have the vehicle pulled up front and the paperwork started."
      : wantsTestDrive
        ? "They asked about seeing the vehicle — confirm a time slot."
        : "Answer their question and offer two test-drive slots.";

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <Link href="/app/leads" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
        <ArrowLeft className="h-4 w-4" /> Back to inbox
      </Link>

      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{lead.name}</h1>
        <Badge variant={statusVariant[lead.status] ?? "default"}>{lead.status}</Badge>
        <Badge variant="slate">{SOURCE_LABELS[lead.source]}</Badge>
        {lead.afterHours && (
          <Badge variant="violet">
            <Moon className="h-3 w-3" /> came in {clockTime(lead.createdAt)} — after hours
          </Badge>
        )}
      </div>
      <p className="-mt-3 text-sm text-slate-500">
        {lead.contact} · {timeAgo(lead.createdAt)}
      </p>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {lead.autoHandled && (
            <div className="flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-800">
              <Zap className="h-4 w-4 shrink-0" />
              <span>
                <strong>Answered by AuctionDesk while you were closed</strong> — replied at{" "}
                {lead.messages.find((m) => m.sender === "ai")
                  ? clockTime(lead.messages.find((m) => m.sender === "ai")!.createdAt)
                  : "night"}
                , {Math.max(1, Math.round((new Date(lead.messages.find((m) => m.sender === "ai")?.createdAt ?? lead.createdAt).getTime() - new Date(lead.createdAt).getTime()) / 60000))}{" "}
                min after the customer wrote.
              </span>
            </div>
          )}

          {/* Conversation */}
          <div className="space-y-3">
            {lead.messages.map((m) => (
              <div
                key={m.id}
                className={cn("flex gap-2.5", m.sender !== "customer" && "flex-row-reverse")}
              >
                <span
                  className={cn(
                    "mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                    m.sender === "customer"
                      ? "bg-slate-200 text-slate-600"
                      : m.sender === "ai"
                        ? "bg-violet-100 text-violet-700"
                        : "bg-blue-100 text-blue-700",
                  )}
                >
                  {m.sender === "customer" ? <User className="h-3.5 w-3.5" /> : m.sender === "ai" ? <Bot className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                </span>
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                    m.sender === "customer"
                      ? "rounded-tl-sm bg-white border border-slate-200 text-slate-800"
                      : m.sender === "ai"
                        ? "rounded-tr-sm bg-violet-600 text-white"
                        : "rounded-tr-sm bg-blue-700 text-white",
                  )}
                >
                  <p className="whitespace-pre-wrap">{m.body}</p>
                  <p
                    className={cn(
                      "mt-1 text-[10px]",
                      m.sender === "customer" ? "text-slate-400" : "text-white/70",
                    )}
                  >
                    {m.sender === "ai" ? "AuctionDesk · " : m.sender === "owner" ? "You · " : ""}
                    {clockTime(m.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <DraftReplyPanel leadId={lead.id} />
        </div>

        <div className="space-y-4">
          {/* Vehicle card */}
          {lead.vehicle && (
            <Card>
              <CardHeader>
                <CardTitle>Asking about</CardTitle>
              </CardHeader>
              <CardContent>
                <Link href={`/app/inventory/${lead.vehicle.id}`} className="group flex items-center gap-3">
                  <span className="flex h-11 w-16 items-center justify-center rounded-md bg-slate-100 text-slate-400">
                    <Car className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-sm font-medium text-slate-900 group-hover:text-blue-700">
                      {lead.vehicle.year} {lead.vehicle.make} {lead.vehicle.model}
                    </span>
                    <span className="block text-xs text-slate-500">
                      {lead.vehicle.mileage.toLocaleString()} mi · {money(lead.vehicle.price)}
                    </span>
                  </span>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Escalation summary */}
          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-1.5 text-blue-900">
                <UserCheck className="h-4 w-4" /> Escalated to you
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-xs font-medium text-blue-800/70">Who</dt>
                  <dd className="text-slate-800">{lead.name} · {lead.contact}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-blue-800/70">Vehicle</dt>
                  <dd className="text-slate-800">
                    {lead.vehicle
                      ? `${lead.vehicle.year} ${lead.vehicle.make} ${lead.vehicle.model} ${lead.vehicle.trim}`
                      : "Not specified yet"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-blue-800/70">What they want</dt>
                  <dd className="text-slate-800">{lead.messages[0]?.body ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-blue-800/70">Suggested next step</dt>
                  <dd className="font-medium text-slate-900">{nextStep}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-blue-800/70">First contact</dt>
                  <dd className="text-slate-800">{fullDate(lead.createdAt)} at {clockTime(lead.createdAt)}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
