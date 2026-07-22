import { MobileNav, SideNav } from "@/components/nav";
import { UserMenu } from "@/components/user-menu";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Car } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Single gate for the whole authenticated app. Every page below this can
  // assume a signed-in user; every query is scoped to their dealership.
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const [unreadLeads, dealership] = await Promise.all([
    prisma.lead.count({ where: { dealershipId: user.dealershipId, unread: true } }),
    prisma.dealership.findUnique({ where: { id: user.dealershipId } }),
  ]);

  const location = [dealership?.city, dealership?.state].filter(Boolean).join(", ");

  return (
    <div className="flex min-h-screen w-full">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
        <Link href="/app" className="flex items-center gap-2 px-6 py-5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-700 text-white">
            <Car className="h-4.5 w-4.5" />
          </span>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            Auction<span className="text-blue-700">Desk</span>
          </span>
        </Link>
        <SideNav unreadLeads={unreadLeads} />
        <div className="mt-auto px-3 py-4">
          <div className="px-3 pb-3">
            <p className="truncate text-xs font-medium text-slate-700">{user.dealershipName}</p>
            {location && <p className="text-[11px] text-slate-400">{location}</p>}
          </div>
          <UserMenu name={user.name} email={user.email} />
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="flex items-center gap-2 border-b border-slate-200 bg-white px-4 py-3 md:hidden">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-700 text-white">
            <Car className="h-4 w-4" />
          </span>
          <span className="font-bold text-slate-900">
            Auction<span className="text-blue-700">Desk</span>
          </span>
          <span className="ml-auto max-w-[45%] truncate text-[11px] text-slate-400">
            {user.dealershipName}
          </span>
        </header>
        <main className="flex-1 px-4 py-6 pb-24 md:px-8 md:pb-8">{children}</main>
      </div>

      <MobileNav unreadLeads={unreadLeads} />
    </div>
  );
}
