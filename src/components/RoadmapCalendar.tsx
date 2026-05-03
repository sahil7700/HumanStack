"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, BatteryCharging, Dumbbell, Flag, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

/* ─── Types ─────────────────────────────────────── */
interface PlanDay {
  dayNumber: number;
  isRestDay: boolean;
  focus?: string;
  estimatedDurationMinutes?: number;
  exercises?: { name: string; sets: number; reps: string; notes?: string }[];
  isCheckpoint?: boolean;
}

interface CalendarCell {
  date: Date;
  planDay?: PlanDay;
  weekIndex?: number;
  isToday: boolean;
  isPast: boolean;
  isCheckpointWeek?: boolean;
}

/* ─── Helpers ────────────────────────────────────── */
function buildCalendarData(plan: any, startDate: Date): CalendarCell[] {
  const weeks: any[] = plan?.weeks || [];

  // Flatten all plan days into a linear list
  const allDays: (PlanDay & { weekIndex: number; isCheckpointWeek: boolean })[] = [];
  weeks.forEach((week: any, wIdx: number) => {
    const isCheckpointWeek = wIdx === weeks.length - 1;
    (week.days || []).forEach((day: any) => {
      allDays.push({ ...day, weekIndex: wIdx, isCheckpointWeek });
    });
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Build map: dateKey → planDay
  const dayMap = new Map<string, typeof allDays[0]>();
  allDays.forEach((d, i) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    const key = date.toDateString();
    dayMap.set(key, d);
  });

  // Build calendar grid for the months we need
  const planEnd = new Date(startDate);
  planEnd.setDate(startDate.getDate() + allDays.length - 1);

  // Show from start of the month containing startDate to end of month containing planEnd
  const gridStart = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  const gridEnd = new Date(planEnd.getFullYear(), planEnd.getMonth() + 1, 0);

  const cells: CalendarCell[] = [];
  const cur = new Date(gridStart);
  while (cur <= gridEnd) {
    const key = cur.toDateString();
    const planDay = dayMap.get(key);
    cells.push({
      date: new Date(cur),
      planDay,
      weekIndex: planDay?.weekIndex,
      isCheckpointWeek: planDay?.isCheckpointWeek,
      isToday: cur.toDateString() === today.toDateString(),
      isPast: cur < today,
    });
    cur.setDate(cur.getDate() + 1);
  }
  return cells;
}

function groupIntoMonths(cells: CalendarCell[]) {
  const months: { label: string; year: number; month: number; cells: CalendarCell[] }[] = [];
  cells.forEach(cell => {
    const m = cell.date.getMonth();
    const y = cell.date.getFullYear();
    const existing = months.find(x => x.month === m && x.year === y);
    if (existing) {
      existing.cells.push(cell);
    } else {
      months.push({
        label: cell.date.toLocaleString('default', { month: 'long', year: 'numeric' }),
        year: y, month: m,
        cells: [cell],
      });
    }
  });
  return months;
}

function getCellStyle(cell: CalendarCell) {
  if (!cell.planDay) return 'bg-transparent text-zinc-700 cursor-default';
  if (cell.isCheckpointWeek && !cell.planDay.isRestDay) {
    return 'bg-purple-500/20 border border-purple-500/60 text-purple-300 cursor-pointer hover:bg-purple-500/30';
  }
  if (cell.planDay.isRestDay) {
    return 'bg-zinc-900/60 border border-zinc-800 text-zinc-500 cursor-pointer hover:border-zinc-600';
  }
  if (cell.isPast) {
    return 'bg-[#39FF14]/10 border border-[#39FF14]/20 text-[#39FF14]/60 cursor-pointer';
  }
  return 'bg-[#39FF14]/15 border border-[#39FF14]/40 text-[#39FF14] cursor-pointer hover:bg-[#39FF14]/25 hover:border-[#39FF14]/70';
}

/* ─── Month Grid ─────────────────────────────────── */
function MonthGrid({ month, onDayClick }: {
  month: { label: string; cells: CalendarCell[]; month: number; year: number };
  onDayClick: (cell: CalendarCell) => void;
}) {
  const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Pad start with empty cells
  const firstDow = month.cells[0]?.date.getDay() ?? 0;
  const padded: (CalendarCell | null)[] = [
    ...Array(firstDow).fill(null),
    ...month.cells,
  ];

  return (
    <div>
      <h3 className="text-base font-bold text-white mb-4">{month.label}</h3>
      {/* Day-of-week header */}
      <div className="grid grid-cols-7 mb-2">
        {DOW.map(d => (
          <div key={d} className="text-center text-[10px] font-mono text-zinc-600 uppercase tracking-widest py-1">{d}</div>
        ))}
      </div>
      {/* Cells */}
      <div className="grid grid-cols-7 gap-1">
        {padded.map((cell, i) => {
          if (!cell) return <div key={`pad-${i}`} />;
          const isCheckpoint = cell.isCheckpointWeek && !cell.planDay?.isRestDay;
          return (
            <div
              key={cell.date.toDateString()}
              onClick={() => cell.planDay && onDayClick(cell)}
              className={`relative rounded-lg p-1 min-h-[52px] flex flex-col items-center justify-start transition-all duration-150 select-none ${getCellStyle(cell)} ${cell.isToday ? 'ring-2 ring-white' : ''}`}
            >
              {/* Date number */}
              <span className={`text-xs font-bold mt-0.5 ${cell.isToday ? 'text-white' : ''}`}>
                {cell.date.getDate()}
              </span>

              {/* Icon / label inside cell */}
              {cell.planDay && (
                <div className="mt-0.5 flex flex-col items-center gap-0.5">
                  {isCheckpoint ? (
                    <Flag className="w-3 h-3 text-purple-400" />
                  ) : cell.planDay.isRestDay ? (
                    <BatteryCharging className="w-3 h-3 text-zinc-600" />
                  ) : (
                    <Dumbbell className="w-3 h-3" />
                  )}
                  <span className="text-[8px] font-mono leading-none text-center line-clamp-1 max-w-[36px] hidden sm:block">
                    {isCheckpoint ? 'CHECK' : cell.planDay.isRestDay ? 'REST' : (cell.planDay.focus?.split(' ')[0] ?? 'TRAIN')}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Legend ─────────────────────────────────────── */
function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-zinc-400">
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded bg-[#39FF14]/20 border border-[#39FF14]/40" />
        Workout Day
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded bg-zinc-900 border border-zinc-700" />
        Rest
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded bg-purple-500/20 border border-purple-500/60" />
        Checkpoint
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded ring-2 ring-white bg-transparent" />
        Today
      </div>
    </div>
  );
}

/* ─── Day Detail Drawer ──────────────────────────── */
function DayDetail({ cell, onClose }: { cell: CalendarCell; onClose: () => void }) {
  const router = useRouter();
  const d = cell.planDay!;
  const isCheckpoint = cell.isCheckpointWeek && !d.isRestDay;
  const dateLabel = cell.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: 'spring', damping: 25 }}
        className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-5 border-b border-zinc-800 flex justify-between items-start ${isCheckpoint ? 'bg-purple-950/40' : ''}`}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              {isCheckpoint && <Flag className="w-4 h-4 text-purple-400" />}
              {d.isRestDay && <BatteryCharging className="w-4 h-4 text-zinc-400" />}
              {!d.isRestDay && !isCheckpoint && <Dumbbell className="w-4 h-4 text-[#39FF14]" />}
              <span className={`text-xs font-mono uppercase tracking-widest ${isCheckpoint ? 'text-purple-400' : d.isRestDay ? 'text-zinc-400' : 'text-[#39FF14]'}`}>
                {isCheckpoint ? 'CHECKPOINT WEEK' : d.isRestDay ? 'REST DAY' : `Day ${d.dayNumber}`}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white">
              {d.isRestDay ? 'Recovery Day' : d.focus || 'Training Session'}
            </h3>
            <p className="text-zinc-500 text-sm mt-0.5">{dateLabel}</p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 max-h-[55vh] overflow-y-auto">
          {d.isRestDay ? (
            <div className="text-center py-8 text-zinc-500">
              <BatteryCharging className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">Active recovery day. Focus on mobility, hydration, and sleep.</p>
            </div>
          ) : d.exercises && d.exercises.length > 0 ? (
            <div className="space-y-2">
              {d.estimatedDurationMinutes && (
                <p className="text-xs font-mono text-zinc-500 mb-3">Est. {d.estimatedDurationMinutes} min</p>
              )}
              {d.exercises.map((ex, i) => (
                <div key={i} className="flex justify-between items-center bg-zinc-900 border border-zinc-800 p-3 rounded-xl">
                  <div>
                    <div className="font-semibold text-white text-sm">{ex.name}</div>
                    {ex.notes && <div className="text-xs text-zinc-500 mt-0.5 italic">{ex.notes}</div>}
                  </div>
                  <div className="font-mono text-[#39FF14] text-sm font-bold shrink-0 ml-4">
                    {ex.sets}×{ex.reps}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-zinc-500 text-sm text-center py-6">No exercise details available for this day.</p>
          )}
        </div>

        {/* Footer CTA */}
        {!d.isRestDay ? (
          <div className="p-5 border-t border-zinc-800 bg-zinc-900/40">
            <Button
              onClick={() => router.push('/workout')}
              className="w-full h-12 font-bold bg-[#39FF14] text-black hover:bg-[#32e011] rounded-xl shadow-[0_0_20px_rgba(57,255,20,0.2)]"
            >
              <Flame className="w-4 h-4 mr-2" /> Start This Session
            </Button>
          </div>
        ) : (
          <div className="p-5 border-t border-zinc-800 bg-zinc-900/40">
            <Button
              onClick={() => router.push('/recovery')}
              className="w-full h-12 font-bold bg-[#00D9FF] text-black hover:bg-[#00c4e6] rounded-xl shadow-[0_0_20px_rgba(0,217,255,0.2)]"
            >
              Start Active Recovery
            </Button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ─── Main Export ────────────────────────────────── */
export function RoadmapCalendar({ plan }: { plan?: any }) {
  const [selectedCell, setSelectedCell] = useState<CalendarCell | null>(null);
  const [monthOffset, setMonthOffset] = useState(0);

  const startDate = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const cells = useMemo(() => {
    if (!plan?.weeks?.length) return [];
    return buildCalendarData(plan, startDate);
  }, [plan, startDate]);

  const months = useMemo(() => groupIntoMonths(cells), [cells]);

  if (!plan?.weeks?.length) return null;

  const visibleMonth = months[monthOffset] ?? months[0];

  return (
    <div className="bg-[#0A0A0A] border border-zinc-800 rounded-2xl p-5 md:p-7">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight">Your Roadmap</h3>
          <p className="text-zinc-500 text-sm mt-0.5">
            {plan.durationWeeks || months.length} week plan · Tap any day for details
          </p>
        </div>
        {/* Month navigation */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMonthOffset(o => Math.max(0, o - 1))}
            disabled={monthOffset === 0}
            className="p-2 rounded-lg hover:bg-zinc-800 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-zinc-400" />
          </button>
          <span className="text-sm font-mono text-zinc-300 w-28 text-center">{visibleMonth?.label}</span>
          <button
            onClick={() => setMonthOffset(o => Math.min(months.length - 1, o + 1))}
            disabled={monthOffset >= months.length - 1}
            className="p-2 rounded-lg hover:bg-zinc-800 disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-zinc-400" />
          </button>
        </div>
      </div>

      {/* Checkpoint summary bar */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {(plan.weeks || []).map((week: any, i: number) => {
          const isCheckpoint = i === (plan.weeks.length - 1);
          const isLast4 = i >= (plan.weeks.length - 1);
          return (
            <div
              key={i}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono border transition-colors
                ${isCheckpoint
                  ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                }`}
            >
              {isCheckpoint && <Flag className="w-3 h-3" />}
              W{week.weekNumber}
              {isCheckpoint && ' ✓'}
            </div>
          );
        })}
      </div>

      {/* Calendar grid */}
      {visibleMonth && (
        <MonthGrid month={visibleMonth} onDayClick={setSelectedCell} />
      )}

      {/* Legend */}
      <div className="mt-5 pt-4 border-t border-zinc-900">
        <Legend />
      </div>

      {/* Day detail modal */}
      <AnimatePresence>
        {selectedCell && (
          <DayDetail cell={selectedCell} onClose={() => setSelectedCell(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
