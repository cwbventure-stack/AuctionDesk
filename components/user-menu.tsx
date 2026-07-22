"use client";

import { logout } from "@/app/auth-actions";
import { LogOut } from "lucide-react";
import { useState } from "react";

export function UserMenu({ name, email }: { name: string; email: string }) {
  const [busy, setBusy] = useState(false);

  return (
    <div className="rounded-lg border border-slate-200 px-3 py-2">
      <p className="truncate text-xs font-medium text-slate-800">{name}</p>
      <p className="truncate text-[11px] text-slate-400">{email}</p>
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
