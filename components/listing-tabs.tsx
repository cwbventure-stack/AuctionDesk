"use client";

import { updateVehicleDescription } from "@/app/actions";
import { CopyButton } from "@/components/copy-button";
import { Button, Textarea } from "@/components/ui";
import type { GeneratedListing } from "@/lib/ai";
import { cn } from "@/lib/utils";
import { Camera, Check, FileText, Loader2, MessagesSquare, Newspaper, Pencil, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const tabs = [
  { key: "description", label: "Sales Description", icon: FileText },
  { key: "facebook", label: "Facebook", icon: MessagesSquare },
  { key: "craigslist", label: "Craigslist", icon: Newspaper },
  { key: "shotList", label: "Photo Shot List", icon: Camera },
] as const;

type TabKey = (typeof tabs)[number]["key"];
type TextKey = Exclude<TabKey, "shotList">;

export function ListingTabs({
  listing,
  onChange,
  persistVehicleId,
}: {
  listing: GeneratedListing;
  // Called with the full updated listing whenever the user edits a tab
  // (used by the Add Vehicle flow so edits are what gets saved).
  onChange?: (l: GeneratedListing) => void;
  // When set, saving a description edit persists straight to this vehicle.
  persistVehicleId?: string;
}) {
  const [active, setActive] = useState<TabKey>("description");
  const [current, setCurrent] = useState<GeneratedListing>(listing);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  const text =
    active === "shotList"
      ? current.shotList.map((s, i) => `${i + 1}. ${s}`).join("\n")
      : current[active];

  function startEdit() {
    if (active === "shotList") return;
    setDraft(current[active]);
    setEditing(true);
  }

  async function saveEdit() {
    const key = active as TextKey;
    const updated = { ...current, [key]: draft };
    setCurrent(updated);
    onChange?.(updated);
    setEditing(false);
    if (persistVehicleId && key === "description") {
      setSaving(true);
      try {
        await updateVehicleDescription(persistVehicleId, draft);
        toast.success("Description saved", { description: "It'll be used the next time you publish." });
      } catch {
        toast.error("Couldn't save the description");
      } finally {
        setSaving(false);
      }
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex overflow-x-auto border-b border-slate-200 bg-slate-50">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => {
              setActive(key);
              setEditing(false);
            }}
            className={cn(
              "flex items-center gap-1.5 whitespace-nowrap border-b-2 px-4 py-2.5 text-xs font-medium transition-colors cursor-pointer",
              active === key
                ? "border-blue-700 bg-white text-blue-800"
                : "border-transparent text-slate-500 hover:text-slate-800",
            )}
          >
            <Icon className="h-3.5 w-3.5" /> {label}
          </button>
        ))}
      </div>
      <div className="space-y-3 p-4">
        {active === "shotList" ? (
          <ol className="list-decimal space-y-1.5 pl-5 text-sm text-slate-700">
            {current.shotList.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
        ) : editing ? (
          <Textarea
            rows={active === "description" ? 9 : 7}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            autoFocus
          />
        ) : (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{text}</p>
        )}
        <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
          {active !== "shotList" ? (
            editing ? (
              <div className="flex gap-2">
                <Button size="sm" onClick={saveEdit} disabled={saving}>
                  {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                  Save edit
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
                  <X className="h-3.5 w-3.5" /> Cancel
                </Button>
              </div>
            ) : (
              <Button variant="ghost" size="sm" onClick={startEdit}>
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Button>
            )
          ) : (
            <span />
          )}
          <CopyButton text={text} label={`Copy ${active === "shotList" ? "shot list" : "text"}`} />
        </div>
      </div>
    </div>
  );
}
