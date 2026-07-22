"use client";

import { toggleAutoPilot } from "@/app/actions";
import { cn, SOURCE_LABELS } from "@/lib/utils";
import { useState, useTransition } from "react";
import { toast } from "sonner";

export function AutoPilotToggle({ source, initial }: { source: string; initial: boolean }) {
  const [on, setOn] = useState(initial);
  const [pending, startTransition] = useTransition();

  return (
    <button
      role="switch"
      aria-checked={on}
      disabled={pending}
      onClick={() => {
        const next = !on;
        setOn(next);
        startTransition(async () => {
          try {
            await toggleAutoPilot(source, next);
            toast.success(
              next
                ? `Auto-Pilot ON for ${SOURCE_LABELS[source]}`
                : `Auto-Pilot off for ${SOURCE_LABELS[source]}`,
              {
                description: next
                  ? "New leads get an answer within 2 minutes, day or night."
                  : "You'll answer these leads yourself.",
              },
            );
          } catch {
            setOn(!next);
            toast.error("Couldn't update the setting");
          }
        });
      }}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors cursor-pointer",
        on ? "bg-emerald-500" : "bg-slate-300",
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
          on ? "translate-x-4.5" : "translate-x-0.5",
        )}
      />
    </button>
  );
}
