"use client";

import { adminResetPassword, adminSetRole, adminSignOutUser } from "@/app/admin-actions";
import { Badge, Button, Input } from "@/components/ui";
import { KeyRound, Loader2, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isSuperAdmin: boolean;
}

export function AdminUserRow({ user, isSelf }: { user: AdminUser; isSelf: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [password, setPassword] = useState("");

  async function run(fn: () => Promise<{ error?: string }>, success: string) {
    setBusy(true);
    try {
      const { error } = await fn();
      if (error) return toast.error(error);
      toast.success(success);
      router.refresh();
      return true;
    } catch {
      toast.error("That didn't work");
    } finally {
      setBusy(false);
    }
  }

  async function submitReset() {
    const ok = await run(
      () => adminResetPassword(user.id, password),
      `Password reset for ${user.name} — they've been signed out`,
    );
    if (ok) {
      setPassword("");
      setResetting(false);
    }
  }

  return (
    <li className="px-3 py-2.5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium text-slate-900">{user.name}</span>
            {user.isSuperAdmin && <Badge variant="default">Platform</Badge>}
            {isSelf && <Badge variant="default">You</Badge>}
          </div>
          <p className="truncate text-xs text-slate-500">{user.email}</p>
        </div>

        <select
          value={user.role}
          disabled={isSelf || busy}
          onChange={(e) => run(() => adminSetRole(user.id, e.target.value), "Role updated")}
          className="h-8 rounded-lg border border-slate-300 bg-white px-2 text-xs text-slate-900 disabled:opacity-50"
          aria-label={`Role for ${user.name}`}
        >
          <option value="owner">Owner</option>
          <option value="staff">Staff</option>
        </select>

        <Button
          variant="secondary"
          size="sm"
          disabled={busy}
          onClick={() => setResetting((r) => !r)}
        >
          <KeyRound className="h-3.5 w-3.5" /> Reset password
        </Button>

        <Button
          variant="ghost"
          size="sm"
          disabled={busy}
          onClick={() => run(() => adminSignOutUser(user.id), `${user.name} signed out everywhere`)}
          aria-label={`Sign out ${user.name}`}
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
        </Button>
      </div>

      {resetting && (
        <div className="mt-2 flex flex-wrap items-center gap-2 rounded-lg bg-slate-50 p-2">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password (8+ characters)"
            className="h-8 max-w-xs text-xs"
            aria-label={`New password for ${user.name}`}
          />
          <Button size="sm" disabled={busy || password.length < 8} onClick={submitReset}>
            Set password
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setResetting(false)}>
            Cancel
          </Button>
          <p className="w-full text-[11px] text-slate-500">
            Send this to them over a channel you trust, and have them change it after signing in.
          </p>
        </div>
      )}
    </li>
  );
}
