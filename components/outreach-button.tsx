"use client";

import { sendOutreach } from "@/app/messaging-actions";
import { Button, Textarea } from "@/components/ui";
import { Loader2, Send, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function OutreachButton({
  customerId,
  type,
  label = "Draft outreach",
  size = "sm",
}: {
  customerId: string;
  type: "thankyou" | "checkin" | "tradein";
  label?: string;
  size?: "sm" | "md";
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const [drafting, setDrafting] = useState(false);
  const [sending, setSending] = useState(false);

  async function generate() {
    setDrafting(true);
    try {
      const res = await fetch("/api/ai/outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId, type }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setDraft(data.draft);
    } catch {
      toast.error("Couldn't draft the message — try again");
    } finally {
      setDrafting(false);
    }
  }

  async function send() {
    setSending(true);
    try {
      // Pass the drafted text so it actually goes out by SMS (subject to the
      // customer's TCPA consent, enforced server-side).
      const result = await sendOutreach(customerId, type, draft ?? undefined);
      toast.success(result.simulated ? "Follow-up recorded" : "Follow-up sent", {
        description: result.message,
      });
      setDraft(null);
    } catch (e) {
      toast.error(e instanceof Error && e.message ? e.message : "Couldn't send the follow-up");
    } finally {
      setSending(false);
    }
  }

  if (draft === null) {
    return (
      <Button variant="secondary" size={size} onClick={generate} disabled={drafting}>
        {drafting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 text-violet-600" />}
        {drafting ? "Drafting…" : label}
      </Button>
    );
  }

  return (
    <div className="w-full space-y-2 rounded-lg border border-violet-200 bg-violet-50/60 p-3">
      <Textarea rows={4} value={draft} onChange={(e) => setDraft(e.target.value)} className="bg-white" />
      <div className="flex items-center justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={() => setDraft(null)}>
          <X className="h-3.5 w-3.5" /> Discard
        </Button>
        <Button size="sm" onClick={send} disabled={sending}>
          {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
          Send
        </Button>
      </div>
    </div>
  );
}
