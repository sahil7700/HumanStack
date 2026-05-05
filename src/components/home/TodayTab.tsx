"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dumbbell, CheckCircle2, Circle, ArrowRight, BatteryCharging, Flame, ChevronDown, ChevronUp } from "lucide-react";
import { useRouter } from "next/navigation";

interface Exercise { name: string; sets: number; reps: string; notes?: string; }
interface WorkoutDay { dayNumber: number; isRestDay: boolean; focus?: string; estimatedDurationMinutes?: number; exercises?: Exercise[]; }

function NoRoutineState() {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center min-h-[55vh] text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-white/3 border border-white/8 flex items-center justify-center mb-5">
        <Dumbbell className="w-8 h-8 text-white/20" />
      </div>
      <h3 className="font-heading font-bold text-xl text-white mb-2">No workout scheduled</h3>
      <p className="text-[#9CA3AF] text-sm mb-7 max-w-xs leading-relaxed">Create your AI-powered routine to see your daily workout plan.</p>
      <button onClick={() => router.push("/create-routine")} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]">
        Create Routine <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function RestDayState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[55vh] text-center px-6">
      <motion.div animate={{ scale: [1, 1.04, 1] }} transition={{ repeat: Infinity, duration: 3 }} className="text-5xl mb-5">😴</motion.div>
      <h3 className="font-heading font-bold text-2xl text-white mb-2">Rest Day</h3>
      <p className="text-[#9CA3AF] text-sm mb-8 max-w-xs">Recovery is part of the protocol. Adaptation happens at rest.</p>
      <div className="glass rounded-2xl p-5 max-w-xs w-full border border-white/8 text-left">
        <p className="text-[#9CA3AF] text-xs font-mono uppercase tracking-wider mb-3">Recommended today</p>
        {["Light walk (20–30 min)", "Mobility & stretching", "Foam rolling", "Hydration (2.5–3L)"].map((s) => (
          <div key={s} className="flex items-center gap-2.5 py-2 border-b border-white/5 last:border-0">
            <BatteryCharging className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="text-white/70 text-sm">{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActiveWorkout({ day }: { day: WorkoutDay }) {
  const router = useRouter();
  const [started, setStarted] = useState(false);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<string | null>(null);
  const exercises = day.exercises || [];

  const done = exercises.filter((_, i) =>
    Array.from({ length: exercises[i].sets }, (_, s) => `${i}-${s}`).every((k) => checked.has(k))
  ).length;

  const allDone = done === exercises.length && exercises.length > 0;
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  function toggleSet(ei: number, si: number) {
    const key = `${ei}-${si}`;
    setChecked((prev) => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });
  }

  function handleFinish() {
    const log = { date: new Date().toISOString(), focus: day.focus, exercises };
    const existing = JSON.parse(localStorage.getItem("humanstack_progress") || "[]");
    localStorage.setItem("humanstack_progress", JSON.stringify([log, ...existing]));
    router.push("/dashboard");
  }

  return (
    <div className="space-y-5">
      {/* Header card */}
      <div className="glass rounded-2xl p-5 border border-white/8">
        <p className="text-[#9CA3AF] text-xs font-mono mb-1">{dateStr}</p>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-mono px-2.5 py-0.5 rounded-full">Day {day.dayNumber}</span>
            </div>
            <h2 className="font-heading font-bold text-2xl text-white">{day.focus || "Training Session"}</h2>
            <p className="text-[#9CA3AF] text-sm mt-1">⏱ {day.estimatedDurationMinutes} min · {exercises.length} exercises</p>
          </div>
          {!started && (
            <button onClick={() => setStarted(true)} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] shrink-0">
              <Flame className="w-4 h-4" /> Start
            </button>
          )}
        </div>

        {/* Progress bar */}
        {started && (
          <div className="mt-4">
            <div className="flex justify-between text-xs font-mono text-[#9CA3AF] mb-1.5">
              <span>{done}/{exercises.length} done</span>
              <span>{Math.round((done / exercises.length) * 100)}%</span>
            </div>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" animate={{ width: `${(done / exercises.length) * 100}%` }} transition={{ duration: 0.4 }} />
            </div>
          </div>
        )}
      </div>

      {/* Exercise list */}
      <div className="space-y-2">
        {exercises.map((ex, i) => {
          const allSets = Array.from({ length: ex.sets }, (_, s) => `${i}-${s}`).every((k) => checked.has(k));
          const isOpen = expanded === `${i}`;
          return (
            <div key={i} className={`glass rounded-2xl overflow-hidden border transition-all ${allSets ? "border-blue-500/30 bg-blue-500/5" : "border-white/8"}`}>
              <div className="flex items-center justify-between px-5 py-4 cursor-pointer" onClick={() => started && setExpanded(isOpen ? null : `${i}`)}>
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${allSets ? "border-blue-500 bg-blue-500/20" : "border-white/15"}`}>
                    <span className="text-[10px] font-mono text-[#9CA3AF]">{i + 1}</span>
                  </div>
                  <div>
                    <p className={`font-medium text-sm ${allSets ? "text-blue-400/70 line-through" : "text-white"}`}>{ex.name}</p>
                    <p className="text-xs text-[#9CA3AF] font-mono">{ex.sets} × {ex.reps}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {allSets && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                  {started && (isOpen ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />)}
                </div>
              </div>

              <AnimatePresence>
                {isOpen && started && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                    <div className="px-5 pb-4 pt-1 space-y-2">
                      {ex.notes && <p className="text-xs text-[#9CA3AF] italic mb-2">{ex.notes}</p>}
                      {Array.from({ length: ex.sets }, (_, s) => {
                        const key = `${i}-${s}`;
                        const isDone = checked.has(key);
                        return (
                          <button key={key} onClick={() => toggleSet(i, s)} className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-xl border text-sm font-mono transition-all ${isDone ? "bg-blue-500/10 border-blue-500/30 text-blue-300" : "bg-white/3 border-white/6 text-[#9CA3AF] hover:border-white/12"}`}>
                            {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                            Set {s + 1} — {ex.reps} reps
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Finish */}
      {allDone && (
        <motion.button initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={handleFinish}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 rounded-xl text-sm hover:opacity-90 transition-opacity shadow-[0_0_32px_rgba(59,130,246,0.35)]">
          <CheckCircle2 className="w-5 h-5" /> Finish & Log Session ✓
        </motion.button>
      )}
    </div>
  );
}

export function TodayTab({ plan }: { plan: any }) {
  if (!plan?.weeks?.length) return <NoRoutineState />;
  const allDays: WorkoutDay[] = (plan.weeks || []).flatMap((w: any) => w.days || []);
  const today = allDays.find((d) => !d.isRestDay) ?? allDays[0];
  if (!today) return <NoRoutineState />;
  if (today.isRestDay) return <RestDayState />;
  return <ActiveWorkout day={today} />;
}
