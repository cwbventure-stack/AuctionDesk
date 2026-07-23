"use client";

import { Button } from "@/components/ui";
import type { MarketplaceField } from "@/lib/marketplace-fields";
import { Check, Copy, Download, ExternalLink, ListChecks } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// The assisted-posting helper. Facebook and Craigslist won't let anything
// pre-fill their forms, so the fastest honest path is: open their form, then
// copy each field across one tap at a time. This walks the dealer down the exact
// list of fields, in the site's order, plus a one-click photo bundle.

const LABELS: Record<"facebook" | "craigslist", string> = {
  facebook: "Marketplace",
  craigslist: "Craigslist",
};

export function MarketplacePostHelper({
  channel,
  createUrl,
  fields,
  description,
  photoCount,
  photosZipUrl,
  disabled = false,
}: {
  channel: "facebook" | "craigslist";
  createUrl: string;
  fields: MarketplaceField[];
  description: string;
  photoCount: number;
  photosZipUrl: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  async function copy(key: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied((c) => (c === key ? null : c)), 1500);
    } catch {
      toast.error("Couldn't copy — select the value and copy it by hand.");
    }
  }

  // Opening the form is the one thing we automate; everything after is copy-paste.
  function openForm() {
    window.open(createUrl, "_blank", "noopener,noreferrer");
    setOpen(true);
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="secondary" size="sm" disabled={disabled} onClick={openForm}>
          <ExternalLink className="h-3.5 w-3.5" /> Open {LABELS[channel]} form
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => setOpen((o) => !o)}
        >
          <ListChecks className="h-3.5 w-3.5" />
          {open ? "Hide fields" : "Fill it field by field"}
        </Button>
      </div>

      {open && (
        <div className="space-y-1 rounded-lg border border-slate-200 bg-slate-50/70 p-2">
          <p className="px-1 pb-1 text-[11px] text-slate-500">
            {`${LABELS[channel]} won't let us fill its form automatically. Copy each field across — tap, then paste into the matching box.`}
          </p>

          {fields.map((f) => (
            <div
              key={f.label}
              className="flex items-center gap-2 rounded-md bg-white px-2 py-1.5"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                  {f.label}
                </p>
                {f.empty ? (
                  <p className="text-xs text-amber-700">{f.hint}</p>
                ) : (
                  <>
                    <p className="truncate text-sm text-slate-800">{f.value}</p>
                    {f.hint && <p className="text-[10px] text-slate-400">{f.hint}</p>}
                  </>
                )}
              </div>
              {!f.empty && (
                <button
                  onClick={() => copy(f.label, f.value)}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-100"
                  aria-label={`Copy ${f.label}`}
                >
                  {copied === f.label ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              )}
            </div>
          ))}

          {/* The long description is its own row so it's obvious it's separate. */}
          <div className="flex items-start gap-2 rounded-md bg-white px-2 py-1.5">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                Description
              </p>
              <p className="line-clamp-2 text-xs text-slate-600">{description}</p>
            </div>
            <button
              onClick={() => copy("__desc", description)}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-100"
              aria-label="Copy description"
            >
              {copied === "__desc" ? (
                <Check className="h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>

          {photoCount > 0 && (
            <a href={photosZipUrl} className="block pt-1">
              <Button variant="secondary" size="sm" className="w-full">
                <Download className="h-3.5 w-3.5" /> Download all {photoCount} photo
                {photoCount === 1 ? "" : "s"} to upload
              </Button>
            </a>
          )}
        </div>
      )}
    </div>
  );
}
