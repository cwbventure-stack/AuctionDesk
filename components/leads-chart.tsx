// Stacked bar chart: leads by source, last 6 months. Pure CSS/HTML.
// Palette: validated categorical slots (see dataviz validator run).
const SERIES: { key: string; label: string; color: string }[] = [
  { key: "facebook", label: "Facebook", color: "#2a78d6" },
  { key: "website", label: "Website", color: "#008300" },
  { key: "phone", label: "Phone", color: "#e87ba4" },
  { key: "walkin", label: "Walk-in", color: "#eda100" },
  { key: "craigslist", label: "Craigslist", color: "#1baf7a" },
];

export interface MonthBucket {
  label: string; // e.g. "Feb"
  counts: Record<string, number>;
}

export function LeadsChart({ months }: { months: MonthBucket[] }) {
  const totals = months.map((m) => SERIES.reduce((s, sr) => s + (m.counts[sr.key] ?? 0), 0));
  const max = Math.max(...totals, 1);
  const seriesTotals = SERIES.map((sr) => ({
    ...sr,
    total: months.reduce((s, m) => s + (m.counts[sr.key] ?? 0), 0),
  }));

  return (
    <div>
      <div className="flex h-44 items-end gap-2 sm:gap-4">
        {months.map((m, i) => (
          <div key={m.label} className="flex min-w-0 flex-1 flex-col items-center gap-1">
            <span className="text-[11px] font-semibold text-slate-700">{totals[i]}</span>
            <div
              className="flex w-full max-w-14 flex-col-reverse overflow-hidden rounded-t"
              style={{ height: `${(totals[i] / max) * 130}px` }}
            >
              {SERIES.map((sr) => {
                const c = m.counts[sr.key] ?? 0;
                if (!c) return null;
                return (
                  <div
                    key={sr.key}
                    title={`${sr.label}: ${c} lead${c === 1 ? "" : "s"} in ${m.label}`}
                    className="w-full border-t-2 border-white first:border-t-0"
                    style={{ height: `${(c / totals[i]) * 100}%`, backgroundColor: sr.color }}
                  />
                );
              })}
            </div>
            <span className="text-[11px] text-slate-500">{m.label}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-slate-100 pt-3">
        {seriesTotals.map((sr) => (
          <span key={sr.key} className="inline-flex items-center gap-1.5 text-xs text-slate-600">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: sr.color }} />
            {sr.label} · <span className="font-semibold text-slate-800">{sr.total}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
