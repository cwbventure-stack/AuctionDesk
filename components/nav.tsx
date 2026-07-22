"use client";

import { cn } from "@/lib/utils";
import { Car, Gauge, Inbox, Settings, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/app", label: "Dashboard", icon: Gauge, exact: true },
  { href: "/app/inventory", label: "Inventory", icon: Car },
  { href: "/app/leads", label: "Leads", icon: Inbox },
  { href: "/app/customers", label: "Follow-Ups", icon: Users },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

export function SideNav({ unreadLeads }: { unreadLeads: number }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1 px-3">
      {items.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-blue-50 text-blue-800"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="flex-1">{label}</span>
            {label === "Leads" && unreadLeads > 0 && (
              <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                {unreadLeads}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileNav({ unreadLeads }: { unreadLeads: number }) {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-slate-200 bg-white/95 backdrop-blur md:hidden">
      {items.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium",
              active ? "text-blue-700" : "text-slate-500",
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
            {label === "Leads" && unreadLeads > 0 && (
              <span className="absolute top-1 right-1/2 translate-x-4 rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                {unreadLeads}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
