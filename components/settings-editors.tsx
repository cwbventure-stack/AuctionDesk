"use client";

import { createTemplate, deleteTemplate, saveBusinessHours, updateTemplate } from "@/app/actions";
import { Button, Input, Label, Textarea } from "@/components/ui";
import { Check, Eye, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// ---------------------------------------------------------------------------
// Weekly business hours
// ---------------------------------------------------------------------------

export interface HoursRow {
  weekday: number;
  open: string | null;
  close: string | null;
}

export function HoursEditor({ initial }: { initial: HoursRow[] }) {
  const [rows, setRows] = useState<HoursRow[]>(
    // Ensure all 7 days present, Monday first for a natural reading order
    [1, 2, 3, 4, 5, 6, 0].map(
      (d) => initial.find((r) => r.weekday === d) ?? { weekday: d, open: null, close: null },
    ),
  );
  const [saving, setSaving] = useState(false);

  const update = (weekday: number, patch: Partial<HoursRow>) =>
    setRows((rs) => rs.map((r) => (r.weekday === weekday ? { ...r, ...patch } : r)));

  async function save() {
    for (const r of rows) {
      if ((r.open && !r.close) || (!r.open && r.close) || (r.open && r.close && r.open >= r.close)) {
        toast.error(`${DAY_NAMES[r.weekday]}: opening time must be before closing time`);
        return;
      }
    }
    setSaving(true);
    try {
      await saveBusinessHours(rows);
      toast.success("Hours saved", {
        description: "Suggested test-drive slots now follow this schedule.",
      });
    } catch {
      toast.error("Couldn't save hours");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-2">
      {rows.map((r) => {
        const closed = !r.open && !r.close;
        return (
          <div key={r.weekday} className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-slate-100 py-1.5 last:border-0">
            <span className="w-24 shrink-0 text-sm font-medium text-slate-700">
              {DAY_NAMES[r.weekday]}
            </span>
            {closed ? (
              <span className="text-sm text-slate-400">Closed</span>
            ) : (
              <div className="flex items-center gap-2">
                <Input
                  type="time"
                  value={r.open ?? ""}
                  onChange={(e) => update(r.weekday, { open: e.target.value })}
                  className="h-9 w-32"
                />
                <span className="text-xs text-slate-400">to</span>
                <Input
                  type="time"
                  value={r.close ?? ""}
                  onChange={(e) => update(r.weekday, { close: e.target.value })}
                  className="h-9 w-32"
                />
              </div>
            )}
            <label className="ml-auto flex items-center gap-1.5 text-xs text-slate-500">
              <input
                type="checkbox"
                checked={closed}
                onChange={(e) =>
                  update(
                    r.weekday,
                    e.target.checked ? { open: null, close: null } : { open: "08:00", close: "18:00" },
                  )
                }
              />
              Closed
            </label>
          </div>
        );
      })}
      <Button onClick={save} disabled={saving} size="sm" className="mt-2">
        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
        Save hours
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Listing description templates
// ---------------------------------------------------------------------------

export interface TemplateRow {
  id: string;
  name: string;
  body: string;
  channel: string;
}

const CHANNELS = [
  { key: "description", label: "Sales Description", hint: "The main write-up used on your website." },
  { key: "facebook", label: "Facebook", hint: "Short and friendly — a few tasteful emoji are normal here." },
  { key: "craigslist", label: "Craigslist", hint: "Plain text, no emoji, straight to the point." },
] as const;

const DEFAULT_DISPLAY_BODY_BY_CHANNEL: Record<string, string> = {
  description: "[Year] [Make] [Model] [Trim] — [Mileage] miles, $[Price].\n\nYour standard pitch goes here…",
  facebook:
    "🚗 [Year] [Make] [Model] — $[Price]\n✅ [Mileage] miles\n✅ Your standout feature here\nMessage us to book a test drive! 🤝",
  craigslist:
    "[Year] [Make] [Model] [Trim] - $[Price] (Your City)\n\n[Mileage] miles. Your standard pitch here.\n\nNo-pressure test drives welcome.",
};

// Field chips the owner can click to insert — shown as friendly [Label] text
// in the editor, stored as {{key}} under the hood (what lib/ai.ts expects).
const FIELD_TOKENS = [
  { key: "year", label: "Year" },
  { key: "make", label: "Make" },
  { key: "model", label: "Model" },
  { key: "trim", label: "Trim" },
  { key: "mileage", label: "Mileage" },
  { key: "price", label: "Price" },
  { key: "vin", label: "VIN" },
] as const;

function toDisplay(storageBody: string): string {
  return storageBody.replace(/\{\{\s*(\w+)\s*\}\}/g, (whole, key: string) => {
    const field = FIELD_TOKENS.find((f) => f.key === key.toLowerCase());
    return field ? `[${field.label}]` : whole;
  });
}

function toStorage(displayBody: string): string {
  return displayBody.replace(/\[(\w+)\]/g, (whole, label: string) => {
    const field = FIELD_TOKENS.find((f) => f.label.toLowerCase() === label.toLowerCase());
    return field ? `{{${field.key}}}` : whole;
  });
}

// Sample vehicle used only to render the live preview — never saved.
const SAMPLE_VEHICLE: Record<string, string> = {
  year: "2019",
  make: "Honda",
  model: "CR-V",
  trim: "EX AWD",
  mileage: "54,210",
  price: "21,995",
  vin: "5J6RW2H85KL003471",
};

function fillSample(storageBody: string): string {
  return storageBody.replace(/\{\{\s*(\w+)\s*\}\}/g, (whole, key: string) => SAMPLE_VEHICLE[key.toLowerCase()] ?? whole);
}

export function TemplatesEditor({ templates }: { templates: TemplateRow[] }) {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingChannel, setAddingChannel] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [displayBody, setDisplayBody] = useState("");
  const [busy, setBusy] = useState(false);

  const editingChannel = editingId ? templates.find((t) => t.id === editingId)?.channel : undefined;
  const activeChannel = addingChannel ?? editingChannel ?? null;

  function startEdit(t: TemplateRow) {
    setEditingId(t.id);
    setAddingChannel(null);
    setName(t.name);
    setDisplayBody(toDisplay(t.body));
  }

  function startAdd(channel: string) {
    setAddingChannel(channel);
    setEditingId(null);
    setName("");
    setDisplayBody(DEFAULT_DISPLAY_BODY_BY_CHANNEL[channel] ?? DEFAULT_DISPLAY_BODY_BY_CHANNEL.description);
  }

  function closeEditor() {
    setAddingChannel(null);
    setEditingId(null);
  }

  function insertField(label: string) {
    const token = `[${label}]`;
    const el = textareaRef.current;
    if (!el) {
      setDisplayBody((b) => b + token);
      return;
    }
    const start = el.selectionStart ?? displayBody.length;
    const end = el.selectionEnd ?? displayBody.length;
    const next = displayBody.slice(0, start) + token + displayBody.slice(end);
    setDisplayBody(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + token.length;
      el.setSelectionRange(pos, pos);
    });
  }

  async function save() {
    if (!activeChannel) return;
    if (!name.trim() || !displayBody.trim()) {
      toast.error("Template needs a name and some text");
      return;
    }
    setBusy(true);
    try {
      const storageBody = toStorage(displayBody);
      if (editingId) await updateTemplate(editingId, name.trim(), storageBody, activeChannel);
      else await createTemplate(name.trim(), storageBody, activeChannel);
      toast.success(editingId ? "Template updated" : "Template created");
      closeEditor();
      router.refresh();
    } catch {
      toast.error("Couldn't save the template");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    try {
      await deleteTemplate(id);
      toast.success("Template deleted");
      if (editingId === id) setEditingId(null);
      router.refresh();
    } catch {
      toast.error("Couldn't delete the template");
    }
  }

  const editorOpen = activeChannel !== null;

  function renderEditor() {
    return (
      <div className="mt-2 space-y-3 rounded-lg border border-blue-200 bg-blue-50/40 p-3">
        <div>
          <Label>Template name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="My weekend special" />
        </div>
        <div>
          <p className="mb-1.5 text-[11px] text-slate-500">
            Write your pitch, then click a button to drop in real vehicle info — no typing needed.
          </p>
          <div className="mb-1.5 flex flex-wrap gap-1.5">
            {FIELD_TOKENS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => insertField(f.label)}
                className="rounded-full border border-blue-300 bg-white px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-50 cursor-pointer"
              >
                + {f.label}
              </button>
            ))}
          </div>
          <Textarea ref={textareaRef} rows={7} value={displayBody} onChange={(e) => setDisplayBody(e.target.value)} />
        </div>
        <div>
          <p className="mb-1 flex items-center gap-1 text-[11px] font-medium text-slate-500">
            <Eye className="h-3 w-3" /> Preview with a sample vehicle
          </p>
          <p className="rounded-lg bg-white p-3 text-xs whitespace-pre-wrap text-slate-600">
            {fillSample(toStorage(displayBody)) || "…"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={save} disabled={busy}>
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
            {editingId ? "Save changes" : "Create template"}
          </Button>
          <Button variant="ghost" size="sm" onClick={closeEditor}>
            <X className="h-3.5 w-3.5" /> Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {CHANNELS.map((c) => {
        const items = templates.filter((t) => t.channel === c.key);
        return (
          <div key={c.key}>
            <div className="mb-2 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-800">{c.label}</p>
                <p className="text-[11px] text-slate-500">{c.hint}</p>
              </div>
              {!editorOpen && (
                <Button variant="secondary" size="sm" onClick={() => startAdd(c.key)}>
                  <Plus className="h-3.5 w-3.5" /> New
                </Button>
              )}
            </div>

            {items.length === 0 ? (
              <p className="text-xs text-slate-400">No {c.label.toLowerCase()} templates yet — AuctionDesk uses its default voice.</p>
            ) : (
              <ul className="space-y-2">
                {items.map((t) => (
                  <li key={t.id} className="rounded-lg border border-slate-200 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <p className="flex-1 text-sm font-medium text-slate-800">{t.name}</p>
                      <button
                        onClick={() => startEdit(t)}
                        className="text-slate-400 hover:text-blue-600 cursor-pointer"
                        aria-label={`Edit ${t.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => remove(t.id)}
                        className="text-slate-400 hover:text-red-600 cursor-pointer"
                        aria-label={`Delete ${t.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs whitespace-pre-wrap text-slate-500">{toDisplay(t.body)}</p>
                  </li>
                ))}
              </ul>
            )}

            {activeChannel === c.key && renderEditor()}
          </div>
        );
      })}
    </div>
  );
}
