"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Flame, Dumbbell, Flag, Calendar } from 'lucide-react';
import { RoadmapCalendar } from './RoadmapCalendar';
import { CheckpointMixer } from './CheckpointMixer';

/* ─── Today's Session Hero ────────────────────────── */
function TodayHero({ plan }: { plan: any }) {
  const router = useRouter();
  // "Today" is day 1 since the plan just started
  const day1 = plan?.weeks?.[0]?.days?.find((d: any) => !d.isRestDay);
  const totalDays = (plan?.durationWeeks || plan?.weeks?.length || 12) * 7;
  const exerciseCount = day1?.exercises?.length ?? 0;
  const duration = day1?.estimatedDurationMinutes ?? 45;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-zinc-950/60 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-6 md:p-8 overflow-hidden"
    >
      {/* Subtle background glow */}
      <div className="absolute -top-16 -right-16 w-64 h-64 bg-[#39FF14]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full bg-[#39FF14] animate-pulse" />
          <span className="text-zinc-500 font-mono text-xs uppercase tracking-widest">Day 1 of {totalDays}</span>
        </div>

        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">
          {day1?.focus || 'Full Body Calibration'}
        </h2>

        <div className="flex flex-wrap items-center gap-3 mb-6 text-sm">
          <span className="inline-flex items-center gap-1.5 bg-[#39FF14]/10 border border-[#39FF14]/20 text-[#39FF14] px-3 py-1 rounded-full font-mono text-xs">
            <Dumbbell className="w-3 h-3" /> {exerciseCount} exercises
          </span>
          <span className="text-zinc-500 font-mono text-xs">~{duration} min</span>
          <span className="text-zinc-600 font-mono text-xs">{plan?.focus || 'General Fitness'}</span>
        </div>

        {/* Exercise preview pills */}
        {day1?.exercises && day1.exercises.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {day1.exercises.slice(0, 4).map((ex: any, i: number) => (
              <span key={i} className="text-xs bg-zinc-900 border border-zinc-800 text-zinc-300 px-3 py-1 rounded-full">
                {ex.name}
              </span>
            ))}
            {day1.exercises.length > 4 && (
              <span className="text-xs bg-zinc-900 border border-zinc-800 text-zinc-500 px-3 py-1 rounded-full">
                +{day1.exercises.length - 4} more
              </span>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={() => router.push('/workout')}
            className="h-14 px-8 text-base font-bold bg-[#39FF14] text-black hover:bg-[#32e011] rounded-xl shadow-[0_0_20px_rgba(57,255,20,0.2)]"
          >
            <Flame className="w-4 h-4 mr-2" /> Start Day 1
          </Button>
          <Button
            variant="ghost"
            onClick={() => document.getElementById('roadmap-calendar')?.scrollIntoView({ behavior: 'smooth' })}
            className="h-14 text-zinc-400 hover:text-white"
          >
            <Calendar className="w-4 h-4 mr-2" /> View Full Calendar
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Plan Stats Strip ───────────────────────────── */
function PlanStats({ plan }: { plan: any }) {
  const weeks = plan?.weeks || [];
  const totalWorkoutDays = weeks.flatMap((w: any) => w.days || []).filter((d: any) => !d.isRestDay).length;
  const totalRestDays = weeks.flatMap((w: any) => w.days || []).filter((d: any) => d.isRestDay).length;
  const checkpointWeeks = 1; // last week

  const stats = [
    { label: 'Total Weeks', value: plan?.durationWeeks || weeks.length },
    { label: 'Training Days', value: totalWorkoutDays },
    { label: 'Rest Days', value: totalRestDays },
    { label: 'Checkpoints', value: checkpointWeeks },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map(s => (
        <div key={s.label} className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-white tracking-tight">{s.value}</div>
          <div className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest mt-1">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

/* ─── Checkpoint Strip ───────────────────────────── */
function CheckpointStrip({ plan }: { plan: any }) {
  const weeks = plan?.weeks || [];
  const durationWeeks = plan?.durationWeeks || weeks.length;

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Flag className="w-4 h-4 text-purple-400" />
        <h3 className="text-sm font-bold text-white uppercase tracking-widest">Checkpoint Map</h3>
        <span className="text-xs text-purple-400 font-mono ml-auto">{durationWeeks} weeks total</span>
      </div>

      {/* Progress bar with checkpoint markers */}
      <div className="relative h-2 bg-zinc-800 rounded-full mb-5">
        {/* Show checkpoint at end of every 4 weeks */}
        {Array.from({ length: Math.floor(durationWeeks / 4) }).map((_, i) => {
          const pos = ((i + 1) * 4 / durationWeeks) * 100;
          return (
            <div
              key={i}
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-purple-500 border-2 border-zinc-950 shadow-[0_0_8px_rgba(168,85,247,0.6)]"
              style={{ left: `${Math.min(pos, 98)}%` }}
            />
          );
        })}
        {/* Start dot */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-3 h-3 rounded-full bg-[#39FF14] border-2 border-zinc-950 shadow-[0_0_8px_rgba(57,255,20,0.6)]" />
      </div>

      {/* Week labels */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {weeks.map((week: any, i: number) => {
          const isCheckpoint = i === weeks.length - 1 || ((i + 1) % 4 === 0);
          return (
            <div
              key={i}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-mono border flex items-center gap-1
                ${isCheckpoint
                  ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                }`}
            >
              {isCheckpoint && <Flag className="w-2.5 h-2.5" />}
              W{week.weekNumber}
            </div>
          );
        })}
      </div>

      <div className="mt-4">
        <CheckpointMixer plan={plan} />
      </div>
    </div>
  );
}

/* ─── Dashboard Shell ────────────────────────────── */
export function Dashboard() {
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("humanstack_plan");
    if (stored) {
      try { setPlan(JSON.parse(stored)); } catch (e) { console.error(e); }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center font-mono text-sm">
        Loading Control Panel...
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-[#F0F0F0] flex flex-col items-center justify-center text-center p-8">
        <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mb-6">
          <Dumbbell className="w-8 h-8 text-zinc-600" />
        </div>
        <h1 className="text-3xl font-bold mb-3">No Active Roadmap</h1>
        <p className="text-zinc-500 mb-8 max-w-sm">You haven't designed a plan yet. Build your AI-generated roadmap to begin.</p>
        <Button
          onClick={() => router.push('/design-roadmap')}
          className="h-14 px-10 text-lg font-bold bg-[#39FF14] text-black hover:bg-[#32e011] rounded-xl shadow-[0_0_20px_rgba(57,255,20,0.2)]"
        >
          Design Roadmap <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F0F0F0] p-4 md:p-8 pb-32">
      <div className="max-w-4xl mx-auto space-y-5">

        {/* Today's session */}
        <TodayHero plan={plan} />

        {/* Plan-level stats */}
        <PlanStats plan={plan} />

        {/* Full roadmap calendar — the main feature */}
        <div id="roadmap-calendar">
          <RoadmapCalendar plan={plan} />
        </div>

        {/* Checkpoint progress */}
        <CheckpointStrip plan={plan} />

      </div>
    </div>
  );
}
