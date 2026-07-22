"use client";

import { Button } from "@/components/ui";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

/**
 * A read-only value the dealer needs to paste somewhere else — a feed URL, an
 * embed snippet. Selectable as well as copyable, because some people will always
 * want to select it by hand.
 */
export function CopyField({
  value,
  label,
  multiline = false,
}: {
  value: string;
  label: string;
  multiline?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(`${label} copied`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy — select the text and copy it manually.");
    }
  }

  return (
    <div className="flex items-start gap-2">
      <code
        className={
          multiline
            ? "min-w-0 flex-1 overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-2 font-mono text-[11px] whitespace-pre text-slate-700"
            : "min-w-0 flex-1 truncate rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 font-mono text-[11px] text-slate-700"
        }
      >
        {value}
      </code>
      <Button variant="secondary" size="sm" onClick={copy} aria-label={`Copy ${label}`}>
        {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
      </Button>
    </div>
  );
}
