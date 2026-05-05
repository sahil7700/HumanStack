"use client";

import { useRef } from "react";
import { motion, useInView, useMotionValue, useSpring, useTransform } from "framer-motion";
import { dashboardEntrance, calendarCell, staggerContainer } from "@/lib/motion";

/* ── Animated progress bar ──────────────────────────── */
function ProgressBar({ pct }: { pct: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <div ref={ref} className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-1.5">
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
        initial={{ width: 0 }}
        animate={inView ? { width: `${pct}%` } : { width: 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
      />
    </div>
  );
}

/* ── Calendar grid with staggered entrance ──────────── */
function CalendarGrid() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      className="glass rounded-xl p-3 border border-white/5"
      variants={staggerContainer(0.018, 0.2)}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
    >
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 28 }, (_, i) => {
          const isRest = i % 7 === 6 || i % 7 === 0;
          const isDone = i < 14;
          const isToday = i === 13;
          return (
            <motion.div
              key={i}
              custom={i}
              variants={calendarCell}
              className={`aspect-square rounded-md flex items-center justify-center text-[8px] font-mono transition-all
                ${isToday
                  ? "bg-blue-500 text-white shadow-[0_0_12px_rgba(59,130,246,0.6)]"
                  : isDone
                  ? "bg-blue-500/25 text-blue-400"
                  : isRest
                  ? "bg-white/3 text-white/15"
                  : "bg-white/5 text-white/25"}`}
            >
              {i + 1}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ── 3-D tilt wrapper on mouse move ─────────────────── */
function TiltCard({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  const rotateX = useSpring(useTransform(rawY, [-0.5, 0.5], [6, -6]), { stiffness: 260, damping: 30 });
  const rotateY = useSpring(useTransform(rawX, [-0.5, 0.5], [-6, 6]), { stiffness: 260, damping: 30 });

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    rawX.set((e.clientX - rect.left) / rect.width - 0.5);
    rawY.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handleLeave() {
    rawX.set(0);
    rawY.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      className="will-change-transform"
    >
      {children}
    </motion.div>
  );
}

/* ── Main component ──────────────────────────────────── */
export function AnimatedDashboard() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const inView = useInView(wrapRef, { once: true, margin: "-80px" });

  return (
    <div ref={wrapRef} className="relative hidden lg:block">
      {/* Glow halo */}
      <motion.div
        className="absolute -inset-6 bg-blue-600/10 rounded-3xl blur-2xl pointer-events-none"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 1.2 }}
      />
      {/* Purple accent glow */}
      <motion.div
        className="absolute -bottom-8 right-0 w-48 h-48 bg-purple-600/15 rounded-full blur-3xl pointer-events-none"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 1.2, delay: 0.2 }}
      />

      <motion.div
        variants={dashboardEntrance}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        style={{ transformPerspective: 1000 }}
      >
        <TiltCard>
          <div className="glass rounded-2xl p-6 border border-white/10 shadow-2xl">

            {/* Window chrome */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
              </div>
              <div className="text-[10px] text-[#9CA3AF] font-mono tracking-wider">
                HumanStack AI — Protocol v3.1
              </div>
              <motion.div
                className="w-2 h-2 rounded-full bg-blue-500"
                animate={{ opacity: [1, 0.2, 1], scale: [1, 0.8, 1] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              />
            </div>

            {/* Today card with pulse badge */}
            <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/10 rounded-xl p-4 mb-3 border border-blue-500/20 relative overflow-hidden">
              {/* shimmer sweep on the card itself */}
              <motion.div
                className="absolute inset-0 -translate-x-full skew-x-[-16deg] bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none"
                animate={{ x: ["−100%", "250%"] }}
                transition={{ duration: 1.2, ease: "easeInOut", repeat: Infinity, repeatDelay: 3 }}
              />
              <div className="flex items-center justify-between mb-2">
                <div>
                  {/* Pulse dot next to label */}
                  <div className="flex items-center gap-1.5 mb-1">
                    <motion.div
                      className="w-1.5 h-1.5 rounded-full bg-blue-400"
                      animate={{ scale: [1, 1.6, 1], opacity: [1, 0.4, 1] }}
                      transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                    />
                    <p className="text-[10px] text-blue-400 font-mono uppercase tracking-widest">
                      Today — Day 14
                    </p>
                  </div>
                  <p className="font-heading font-bold text-white text-lg">
                    Hypertrophy — Upper Body
                  </p>
                </div>
                <div className="bg-blue-500/20 rounded-lg px-2.5 py-1.5 text-blue-400 text-xs font-mono shrink-0">
                  60 min
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {["Bench Press", "Pull-ups", "OHP"].map((ex) => (
                  <span
                    key={ex}
                    className="text-[10px] bg-white/6 text-[#9CA3AF] px-2 py-1 rounded-lg border border-white/6"
                  >
                    {ex}
                  </span>
                ))}
                <span className="text-[10px] text-[#9CA3AF] self-center">+3</span>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                { label: "Streak", value: "12d", color: "text-orange-400" },
                { label: "Completed", value: "14/30", color: "text-blue-400" },
                { label: "Progress", value: "47%", color: "text-purple-400" },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  className="glass rounded-xl p-3 text-center border border-white/5"
                  initial={{ opacity: 0, y: 10 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.4 + i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <p className={`font-heading font-bold text-base ${s.color}`}>{s.value}</p>
                  <p className="text-[9px] text-[#9CA3AF] font-mono uppercase mt-0.5">{s.label}</p>
                  {s.label === "Progress" && <ProgressBar pct={47} />}
                </motion.div>
              ))}
            </div>

            {/* Staggered calendar */}
            <CalendarGrid />
          </div>
        </TiltCard>
      </motion.div>
    </div>
  );
}
