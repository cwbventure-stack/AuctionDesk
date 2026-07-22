"use client";

import { Badge, Card, EmptyState } from "@/components/ui";
import { clockTime, cn, SOURCE_LABELS, timeAgo } from "@/lib/utils";
import { Globe, Inbox, MessageCircle, MessagesSquare, Moon, Phone, Store, Zap } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

const sourceIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  facebook: MessagesSquare,
  website: Globe,
  phone: Phone,
  walkin: Store,
  craigslist: MessageCircle,
};

const SOURCES = ["facebook", "website", "phone", "walkin", "craigslist"];

export interface LeadListItem {
  id: string;
  name: string;
  source: string;
  unread: boolean;
  autoHandled: boolean;
  afterHours: boolean;
  createdAt: string; // ISO
  vehicle: { year: number; make: string; model: string } | null;
  lastMessage: string | null;
}

export function LeadsInbox({ leads }: { leads: LeadListItem[] }) {
  const [active, setActive] = useState<string>("all");

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: leads.length };
    for (const s of SOURCES) c[s] = leads.filter((l) => l.source === s).length;
    return c;
  }, [leads]);

  const filtered = active === "all" ? leads : leads.filter((l) => l.source === active);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        <FilterPill label="All" count={counts.all} active={active === "all"} onClick={() => setActive("all")} />
        {SOURCES.map((s) => (
          <FilterPill
            key={s}
            label={SOURCE_LABELS[s]}
            count={counts[s]}
            active={active === s}
            onClick={() => setActive(s)}
            icon={sourceIcons[s]}
          />
        ))}
      </div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Inbox className="h-8 w-8" />}
            title={active === "all" ? "No leads yet" : `No ${SOURCE_LABELS[active]} leads`}
            description={
              active === "all"
                ? "New messages from Facebook, your website, Craigslist, phone and walk-ins will land here."
                : "Try a different source, or view All."
            }
          />
        ) : (
          filtered.map((lead) => {
            const Icon = sourceIcons[lead.source] ?? Inbox;
            return (
              <Link key={lead.id} href={`/app/leads/${lead.id}`} className="block">
                <Card
                  className={cn(
                    "flex items-start gap-3 p-4 transition-colors hover:border-blue-300",
                    lead.unread && "border-l-4 border-l-blue-600",
                  )}
                >
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className={cn("text-sm text-slate-900", lead.unread ? "font-bold" : "font-medium")}>
                        {lead.name}
                      </span>
                      <Badge variant="slate">{SOURCE_LABELS[lead.source]}</Badge>
                      {lead.autoHandled && (
                        <Badge variant="violet">
                          <Zap className="h-3 w-3" /> Answered by AuctionDesk
                        </Badge>
                      )}
                      {lead.unread && <span className="h-2 w-2 rounded-full bg-blue-600" aria-label="unread" />}
                    </div>
                    {lead.vehicle && (
                      <p className="text-xs font-medium text-slate-600">
                        {lead.vehicle.year} {lead.vehicle.make} {lead.vehicle.model}
                      </p>
                    )}
                    {lead.lastMessage && (
                      <p className="mt-0.5 truncate text-xs text-slate-500">{lead.lastMessage}</p>
                    )}
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
                      {lead.afterHours ? (
                        <>
                          <Moon className="h-3 w-3" />
                          came in {clockTime(lead.createdAt)} — after hours
                        </>
                      ) : (
                        <>came in {timeAgo(lead.createdAt)}</>
                      )}
                    </p>
                  </div>
                </Card>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}

function FilterPill({
  label,
  count,
  active,
  onClick,
  icon: Icon,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer",
        active
          ? "border-blue-700 bg-blue-700 text-white"
          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
      )}
    >
      {Icon && <Icon className="h-3 w-3" />}
      {label}
      <span className={cn("rounded-full px-1.5 text-[10px]", active ? "bg-white/20" : "bg-slate-100")}>
        {count}
      </span>
    </button>
  );
}
