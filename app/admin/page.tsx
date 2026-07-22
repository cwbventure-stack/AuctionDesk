import { AdminUserRow } from "@/components/admin-users";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Building2 } from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  // Re-checked here as well as in the layout: pages and layouts render in
  // parallel, and this must not query across tenants on the strength of a gate
  // living in another file. Redirects rather than throws so an ordinary
  // unauthorized visit isn't reported as a server error.
  const admin = await getSessionUser();
  if (!admin) redirect("/login");
  if (!admin.isSuperAdmin) redirect("/app");

  // The one place in the app that deliberately reads across tenants.
  const dealerships = await prisma.dealership.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      users: {
        select: { id: true, name: true, email: true, role: true, isSuperAdmin: true },
        orderBy: { createdAt: "asc" },
      },
      _count: { select: { vehicles: true, leads: true, customers: true } },
    },
  });

  const totalUsers = dealerships.reduce((n, d) => n + d.users.length, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dealerships</h1>
        <p className="text-sm text-slate-500">
          {dealerships.length} {dealerships.length === 1 ? "lot" : "lots"} · {totalUsers}{" "}
          {totalUsers === 1 ? "user" : "users"}
        </p>
      </div>

      {dealerships.map((d) => (
        <Card key={d.id}>
          <CardHeader>
            <CardTitle className="flex flex-wrap items-center gap-2 text-base">
              <Building2 className="h-4 w-4 text-blue-600" />
              {d.name}
              <span className="text-xs font-normal text-slate-400">/lot/{d.slug}</span>
            </CardTitle>
            <p className="text-xs text-slate-500">
              {d._count.vehicles} vehicles · {d._count.leads} leads · {d._count.customers}{" "}
              customers · joined {d.createdAt.toLocaleDateString()}
            </p>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
              {d.users.map((u) => (
                <AdminUserRow
                  key={u.id}
                  user={u}
                  isSelf={u.id === admin.id}
                />
              ))}
              {d.users.length === 0 && (
                <li className="px-3 py-3 text-sm text-slate-400">No users on this lot.</li>
              )}
            </ul>
          </CardContent>
        </Card>
      ))}

      {dealerships.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-sm text-slate-500">
            No dealerships have signed up yet.
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-slate-400">
        Passwords are stored as one-way hashes and can never be read — only reset.{" "}
        <Badge variant="default">Platform</Badge> marks AuctionDesk staff.
      </p>
    </div>
  );
}
