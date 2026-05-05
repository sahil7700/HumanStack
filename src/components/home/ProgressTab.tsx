"use client";

import React, { useMemo } from "react";
import { ArrowRight, Flame, TrendingUp, CheckCircle2, Dumbbell } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface WorkoutLog { date: string; focus: string; exercises: { name: string }[]; }

function Ring({ pct }: { pct: number }) {
  const r = 52, circ = 2 * Math.PI * r;
  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
        <motion.circle cx="60" cy="60" r={r} fill="none" stroke="url(#blueGrad)" strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circ} initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - pct / 100) }} transition={{ duration: 1.4, ease: "easeOut" }} />
        <defs>
          <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-heading font-bold text-3xl text-white">{Math.round(pct)}%</span>
        <span className="text-[10px] text-[#9CA3AF] font-mono uppercase tracking-wider">complete</span>
      </div>
    </div>
  );
}

function WeeklyChart({ logs }: { logs: WorkoutLog[] }) {
  const weeks = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 4 }, (_, i) => {
      const ws = new Date(now); ws.setDate(now.getDate() - now.getDay() - i * 7); ws.setHours(0, 0, 0, 0);
      const we = new Date(ws); we.setDate(ws.getDate() + 6);
      return { label: `W-${i === 0 ? "now" : i}`, count: logs.filter((l) => { const d = new Date(l.date); return d >= ws && d <= we; }).length };
    }).reverse();
  }, [logs]);

  const max = Math.max(...weeks.map((w) => w.count), 5);
  return (
    <div className="glass rounded-2xl p-5 border border-white/8">
      <p className="text-[#9CA3AF] text-xs font-mono uppercase tracking-wider mb-4">Weekly Volume</p>
      <div className="flex items-end gap-3 h-20">
        {weeks.map((w, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
            <motion.div
              className="w-full rounded-lg bg-gradient-to-t from-blue-600 to-purple-600 opacity-80"
              style={{ height: `${(w.count / max) * 100}%`, minHeight: "4px" }}
              initial={{ height: 0 }} animate={{ height: `${(w.count / max) * 100}%` }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: "easeOut" }}
            />
            <span className="text-[9px] text-[#9CA3AF] font-mono">{w.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyProgress({ hasPlan }: { hasPlan: boolean }) {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center min-h-[55vh] text-center px-6">
      <div className="w-16 h-16 rounded-2xl glass border border-white/8 flex items-center justify-center mb-5 relative overflow-hidden">
        <TrendingUp className="w-8 h-8 text-white/20" />
        {[30, 55, 75].map((y) => <div key={y} className="absolute w-full border-t border-dashed border-white/5" style={{ top: `${y}%` }} />)}
      </div>
      <h3 className="font-heading font-bold text-xl text-white mb-2">No progress yet</h3>
      <p className="text-[#9CA3AF] text-sm mb-7 max-w-xs leading-relaxed">
        {hasPlan ? "Complete your first workout to start tracking your progress." : "Create a routine to begin tracking."}
      </p>
      <button
        onClick={() => router.push(hasPlan ? "/dashboard" : "/create-routine")}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]"
      >
        {hasPlan ? "Do Today's Workout" : "Create Routine"} <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ProgressTab({ plan }: { plan: any }) {
  const logs: WorkoutLog[] = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("humanstack_progress") || "[]"); } catch { return []; }
  }, []);

  const hasPlan = plan?.weeks?.length > 0;
  if (!hasPlan || logs.length === 0) return <EmptyProgress hasPlan={hasPlan} />;

  const totalDays = (plan.weeks || []).flatMap((w: any) => w.days || []).filter((d: any) => !d.isRestDay).length;
  const completed = logs.length;
  const pct = Math.min(100, Math.round((completed / totalDays) * 100));

  // Streak
  const sorted = logs.map((l) => new Date(l.date).toDateString()).filter((v, i, a) => a.indexOf(v) === i).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  let streak = 0;
  const todayStr = new Date().toDateString();
  const yestStr = new Date(Date.now() - 86400000).toDateString();
  if (sorted[0] === todayStr || sorted[0] === yestStr) {
    streak = 1;
    for (let i = 1; i < sorted.length; i++) {
      const diff = (new Date(sorted[i - 1]).getTime() - new Date(sorted[i]).getTime()) / 86400000;
      if (diff === 1) streak++; else break;
    }
  }

  return (
    <div className="space-y-4">
      {/* Ring + stats */}
      <div className="glass rounded-2xl p-6 border border-white/8">
        <div className="flex items-center gap-6">
          <Ring pct={pct} />
          <div className="flex-1 space-y-4">
            <div>
              <p className="text-[#9CA3AF] text-xs font-mono uppercase tracking-wider mb-1">Streak</p>
              <div className="flex items-center gap-1.5">
                <Flame className="w-5 h-5 text-orange-400" />
                <span className="font-heading font-bold text-2xl text-white">{streak}</span>
                <span className="text-[#9CA3AF] text-sm">day{streak !== 1 ? "s" : ""}</span>
              </div>
            </div>
            <div>
              <p className="text-[#9CA3AF] text-xs font-mono uppercase tracking-wider mb-1">Completed</p>
              <p className="font-heading font-bold text-2xl text-white">
                {completed} <span className="text-[#9CA3AF] text-base font-normal">/ {totalDays}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <WeeklyChart logs={logs} />

      {/* Recent sessions */}
      <div className="glass rounded-2xl p-5 border border-white/8">
        <p className="text-[#9CA3AF] text-xs font-mono uppercase tracking-wider mb-4">Recent Sessions</p>
        <div className="space-y-1">
          {logs.slice(0, 5).map((log, i) => (
            <div key={i} className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{log.focus || "Training Session"}</p>
                <p className="text-[#9CA3AF] text-xs">{new Date(log.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
              </div>
              <div className="flex items-center gap-1 text-[#9CA3AF] text-xs font-mono shrink-0">
                <Dumbbell className="w-3 h-3" />{log.exercises?.length || 0}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
