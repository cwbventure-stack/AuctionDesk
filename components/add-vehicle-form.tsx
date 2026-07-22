"use client";

import { createVehicle } from "@/app/actions";
import { ListingTabs } from "@/components/listing-tabs";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from "@/components/ui";
import type { GeneratedListing } from "@/lib/ai";
import { cn } from "@/lib/utils";
import { Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface TemplateOption {
  id: string;
  name: string;
  channel: string;
}

const TEMPLATE_FIELDS = [
  { key: "description", label: "Sales Description template" },
  { key: "facebook", label: "Facebook template" },
  { key: "craigslist", label: "Craigslist template" },
] as const;

// Every field is required: all of it feeds listings, replies, and follow-ups.
const REQUIRED_FIELDS = ["vin", "year", "make", "model", "trim", "mileage", "cost", "price"] as const;

const FIELD_LABELS: Record<string, string> = {
  vin: "VIN",
  year: "Year",
  make: "Make",
  model: "Model",
  trim: "Trim",
  mileage: "Mileage",
  cost: "Cost",
  price: "Asking price",
};

function withCommas(raw: string) {
  return raw ? Number(raw).toLocaleString("en-US") : "";
}

export function AddVehicleForm({ templates }: { templates: TemplateOption[] }) {
  const router = useRouter();
  const [form, setForm] = useState({
    vin: "",
    year: "",
    make: "",
    model: "",
    trim: "",
    mileage: "",
    cost: "",
    price: "",
  });
  const [templateIds, setTemplateIds] = useState<Record<string, string>>({
    description: "",
    facebook: "",
    craigslist: "",
  });
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [listing, setListing] = useState<GeneratedListing | null>(null);
  const [listingKey, setListingKey] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  const clearError = (k: string) =>
    setErrors((prev) => {
      if (!prev.has(k)) return prev;
      const next = new Set(prev);
      next.delete(k);
      return next;
    });

  // Text fields: store as typed.
  const setText = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    clearError(k);
  };

  // Numeric fields: strip every non-digit so text can't be entered at all.
  const setNumeric =
    (k: keyof typeof form, maxLen?: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
      let digits = e.target.value.replace(/\D/g, "");
      if (maxLen) digits = digits.slice(0, maxLen);
      setForm((f) => ({ ...f, [k]: digits }));
      clearError(k);
    };

  // Demo nicety: a 17-char VIN "decodes" to a plausible vehicle so the flow
  // feels real without a VIN API.
  function maybeDecodeVin(vin: string) {
    if (vin.trim().length === 17 && !form.make) {
      setForm((f) => ({
        ...f,
        year: f.year || "2018",
        make: f.make || "Chevrolet",
        model: f.model || "Silverado 1500",
        trim: f.trim || "LT Crew Cab 4x4",
      }));
      setErrors(new Set());
      toast.success("VIN decoded", { description: "Year, make, model and trim filled in." });
    }
  }

  // Returns the first problem message, or null if everything is valid.
  // Also populates `errors` so the offending fields highlight red.
  function validate(): string | null {
    const bad = new Set<string>();
    for (const k of REQUIRED_FIELDS) {
      if (!String(form[k]).trim()) bad.add(k);
    }
    if (bad.size) {
      setErrors(bad);
      const names = [...bad].map((k) => FIELD_LABELS[k]).join(", ");
      return `Please fill in every field. Missing: ${names}.`;
    }
    if (form.vin.trim().length !== 17) {
      setErrors(new Set(["vin"]));
      return "A VIN is 17 characters.";
    }
    const year = Number(form.year);
    if (year < 1980 || year > new Date().getFullYear() + 1) {
      setErrors(new Set(["year"]));
      return "Enter a valid year.";
    }
    if (Number(form.price) <= 0) {
      setErrors(new Set(["price"]));
      return "Asking price must be greater than zero.";
    }
    setErrors(new Set());
    return null;
  }

  async function generate() {
    const problem = validate();
    if (problem) {
      toast.error(problem);
      return;
    }
    setGenerating(true);
    setListing(null);
    try {
      const res = await fetch("/api/ai/listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          descriptionTemplateId: templateIds.description || undefined,
          facebookTemplateId: templateIds.facebook || undefined,
          craigslistTemplateId: templateIds.craigslist || undefined,
        }),
      });
      if (!res.ok) throw new Error();
      setListing(await res.json());
      setListingKey((k) => k + 1);
    } catch {
      toast.error("Couldn't generate the listing — try again");
    } finally {
      setGenerating(false);
    }
  }

  async function save() {
    if (!listing) return;
    // Re-validate in case a field was cleared after generating.
    const problem = validate();
    if (problem) {
      toast.error(problem);
      return;
    }
    setSaving(true);
    try {
      const id = await createVehicle({
        vin: form.vin,
        year: Number(form.year),
        make: form.make,
        model: form.model,
        trim: form.trim,
        mileage: Number(form.mileage),
        cost: Number(form.cost),
        price: Number(form.price),
        description: listing.description,
      });
      toast.success("Vehicle added to inventory");
      router.push(`/app/inventory/${id}`);
    } catch (e) {
      toast.error(e instanceof Error && e.message ? e.message : "Couldn't save the vehicle");
      setSaving(false);
    }
  }

  const errorClass = (k: string) => (errors.has(k) ? "border-red-400 focus:border-red-500 focus:ring-red-100" : "");

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Vehicle info</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="col-span-2 sm:col-span-3">
            <Label htmlFor="vin">VIN *</Label>
            <Input
              id="vin"
              placeholder="17-character VIN"
              value={form.vin}
              onChange={setText("vin")}
              onBlur={(e) => maybeDecodeVin(e.target.value)}
              maxLength={17}
              className={cn("font-mono uppercase", errorClass("vin"))}
            />
          </div>
          <div>
            <Label htmlFor="year">Year *</Label>
            <Input
              id="year"
              inputMode="numeric"
              placeholder="2018"
              value={form.year}
              onChange={setNumeric("year", 4)}
              className={errorClass("year")}
            />
          </div>
          <div>
            <Label htmlFor="make">Make *</Label>
            <Input id="make" placeholder="Chevrolet" value={form.make} onChange={setText("make")} className={errorClass("make")} />
          </div>
          <div>
            <Label htmlFor="model">Model *</Label>
            <Input id="model" placeholder="Silverado 1500" value={form.model} onChange={setText("model")} className={errorClass("model")} />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <Label htmlFor="trim">Trim *</Label>
            <Input id="trim" placeholder="LT Crew Cab (or “Base”)" value={form.trim} onChange={setText("trim")} className={errorClass("trim")} />
          </div>
          <div>
            <Label htmlFor="mileage">Mileage *</Label>
            <Input
              id="mileage"
              inputMode="numeric"
              placeholder="84,000"
              value={withCommas(form.mileage)}
              onChange={setNumeric("mileage")}
              className={errorClass("mileage")}
            />
          </div>
          <div>
            <Label htmlFor="price">Asking price *</Label>
            <Input
              id="price"
              inputMode="numeric"
              placeholder="18,995"
              value={withCommas(form.price)}
              onChange={setNumeric("price")}
              className={errorClass("price")}
            />
          </div>
          <div className="col-span-2 sm:col-span-3">
            <Label htmlFor="cost">Your cost * (private — never shown in listings)</Label>
            <Input
              id="cost"
              inputMode="numeric"
              placeholder="14,500"
              value={withCommas(form.cost)}
              onChange={setNumeric("cost")}
              className={errorClass("cost")}
            />
          </div>
          <div className="col-span-2 grid grid-cols-1 gap-3 sm:col-span-3 sm:grid-cols-3">
            {TEMPLATE_FIELDS.map((f) => {
              const options = templates.filter((t) => t.channel === f.key);
              return (
                <div key={f.key}>
                  <Label htmlFor={`template-${f.key}`}>{f.label}</Label>
                  <select
                    id={`template-${f.key}`}
                    value={templateIds[f.key]}
                    onChange={(e) => setTemplateIds((t) => ({ ...t, [f.key]: e.target.value }))}
                    className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">AuctionDesk default</option>
                    {options.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
            <p className="col-span-full text-[11px] text-slate-400">
              Your personal templates — manage them in{" "}
              <Link href="/app/settings" className="text-blue-600 underline">
                Settings
              </Link>
              .
            </p>
          </div>
          <div className="col-span-2 sm:col-span-3">
            <Button onClick={generate} disabled={generating} className="w-full sm:w-auto">
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {generating ? "Writing your listings…" : "Generate Listing"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {generating && (
        <Card className="animate-pulse">
          <CardContent className="space-y-3 p-5">
            <div className="h-3 w-2/3 rounded bg-slate-200" />
            <div className="h-3 w-full rounded bg-slate-200" />
            <div className="h-3 w-5/6 rounded bg-slate-200" />
            <div className="h-3 w-1/2 rounded bg-slate-200" />
          </CardContent>
        </Card>
      )}

      {listing && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-900">
            Your listing set — hit Edit on any tab to tweak it before saving
          </h2>
          <ListingTabs key={listingKey} listing={listing} onChange={setListing} />
          <Button onClick={save} disabled={saving} size="lg" className="w-full sm:w-auto">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save to Inventory
          </Button>
        </div>
      )}
    </div>
  );
}
