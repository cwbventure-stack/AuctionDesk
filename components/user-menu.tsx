"use client";

import { logout } from "@/app/auth-actions";
import { LogOut, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function UserMenu({
  name,
  email,
  isSuperAdmin = false,
}: {
  name: string;
  email: string;
  isSuperAdmin?: boolean;
}) {
  const [busy, setBusy] = useState(false);

  return (
    <div className="rounded-lg border border-slate-200 px-3 py-2">
      <p className="truncate text-xs font-medium text-slate-800">{name}</p>
      <p className="truncate text-[11px] text-slate-400">{email}</p>
      {isSuperAdmin && (
        <Link
          href="/admin"
          className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-slate-500 hover:text-amber-600"
        >
          <ShieldCheck className="h-3 w-3" />
          Platform admin
        </Link>
      )}
      <button
        onClick={() => {
          setBusy(true);
          logout();
        }}
        disabled={busy}
        className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-slate-500 hover:text-red-600 cursor-pointer"
      >
        <LogOut className="h-3 w-3" />
        {busy ? "Signing out…" : "Sign out"}
      </button>
    </div>
  );
}
