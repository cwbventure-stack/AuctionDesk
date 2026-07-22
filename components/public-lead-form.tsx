"use client";

import { submitPublicLead } from "@/app/public-actions";
import { Button, Input, Label, Textarea } from "@/components/ui";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";

export function PublicLeadForm({
  dealershipSlug,
  vehicleId,
}: {
  dealershipSlug: string;
  vehicleId: string;
}) {
  const [form, setForm] = useState({ name: "", contact: "", message: "" });
  const [smsConsent, setSmsConsent] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const result = await submitPublicLead({ dealershipSlug, vehicleId, ...form, smsConsent });
    if (result.ok) setSent(true);
    else setError(result.message);
    setBusy(false);
  }

  if (sent) {
    return (
      <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
        <p className="text-sm text-emerald-800">
          Thanks! We got your message and will be in touch shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      )}
      <div>
        <Label htmlFor="lead-name">Your name</Label>
        <Input id="lead-name" value={form.name} onChange={set("name")} placeholder="Jane Smith" />
      </div>
      <div>
        <Label htmlFor="lead-contact">Phone or email</Label>
        <Input
          id="lead-contact"
          value={form.contact}
          onChange={set("contact")}
          placeholder="(920) 555-0134"
        />
      </div>
      <div>
        <Label htmlFor="lead-message">Message</Label>
        <Textarea
          id="lead-message"
          rows={3}
          value={form.message}
          onChange={set("message")}
          placeholder="Is this still available? Can I see it this weekend?"
        />
      </div>
      {/* TCPA: explicit, unchecked-by-default consent before we may text them. */}
      <label className="flex items-start gap-2 text-[11px] leading-relaxed text-slate-500">
        <input
          type="checkbox"
          checked={smsConsent}
          onChange={(e) => setSmsConsent(e.target.checked)}
          className="mt-0.5"
        />
        <span>
          Text me about this vehicle and other updates. Message and data rates may apply; reply
          STOP to opt out.
        </span>
      </label>
      <Button type="submit" disabled={busy} className="w-full">
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        Send message
      </Button>
    </form>
  );
}
