"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, Dumbbell, BatteryCharging, Flag, Flame, Lock, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface PlanDay {
  dayNumber: number;
  isRestDay: boolean;
  focus?: string;
  estimatedDurationMinutes?: number;
  exercises?: { name: string; sets: number; reps: string; notes?: string }[];
}

interface CalendarCell {
  date: Date;
  planDay?: PlanDay & { weekIndex: number; isCheckpointWeek: boolean };
  isToday: boolean;
  isPast: boolean;
}

function buildCells(plan: any, startDate: Date): CalendarCell[] {
  const weeks: any[] = plan?.weeks || [];
  const allDays: (PlanDay & { weekIndex: number; isCheckpointWeek: boolean })[] = [];
  weeks.forEach((w: any, wIdx: number) => {
    (w.days || []).forEach((day: any) => allDays.push({ ...day, weekIndex: wIdx, isCheckpointWeek: wIdx === weeks.length - 1 }));
  });

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const dayMap = new Map<string, typeof allDays[0]>();
  allDays.forEach((d, i) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    dayMap.set(date.toDateString(), d);
  });

  const planEnd = new Date(startDate);
  planEnd.setDate(startDate.getDate() + allDays.length - 1);
  const gridStart = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  const gridEnd = new Date(planEnd.getFullYear(), planEnd.getMonth() + 1, 0);
  const cells: CalendarCell[] = [];
  const cur = new Date(gridStart);
  while (cur <= gridEnd) {
    const planDay = dayMap.get(cur.toDateString());
    cells.push({ date: new Date(cur), planDay, isToday: cur.toDateString() === today.toDateString(), isPast: cur < today });
    cur.setDate(cur.getDate() + 1);
  }
  return cells;
}

function groupByMonth(cells: CalendarCell[]) {
  const months: { label: string; year: number; month: number; cells: CalendarCell[] }[] = [];
  cells.forEach((cell) => {
    const m = cell.date.getMonth(), y = cell.date.getFullYear();
    const ex = months.find((x) => x.month === m && x.year === y);
    if (ex) ex.cells.push(cell);
    else months.push({ label: cell.date.toLocaleString("default", { month: "long", year: "numeric" }), year: y, month: m, cells: [cell] });
  });
  return months;
}

function cellStyle(cell: CalendarCell): string {
  if (!cell.planDay) return "text-white/15 cursor-default";
  const cp = cell.planDay.isCheckpointWeek && !cell.planDay.isRestDay;
  if (cp) return "bg-purple-500/15 border border-purple-500/40 text-purple-300 cursor-pointer hover:bg-purple-500/25";
  if (cell.planDay.isRestDay) return "bg-white/3 border border-white/6 text-white/30 cursor-pointer hover:border-white/12";
  if (cell.isPast) return "bg-blue-500/15 border border-blue-500/25 text-blue-400/60 cursor-pointer";
  return "bg-blue-500/15 border border-blue-500/35 text-blue-300 cursor-pointer hover:bg-blue-500/25 hover:border-blue-500/60";
}

/* ─── Day Detail Sheet ── */
function DaySheet({ cell, onClose }: { cell: CalendarCell; onClose: () => void }) {
  const router = useRouter();
  const d = cell.planDay!;
  const isCP = d.isCheckpointWeek && !d.isRestDay;
  const label = cell.date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="bg-[#0F0F18] border border-white/8 rounded-t-3xl w-full max-w-lg overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1"><div className="w-10 h-1 bg-white/10 rounded-full" /></div>

        {/* Header */}
        <div className={`px-6 py-4 flex justify-between items-start border-b border-white/6 ${isCP ? "bg-purple-900/20" : ""}`}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              {isCP && <Flag className="w-4 h-4 text-purple-400" />}
              {d.isRestDay && <BatteryCharging className="w-4 h-4 text-white/40" />}
              {!d.isRestDay && !isCP && <Dumbbell className="w-4 h-4 text-blue-400" />}
              <span className={`text-xs font-mono uppercase tracking-widest ${isCP ? "text-purple-400" : d.isRestDay ? "text-white/30" : "text-blue-400"}`}>
                {isCP ? "Checkpoint" : d.isRestDay ? "Rest Day" : `Day ${d.dayNumber}`}
              </span>
            </div>
            <h3 className="font-heading font-bold text-xl text-white">{d.isRestDay ? "Recovery Day" : d.focus || "Training Session"}</h3>
            <p className="text-[#9CA3AF] text-sm mt-0.5">{label}</p>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white p-1 transition-colors"><X className="w-5 h-5" /></button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 max-h-[50vh] overflow-y-auto space-y-2">
          {d.isRestDay ? (
            <div className="text-center py-8 text-[#9CA3AF]">
              <BatteryCharging className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Active recovery day. Mobility, hydration, sleep.</p>
            </div>
          ) : d.exercises?.length ? (
            <>
              {d.estimatedDurationMinutes && <p className="text-xs font-mono text-[#9CA3AF] mb-3">⏱ {d.estimatedDurationMinutes} min estimated</p>}
              {d.exercises.map((ex, i) => (
                <div key={i} className="flex justify-between items-center bg-white/3 border border-white/6 px-4 py-3 rounded-xl">
                  <div>
                    <p className="font-medium text-white text-sm">{ex.name}</p>
                    {ex.notes && <p className="text-xs text-[#9CA3AF] mt-0.5 italic">{ex.notes}</p>}
                  </div>
                  <div className="font-mono text-blue-400 text-sm font-semibold ml-4 shrink-0">{ex.sets}×{ex.reps}</div>
                </div>
              ))}
            </>
          ) : (
            <p className="text-[#9CA3AF] text-sm text-center py-6">No exercise details for this day.</p>
          )}
        </div>

        {/* CTA */}
        <div className="px-6 pb-8 pt-4 border-t border-white/6">
          {d.isRestDay ? (
            <button onClick={() => router.push("/recovery")} className="w-full py-3.5 rounded-xl font-semibold text-black text-sm bg-gradient-to-r from-cyan-400 to-blue-400 hover:opacity-90 transition-opacity">
              Start Active Recovery
            </button>
          ) : (
            <button onClick={() => router.push("/workout")} className="w-full py-3.5 rounded-xl font-semibold text-white text-sm bg-blue-600 hover:bg-blue-500 transition-all hover:shadow-[0_0_24px_rgba(59,130,246,0.4)] flex items-center justify-center gap-2">
              <Flame className="w-4 h-4" /> Start This Session
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Month Grid ── */
function MonthGrid({ month, onDayClick }: { month: { label: string; cells: CalendarCell[]; month: number; year: number }; onDayClick: (c: CalendarCell) => void }) {
  const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const firstDow = month.cells[0]?.date.getDay() ?? 0;
  const padded: (CalendarCell | null)[] = [...Array(firstDow).fill(null), ...month.cells];

  return (
    <div>
      <div className="grid grid-cols-7 mb-2">
        {DOW.map((d) => <div key={d} className="text-center text-[9px] font-mono text-white/20 uppercase tracking-widest py-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {padded.map((cell, i) => {
          if (!cell) return <div key={`pad-${i}`} />;
          const isCP = cell.planDay?.isCheckpointWeek && !cell.planDay?.isRestDay;
          return (
            <div
              key={cell.date.toDateString()}
              onClick={() => cell.planDay && onDayClick(cell)}
              className={`relative rounded-xl p-1 min-h-[48px] flex flex-col items-center justify-start transition-all select-none ${cellStyle(cell)} ${cell.isToday ? "ring-2 ring-blue-500 ring-offset-1 ring-offset-[#0A0A0A]" : ""}`}
            >
              <span className={`text-[10px] font-mono font-bold mt-0.5 ${cell.isToday ? "text-white" : ""}`}>{cell.date.getDate()}</span>
              {cell.planDay && (
                <div className="mt-0.5">
                  {isCP ? <Flag className="w-2.5 h-2.5 text-purple-400" /> : cell.planDay.isRestDay ? <BatteryCharging className="w-2.5 h-2.5" /> : <Dumbbell className="w-2.5 h-2.5" />}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Locked state ── */
function LockedCalendar() {
  const router = useRouter();
  return (
    <div className="relative">
      <div className="opacity-20 pointer-events-none select-none">
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }, (_, i) => (
            <div key={i} className="rounded-xl min-h-[48px] bg-white/3 border border-white/5" />
          ))}
        </div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="glass rounded-2xl px-6 py-5 text-center max-w-xs border border-white/8 shadow-2xl">
          <Lock className="w-6 h-6 text-white/30 mx-auto mb-3" />
          <p className="font-heading font-semibold text-white text-sm mb-1">Calendar locked</p>
          <p className="text-[#9CA3AF] text-xs mb-4">Create a routine to unlock your 30-day calendar.</p>
          <button
            onClick={() => router.push("/create-routine")}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl mx-auto transition-all hover:shadow-[0_0_16px_rgba(59,130,246,0.4)]"
          >
            Build My Plan <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Legend ── */
function Legend() {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-mono text-[#9CA3AF]">
      {[
        { color: "bg-blue-500/15 border border-blue-500/35", label: "Workout" },
        { color: "bg-white/3 border border-white/6", label: "Rest" },
        { color: "bg-purple-500/15 border border-purple-500/40", label: "Checkpoint" },
        { color: "ring-2 ring-blue-500 bg-transparent", label: "Today" },
      ].map(({ color, label }) => (
        <div key={label} className="flex items-center gap-1.5">
          <div className={`w-3 h-3 rounded ${color}`} />
          {label}
        </div>
      ))}
    </div>
  );
}

/* ─── Main ── */
export function CalendarTab({ plan }: { plan: any }) {
  const [selectedCell, setSelectedCell] = useState<CalendarCell | null>(null);
  const [monthOffset, setMonthOffset] = useState(0);
  const startDate = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);
  const cells = useMemo(() => plan?.weeks?.length ? buildCells(plan, startDate) : [], [plan, startDate]);
  const months = useMemo(() => groupByMonth(cells), [cells]);
  const visibleMonth = months[monthOffset] ?? months[0];
  const hasPlan = plan?.weeks?.length > 0;

  return (
    <div className="space-y-5">
      {hasPlan && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading font-bold text-xl text-white">Your Roadmap</h2>
            <p className="text-[#9CA3AF] text-sm mt-0.5">{plan.durationWeeks || months.length}wk plan · Tap any day for details</p>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setMonthOffset((o) => Math.max(0, o - 1))} disabled={monthOffset === 0} className="w-8 h-8 rounded-xl glass border border-white/8 flex items-center justify-center text-[#9CA3AF] hover:text-white disabled:opacity-30 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-mono text-[#9CA3AF] w-28 text-center">{visibleMonth?.label}</span>
            <button onClick={() => setMonthOffset((o) => Math.min(months.length - 1, o + 1))} disabled={monthOffset >= months.length - 1} className="w-8 h-8 rounded-xl glass border border-white/8 flex items-center justify-center text-[#9CA3AF] hover:text-white disabled:opacity-30 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Week pills */}
      {hasPlan && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {(plan.weeks || []).map((w: any, i: number) => {
            const isCP = i === plan.weeks.length - 1;
            return (
              <div key={i} className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-mono border ${isCP ? "bg-purple-500/15 border-purple-500/40 text-purple-300" : "bg-white/3 border-white/6 text-white/40"}`}>
                {isCP && <Flag className="w-2.5 h-2.5" />}
                W{w.weekNumber}
              </div>
            );
          })}
        </div>
      )}

      {!hasPlan ? <LockedCalendar /> : visibleMonth && <MonthGrid month={visibleMonth} onDayClick={setSelectedCell} />}

      {hasPlan && (
        <div className="pt-3 border-t border-white/5"><Legend /></div>
      )}

      <AnimatePresence>
        {selectedCell && <DaySheet cell={selectedCell} onClose={() => setSelectedCell(null)} />}
      </AnimatePresence>
    </div>
  );
}
