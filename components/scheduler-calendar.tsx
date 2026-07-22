"use client";

import { addScheduleBlock, deleteScheduleBlock, updateScheduleBlock } from "@/app/actions";
import { Button, Input } from "@/components/ui";
import { cn } from "@/lib/utils";
import { Check, ChevronLeft, ChevronRight, Loader2, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export interface HoursRow {
  weekday: number;
  open: string | null;
  close: string | null;
}

export interface BlockRow {
  id: string;
  title: string;
  startsAt: string; // ISO
  endsAt: string;
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOUR_START = 7;
const HOUR_END = 20; // display window: 7:00 AM – 8:00 PM
const HOURS = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i);
const ROW_H = 28; // px per hour row

function mondayOf(d: Date): Date {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  const day = date.getDay();
  date.setDate(date.getDate() + (day === 0 ? -6 : 1 - day));
  return date;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function startOfDay(d: Date): Date {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}

function endOfDay(d: Date): Date {
  const r = new Date(d);
  r.setHours(23, 59, 59, 999);
  return r;
}

function minutesOfDay(d: Date): number {
  return d.getHours() * 60 + d.getMinutes();
}

function fmtHour(h: number): string {
  const period = h < 12 || h === 24 ? "AM" : "PM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12} ${period}`;
}

function fmtTime(d: Date): string {
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function toDateInput(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function toTimeInput(d: Date): string {
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

interface Pending {
  startsAt: Date;
  endsAt: Date;
  defaultTitle: string;
}

export function SchedulerCalendar({ hours, blocks }: { hours: HoursRow[]; blocks: BlockRow[] }) {
  const router = useRouter();
  const [weekOffset, setWeekOffset] = useState(0);
  const [pending, setPending] = useState<Pending | null>(null);
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Editing an existing block
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editStartTime, setEditStartTime] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [editEndTime, setEditEndTime] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // Drag state
  const headerDrag = useRef<{ start: number; end: number } | null>(null);
  const gridDrag = useRef<{ day: number; start: number; end: number } | null>(null);
  const [, forceRender] = useState(0); // re-render while dragging to show live preview

  const monday = mondayOf(new Date());
  const weekStart = addDays(monday, weekOffset * 7);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const today = startOfDay(new Date());

  const parsedBlocks = blocks.map((b) => ({ ...b, s: new Date(b.startsAt), e: new Date(b.endsAt) }));

  function hoursFor(date: Date) {
    return hours.find((h) => h.weekday === date.getDay());
  }

  function segmentsFor(date: Date) {
    const dStart = startOfDay(date);
    const dEnd = endOfDay(date);
    return parsedBlocks
      .filter((b) => b.s <= dEnd && b.e >= dStart)
      .map((b) => ({
        ...b,
        segStart: b.s < dStart ? dStart : b.s,
        segEnd: b.e > dEnd ? dEnd : b.e,
      }));
  }

  function endDrags() {
    headerDrag.current = null;
    gridDrag.current = null;
  }

  useEffect(() => {
    function onUp() {
      if (headerDrag.current) {
        const { start, end } = headerDrag.current;
        const lo = Math.min(start, end);
        const hi = Math.max(start, end);
        setPending({
          startsAt: startOfDay(days[lo]),
          endsAt: endOfDay(days[hi]),
          defaultTitle: "Out of office",
        });
        setTitle("Out of office");
      } else if (gridDrag.current) {
        const { day, start, end } = gridDrag.current;
        const lo = Math.min(start, end);
        const hi = Math.max(start, end);
        const s = new Date(days[day]);
        s.setHours(lo, 0, 0, 0);
        const e = new Date(days[day]);
        e.setHours(hi + 1, 0, 0, 0);
        setPending({ startsAt: s, endsAt: e, defaultTitle: "" });
        setTitle("");
      }
      if (headerDrag.current || gridDrag.current) endDrags();
      forceRender((n) => n + 1);
    }
    window.addEventListener("mouseup", onUp);
    return () => window.removeEventListener("mouseup", onUp);
    // days changes each render (new Date objects) but that's fine — we only
    // need the latest closure captured at mouseup time via ref reads above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekOffset]);

  async function confirmPending() {
    if (!pending) return;
    if (!title.trim()) {
      toast.error("Give this block a name");
      return;
    }
    setSaving(true);
    try {
      await addScheduleBlock(title.trim(), pending.startsAt.toISOString(), pending.endsAt.toISOString());
      toast.success("Block added", { description: "AuctionDesk won't suggest test drives during this time." });
      setPending(null);
      router.refresh();
    } catch {
      toast.error("Couldn't add the block");
    } finally {
      setSaving(false);
    }
  }

  async function removeBlock(id: string) {
    setRemovingId(id);
    try {
      await deleteScheduleBlock(id);
      toast.success("Block removed");
      if (editingBlockId === id) setEditingBlockId(null);
      router.refresh();
    } catch {
      toast.error("Couldn't remove the block");
    } finally {
      setRemovingId(null);
    }
  }

  function openEditBlock(seg: { id: string; title: string; s: Date; e: Date }) {
    setPending(null);
    endDrags();
    setEditingBlockId(seg.id);
    setEditTitle(seg.title);
    setEditStartDate(toDateInput(seg.s));
    setEditStartTime(toTimeInput(seg.s));
    setEditEndDate(toDateInput(seg.e));
    setEditEndTime(toTimeInput(seg.e));
  }

  async function saveEditedBlock() {
    if (!editingBlockId) return;
    if (!editTitle.trim()) {
      toast.error("Give this block a name");
      return;
    }
    const start = new Date(`${editStartDate}T${editStartTime}:00`);
    const end = new Date(`${editEndDate}T${editEndTime}:00`);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
      toast.error("End must be after start");
      return;
    }
    setSavingEdit(true);
    try {
      await updateScheduleBlock(editingBlockId, editTitle.trim(), start.toISOString(), end.toISOString());
      toast.success("Block updated");
      setEditingBlockId(null);
      router.refresh();
    } catch {
      toast.error("Couldn't update the block");
    } finally {
      setSavingEdit(false);
    }
  }

  const rangeStartMin = HOUR_START * 60;
  const rangeEndMin = HOUR_END * 60;
  const totalH = HOURS.length * ROW_H;
  const pxFor = (mins: number) => ((Math.min(Math.max(mins, rangeStartMin), rangeEndMin) - rangeStartMin) / 60) * ROW_H;

  return (
    <div className="space-y-3" onMouseLeave={endDrags}>
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">
          Click a day to block it off, or drag across days. Drag inside a day&apos;s column for a
          specific time range (like an auction run).
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setWeekOffset((w) => Math.max(0, w - 1))}
            disabled={weekOffset === 0}
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
            aria-label="Previous week"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-36 text-center text-xs font-medium text-slate-700">
            {weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} –{" "}
            {addDays(weekStart, 6).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
          <button
            onClick={() => setWeekOffset((w) => w + 1)}
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100 cursor-pointer"
            aria-label="Next week"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <div className="grid min-w-[640px] grid-cols-[3rem_repeat(7,1fr)]">
          {/* Day headers */}
          <div />
          {days.map((d, i) => {
            const isToday = startOfDay(d).getTime() === today.getTime();
            return (
              <div
                key={i}
                onMouseDown={() => {
                  setEditingBlockId(null);
                  headerDrag.current = { start: i, end: i };
                  forceRender((n) => n + 1);
                }}
                onMouseEnter={() => {
                  if (headerDrag.current) {
                    headerDrag.current.end = i;
                    forceRender((n) => n + 1);
                  }
                }}
                className={cn(
                  "cursor-pointer border-b border-l border-slate-200 py-1.5 text-center select-none first:border-l-0",
                  isToday ? "bg-blue-50" : "bg-slate-50 hover:bg-slate-100",
                  headerDrag.current &&
                    i >= Math.min(headerDrag.current.start, headerDrag.current.end) &&
                    i <= Math.max(headerDrag.current.start, headerDrag.current.end) &&
                    "bg-violet-100",
                )}
              >
                <p className="text-[11px] font-semibold text-slate-600">{DAY_LABELS[i]}</p>
                <p className={cn("text-xs", isToday ? "font-bold text-blue-700" : "text-slate-400")}>
                  {d.getDate()}
                </p>
              </div>
            );
          })}

          {/* Hour gutter */}
          <div className="relative" style={{ height: totalH }}>
            {HOURS.map((h) => (
              <div
                key={h}
                className="absolute right-1.5 -translate-y-1/2 text-[10px] text-slate-400"
                style={{ top: (h - HOUR_START) * ROW_H }}
              >
                {fmtHour(h)}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((d, dayIdx) => {
            const dh = hoursFor(d);
            const closed = !dh?.open || !dh?.close;
            const openPx = dh?.open ? pxFor(Number(dh.open.slice(0, 2)) * 60 + Number(dh.open.slice(3))) : 0;
            const closePx = dh?.close
              ? pxFor(Number(dh.close.slice(0, 2)) * 60 + Number(dh.close.slice(3)))
              : 0;
            const segs = segmentsFor(d);
            const previewDrag =
              gridDrag.current?.day === dayIdx
                ? { lo: Math.min(gridDrag.current.start, gridDrag.current.end), hi: Math.max(gridDrag.current.start, gridDrag.current.end) }
                : null;

            return (
              <div key={dayIdx} className="relative border-l border-slate-100 first:border-l-0" style={{ height: totalH }}>
                {/* Closed / open shading — pointer-events-none so it never
                    intercepts clicks meant for the hour cells beneath it
                    (position:absolute paints above in-flow siblings). */}
                {closed ? (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-slate-50">
                    <span className="rotate-0 text-[10px] text-slate-300">Closed</span>
                  </div>
                ) : (
                  <div
                    className="pointer-events-none absolute inset-x-0 bg-emerald-50"
                    style={{ top: openPx, height: Math.max(0, closePx - openPx) }}
                  />
                )}

                {/* Hour cells for drag interaction */}
                {HOURS.map((h) => (
                  <div
                    key={h}
                    style={{ height: ROW_H }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setEditingBlockId(null);
                      gridDrag.current = { day: dayIdx, start: h, end: h };
                      forceRender((n) => n + 1);
                    }}
                    onMouseEnter={() => {
                      if (gridDrag.current?.day === dayIdx) {
                        gridDrag.current.end = h;
                        forceRender((n) => n + 1);
                      }
                    }}
                    className="border-b border-slate-100/60"
                  />
                ))}

                {/* Live drag preview */}
                {previewDrag && (
                  <div
                    className="pointer-events-none absolute inset-x-0.5 rounded bg-violet-300/60"
                    style={{
                      top: (previewDrag.lo - HOUR_START) * ROW_H,
                      height: (previewDrag.hi - previewDrag.lo + 1) * ROW_H,
                    }}
                  />
                )}

                {/* Saved blocks — click to edit, hover for quick-delete */}
                {segs.map((seg) => {
                  const top = pxFor(minutesOfDay(seg.segStart));
                  const height = Math.max(6, pxFor(minutesOfDay(seg.segEnd)) - top);
                  return (
                    <button
                      key={seg.id + seg.segStart.toISOString()}
                      type="button"
                      onClick={() => openEditBlock(seg)}
                      className="group absolute inset-x-0.5 overflow-hidden rounded bg-violet-500/90 px-1 py-0.5 text-left text-[10px] leading-tight text-white hover:bg-violet-600 cursor-pointer"
                      style={{ top, height }}
                    >
                      <span className="line-clamp-2">{seg.title}</span>
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          removeBlock(seg.id);
                        }}
                        className="absolute top-0.5 right-0.5 hidden rounded-full bg-black/30 p-0.5 group-hover:block cursor-pointer"
                        aria-label={`Remove ${seg.title}`}
                      >
                        {removingId === seg.id ? (
                          <Loader2 className="h-2.5 w-2.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-2.5 w-2.5" />
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-sm bg-emerald-50 ring-1 ring-emerald-200" /> Open
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-sm bg-slate-50 ring-1 ring-slate-200" /> Closed
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-sm bg-violet-500" /> Blocked (out of office, etc.)
        </span>
      </div>

      {pending && (
        <div className="space-y-2 rounded-lg border border-violet-300 bg-violet-50/70 p-3">
          <p className="text-xs font-medium text-violet-900">
            New block:{" "}
            {pending.startsAt.toDateString() === pending.endsAt.toDateString() ? (
              <>
                {pending.startsAt.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                {", "}
                {fmtTime(pending.startsAt)} – {fmtTime(pending.endsAt)}
              </>
            ) : (
              <>
                {pending.startsAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })} –{" "}
                {pending.endsAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })} (all day)
              </>
            )}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Out of office, auction run, lunch…"
              className="h-9 max-w-64"
              autoFocus
            />
            <Button size="sm" onClick={confirmPending} disabled={saving}>
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              Add block
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setPending(null)} disabled={saving}>
              <X className="h-3.5 w-3.5" /> Cancel
            </Button>
          </div>
        </div>
      )}

      {editingBlockId && (
        <div className="space-y-2 rounded-lg border border-blue-300 bg-blue-50/70 p-3">
          <p className="text-xs font-medium text-blue-900">Edit block</p>
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Out of office, auction run, lunch…"
            className="h-9 max-w-64"
            autoFocus
          />
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500">From</span>
            <Input
              type="date"
              value={editStartDate}
              onChange={(e) => setEditStartDate(e.target.value)}
              className="h-9 w-36"
            />
            <Input
              type="time"
              value={editStartTime}
              onChange={(e) => setEditStartTime(e.target.value)}
              className="h-9 w-28"
            />
            <span className="text-xs text-slate-500">to</span>
            <Input
              type="date"
              value={editEndDate}
              onChange={(e) => setEditEndDate(e.target.value)}
              className="h-9 w-36"
            />
            <Input
              type="time"
              value={editEndTime}
              onChange={(e) => setEditEndTime(e.target.value)}
              className="h-9 w-28"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" onClick={saveEditedBlock} disabled={savingEdit}>
              {savingEdit ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              Save
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeBlock(editingBlockId)}
              disabled={savingEdit || removingId === editingBlockId}
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setEditingBlockId(null)} disabled={savingEdit}>
              <X className="h-3.5 w-3.5" /> Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
