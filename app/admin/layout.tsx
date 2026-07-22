import { getSessionUser } from "@/lib/auth";
import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Single gate for the cross-tenant support area. Anyone without platform
  // access lands back in their own dealership rather than being told this
  // exists at all.
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!user.isSuperAdmin) redirect("/app");

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500 text-slate-900">
            <ShieldCheck className="h-4 w-4" />
          </span>
          <span className="font-bold tracking-tight text-white">Platform admin</span>
          <span className="hidden text-xs text-slate-400 sm:inline">
            Every dealership on AuctionDesk
          </span>
          <Link
            href="/app"
            className="ml-auto text-xs font-medium text-slate-300 hover:text-white"
          >
            ← Back to {user.dealershipName}
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
