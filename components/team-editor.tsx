"use client";

import { addTeamMember, removeTeamMember, updateTeamMemberRole } from "@/app/team-actions";
import { Badge, Button, Input, Label } from "@/components/ui";
import { Loader2, Plus, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
}

const ROLE_HINT: Record<string, string> = {
  owner: "Manages staff, hours, and templates",
  staff: "Works leads and inventory",
};

export function TeamEditor({
  members,
  currentUserId,
}: {
  members: TeamMember[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function changeRole(member: TeamMember, role: string) {
    setBusyId(member.id);
    try {
      const { error } = await updateTeamMemberRole(member.id, role);
      if (error) return toast.error(error);
      toast.success(`${member.name} is now ${role === "owner" ? "an owner" : "staff"}`);
      router.refresh();
    } catch {
      toast.error("Couldn't change that role");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(member: TeamMember) {
    if (!confirm(`Remove ${member.name}? They'll be signed out and lose access immediately.`)) {
      return;
    }
    setBusyId(member.id);
    try {
      const { error } = await removeTeamMember(member.id);
      if (error) return toast.error(error);
      toast.success(`${member.name} removed`);
      router.refresh();
    } catch {
      toast.error("Couldn't remove that person");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
        {members.map((m) => {
          const isSelf = m.id === currentUserId;
          return (
            <li key={m.id} className="flex flex-wrap items-center gap-3 px-3 py-2.5">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium text-slate-900">{m.name}</span>
                  {isSelf && <Badge variant="default">You</Badge>}
                </div>
                <p className="truncate text-xs text-slate-500">{m.email}</p>
              </div>

              <select
                value={m.role}
                disabled={isSelf || busyId === m.id}
                onChange={(e) => changeRole(m, e.target.value)}
                className="h-8 rounded-lg border border-slate-300 bg-white px-2 text-xs text-slate-900 disabled:opacity-50"
                aria-label={`Role for ${m.name}`}
              >
                <option value="owner">Owner</option>
                <option value="staff">Staff</option>
              </select>

              <Button
                variant="ghost"
                size="sm"
                disabled={isSelf || busyId === m.id}
                onClick={() => remove(m)}
                aria-label={`Remove ${m.name}`}
              >
                {busyId === m.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 text-red-600" />
                )}
              </Button>
            </li>
          );
        })}
      </ul>

      <p className="text-xs text-slate-500">
        <strong>Owner</strong> — {ROLE_HINT.owner}. <strong>Staff</strong> — {ROLE_HINT.staff}.
      </p>

      {adding ? (
        <AddMemberForm onDone={() => setAdding(false)} />
      ) : (
        <Button variant="secondary" size="sm" onClick={() => setAdding(true)}>
          <Plus className="h-4 w-4" /> Add someone
        </Button>
      )}
    </div>
  );
}

function AddMemberForm({ onDone }: { onDone: () => void }) {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "staff" });
  const [saving, setSaving] = useState(false);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function submit() {
    setSaving(true);
    try {
      const { error } = await addTeamMember(form);
      if (error) return toast.error(error);
      toast.success(`${form.name.trim()} added`, {
        description: "Share their password with them — they can sign in right away.",
      });
      onDone();
      router.refresh();
    } catch {
      toast.error("Couldn't add that person");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-900">Add a team member</h3>
        <Button variant="ghost" size="sm" onClick={onDone} aria-label="Cancel">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="member-name">Name</Label>
          <Input id="member-name" value={form.name} onChange={set("name")} placeholder="Sam Rivera" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="member-email">Email</Label>
          <Input
            id="member-email"
            type="email"
            value={form.email}
            onChange={set("email")}
            placeholder="sam@yourdealership.com"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="member-password">Temporary password</Label>
          <Input
            id="member-password"
            type="password"
            value={form.password}
            onChange={set("password")}
            placeholder="At least 8 characters"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="member-role">Role</Label>
          <select
            id="member-role"
            value={form.role}
            onChange={set("role")}
            className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900"
          >
            <option value="staff">Staff</option>
            <option value="owner">Owner</option>
          </select>
        </div>
      </div>

      <Button size="sm" onClick={submit} disabled={saving}>
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        Add to team
      </Button>
    </div>
  );
}
