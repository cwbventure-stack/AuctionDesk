"use client";

import { updateVehicleDetails } from "@/app/actions";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from "@/components/ui";
import { fullDate, money } from "@/lib/utils";
import { Check, Loader2, Pencil, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface Vehicle {
  id: string;
  vin: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  mileage: number;
  cost: number;
  price: number;
  acquiredAt: string; // ISO
}

export function VehicleDetailsCard({ vehicle }: { vehicle: Vehicle }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    year: String(vehicle.year),
    make: vehicle.make,
    model: vehicle.model,
    trim: vehicle.trim,
    mileage: String(vehicle.mileage),
    cost: String(vehicle.cost),
    price: String(vehicle.price),
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  // Numeric fields strip every non-digit — text can't be entered.
  const setNumeric =
    (k: keyof typeof form, maxLen?: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
      let digits = e.target.value.replace(/\D/g, "");
      if (maxLen) digits = digits.slice(0, maxLen);
      setForm((f) => ({ ...f, [k]: digits }));
    };

  function startEdit() {
    setForm({
      year: String(vehicle.year),
      make: vehicle.make,
      model: vehicle.model,
      trim: vehicle.trim,
      mileage: String(vehicle.mileage),
      cost: String(vehicle.cost),
      price: String(vehicle.price),
    });
    setEditing(true);
  }

  async function save() {
    const payload = {
      year: Number(form.year),
      make: form.make,
      model: form.model,
      trim: form.trim,
      mileage: Number(form.mileage) || 0,
      cost: Number(form.cost) || 0,
      price: Number(form.price) || 0,
    };
    setSaving(true);
    try {
      await updateVehicleDetails(vehicle.id, payload);
      toast.success("Vehicle details updated");
      setEditing(false);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error && e.message ? e.message : "Couldn't save changes");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Details</CardTitle>
        {!editing && (
          <button
            onClick={startEdit}
            className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 cursor-pointer"
          >
            <Pencil className="h-3.5 w-3.5" /> Edit
          </button>
        )}
      </CardHeader>
      <CardContent>
        {editing ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="d-year">Year</Label>
                <Input id="d-year" inputMode="numeric" value={form.year} onChange={setNumeric("year", 4)} />
              </div>
              <div>
                <Label htmlFor="d-make">Make</Label>
                <Input id="d-make" value={form.make} onChange={set("make")} />
              </div>
              <div>
                <Label htmlFor="d-model">Model</Label>
                <Input id="d-model" value={form.model} onChange={set("model")} />
              </div>
              <div>
                <Label htmlFor="d-trim">Trim</Label>
                <Input id="d-trim" value={form.trim} onChange={set("trim")} />
              </div>
              <div>
                <Label htmlFor="d-mileage">Mileage</Label>
                <Input id="d-mileage" inputMode="numeric" value={form.mileage} onChange={setNumeric("mileage")} />
              </div>
              <div>
                <Label htmlFor="d-price">Asking price</Label>
                <Input id="d-price" inputMode="numeric" value={form.price} onChange={setNumeric("price")} />
              </div>
              <div className="col-span-2">
                <Label htmlFor="d-cost">Your cost (private)</Label>
                <Input id="d-cost" inputMode="numeric" value={form.cost} onChange={setNumeric("cost")} />
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              VIN can&apos;t be changed here — create a new vehicle if you entered the wrong one.
            </p>
            <div className="flex gap-2">
              <Button size="sm" onClick={save} disabled={saving}>
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                Save changes
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setEditing(false)} disabled={saving}>
                <X className="h-3.5 w-3.5" /> Cancel
              </Button>
            </div>
          </div>
        ) : (
          <dl className="space-y-2 text-sm">
            {[
              ["Mileage", `${vehicle.mileage.toLocaleString()} mi`],
              ["Asking price", money(vehicle.price)],
              ["Your cost", money(vehicle.cost)],
              ["Potential gross", money(vehicle.price - vehicle.cost)],
              ["Acquired", fullDate(vehicle.acquiredAt)],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                <dt className="text-slate-500">{k}</dt>
                <dd className="font-medium text-slate-900">{v}</dd>
              </div>
            ))}
          </dl>
        )}
      </CardContent>
    </Card>
  );
}
