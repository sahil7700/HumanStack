"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Brain, BarChart3, Shield, Zap, Activity, Lock } from "lucide-react";
import { staggerContainer, fadeUp } from "@/lib/motion";

/* ── Border-beam effect ───────────────────────────────
   A thin glowing border that traces the card perimeter on hover.
   Implemented as an animated conic-gradient mask overlay —
   zero layout shifts, GPU-composited. */
function BorderBeam() {
  return (
    <motion.span
      className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      style={{
        background:
          "conic-gradient(from var(--beam-angle, 0deg), transparent 60%, #3b82f6 80%, #8b5cf6 90%, transparent 100%)",
        WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
        WebkitMaskComposite: "xor",
        maskComposite: "exclude",
        padding: "1px",
      }}
      animate={{ "--beam-angle": ["0deg", "360deg"] } as any}
      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
    />
  );
}

/* ── Neural pulse icon animation ──────────────────────── */
function NeuralIcon() {
  return (
    <div className="relative w-10 h-10">
      {/* Ripple rings */}
      {[0, 1].map((i) => (
        <motion.span
          key={i}
          className="absolute inset-0 rounded-xl border border-blue-500/30"
          animate={{ scale: [1, 1.5, 1.8], opacity: [0.6, 0.2, 0] }}
          transition={{ repeat: Infinity, duration: 2.2, delay: i * 0.7, ease: "easeOut" }}
        />
      ))}
      <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center relative z-10">
        <Brain className="w-5 h-5 text-blue-400" />
      </div>
    </div>
  );
}

/* ── Bar-chart pulse icon ─────────────────────────────── */
function ChartIcon() {
  return (
    <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/20 flex items-center justify-center">
      <motion.div
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut", delay: 0.3 }}
      >
        <BarChart3 className="w-5 h-5 text-purple-400" />
      </motion.div>
    </div>
  );
}

/* ── Shield scan icon ─────────────────────────────────── */
function ShieldIcon() {
  return (
    <div className="relative w-10 h-10 overflow-hidden rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
      {/* scan line */}
      <motion.div
        className="absolute left-0 right-0 h-px bg-emerald-400/60"
        animate={{ top: ["0%", "100%", "0%"] }}
        transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
      />
      <Shield className="w-5 h-5 text-emerald-400 relative z-10" />
    </div>
  );
}

/* ── Zap icon ────────────────────────────────────────── */
function ZapIcon() {
  return (
    <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center">
      <motion.div
        animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 0.5 }}
      >
        <Zap className="w-5 h-5 text-blue-400" />
      </motion.div>
    </div>
  );
}

/* ── Activity icon ───────────────────────────────────── */
function ActivityIcon() {
  return (
    <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/20 flex items-center justify-center">
      <motion.div
        animate={{ scaleX: [1, 1.12, 1] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      >
        <Activity className="w-5 h-5 text-purple-400" />
      </motion.div>
    </div>
  );
}

/* ── Lock icon ───────────────────────────────────────── */
function LockIcon() {
  return (
    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
      <Lock className="w-5 h-5 text-emerald-400" />
    </div>
  );
}

/* ── Individual bento card ───────────────────────────── */
interface CardProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
  badge?: string;
  badgeColor?: string;
  className?: string;
  children?: React.ReactNode;
}

function BentoCard({ icon, title, desc, badge, badgeColor = "blue", className = "", children }: CardProps) {
  const colors: Record<string, string> = {
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  };

  return (
    <motion.div
      variants={fadeUp}
      className={`relative group glass rounded-2xl p-6 border border-white/8 hover:border-white/15 transition-colors duration-300 overflow-hidden ${className}`}
    >
      <BorderBeam />

      {/* Subtle inner glow on hover */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-blue-600/5 via-transparent to-purple-600/5 pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          {icon}
          {badge && (
            <span className={`text-[10px] font-mono px-2.5 py-1 rounded-full border ${colors[badgeColor]}`}>
              {badge}
            </span>
          )}
        </div>
        <h3 className="font-heading font-semibold text-white text-lg mb-2 leading-tight">{title}</h3>
        <p className="text-[#9CA3AF] text-sm leading-relaxed">{desc}</p>
        {children}
      </div>
    </motion.div>
  );
}

/* ── Floating code snippet (parallax decoration) ───── */
function CodeSnippet({ lines, className = "" }: { lines: string[]; className?: string }) {
  return (
    <div className={`font-mono text-[10px] leading-relaxed bg-white/3 border border-white/6 rounded-xl p-3 select-none ${className}`}>
      {lines.map((line, i) => (
        <div key={i} className="flex gap-2">
          <span className="text-white/15 w-4 text-right shrink-0">{i + 1}</span>
          <span
            className={
              line.startsWith("//")
                ? "text-white/20"
                : line.includes(":")
                ? "text-blue-400/60"
                : line.includes("=>") || line.includes("async")
                ? "text-purple-400/60"
                : "text-white/40"
            }
          >
            {line}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ── Main export ─────────────────────────────────────── */
export function BentoGrid() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 pb-32">
      {/* Floating parallax code snippets */}
      <motion.div
        className="absolute -left-8 top-16 hidden xl:block opacity-40"
        animate={{ y: [0, -12, 0] }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
      >
        <CodeSnippet
          lines={[
            "// Generate protocol",
            "async (profile) => {",
            "  const plan = await AI",
            "    .analyze(profile)",
            "  return plan.optimize()",
            "}",
          ]}
        />
      </motion.div>

      <motion.div
        className="absolute -right-6 bottom-24 hidden xl:block opacity-30"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 1 }}
      >
        <CodeSnippet
          lines={[
            "// Adapt to feedback",
            "protocol: {",
            "  week: 3,",
            "  intensity: 0.82,",
            "  recovery: auto",
            "}",
          ]}
        />
      </motion.div>

      {/* Section header */}
      <motion.div
        ref={ref}
        className="text-center mb-14"
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="inline-flex items-center gap-2 glass px-3.5 py-1.5 rounded-full text-xs text-emerald-400 font-medium mb-4 border border-emerald-500/15">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Science-backed system
        </div>
        <h2 className="font-heading text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
          Built for precision
        </h2>
        <p className="text-[#9CA3AF] max-w-lg mx-auto text-lg">
          Every component of HumanStack is designed to reduce noise and increase signal.
        </p>
      </motion.div>

      {/* Bento grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        variants={staggerContainer(0.1)}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
      >
        {/* Large card — spans 2 cols on lg */}
        <BentoCard
          icon={<NeuralIcon />}
          title="Adaptive AI Engine"
          desc="Learns your response patterns and adjusts intensity, volume, and recovery in real time — no manual input required."
          badge="Core AI"
          className="lg:col-span-2"
        >
          {/* Mini signal graph */}
          <div className="mt-5 h-14 flex items-end gap-1 overflow-hidden">
            {[40, 55, 48, 70, 62, 80, 74, 88, 82, 95, 90, 100].map((h, i) => (
              <motion.div
                key={i}
                className="flex-1 rounded-t-sm bg-gradient-to-t from-blue-600/40 to-blue-400/60"
                initial={{ height: 0 }}
                animate={inView ? { height: `${h}%` } : { height: 0 }}
                transition={{ delay: 0.6 + i * 0.05, duration: 0.5, ease: "easeOut" }}
              />
            ))}
          </div>
        </BentoCard>

        {/* Injury prevention */}
        <BentoCard
          icon={<ShieldIcon />}
          title="Injury Prevention"
          desc="Constraint-aware programming that routes around your limitations without compromising results."
          badge="Safety"
          badgeColor="green"
        />

        {/* Progress intelligence */}
        <BentoCard
          icon={<ChartIcon />}
          title="Progress Intelligence"
          desc="Visual analytics that surface what's working and what needs adjustment before you plateau."
          badge="Analytics"
          badgeColor="purple"
        />

        {/* Adaptive loading */}
        <BentoCard
          icon={<ZapIcon />}
          title="Progressive Overload"
          desc="Auto-regulated load progression keeps you in the optimal stimulus zone every single session."
          badge="Load Management"
        />

        {/* Recovery tracking — spans 2 cols on lg */}
        <BentoCard
          icon={<ActivityIcon />}
          title="Recovery Optimization"
          desc="HRV, sleep, and subjective fatigue signals are folded into the protocol to prevent overreaching."
          className="lg:col-span-2"
        >
          {/* Recovery bar mini-chart */}
          <div className="mt-5 grid grid-cols-7 gap-1.5">
            {[80, 65, 90, 72, 95, 60, 85].map((pct, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="w-full h-10 bg-white/5 rounded-md overflow-hidden flex items-end">
                  <motion.div
                    className="w-full rounded-md"
                    style={{
                      background: pct > 80
                        ? "linear-gradient(to top, #22c55e60, #22c55e)"
                        : pct > 65
                        ? "linear-gradient(to top, #3b82f660, #3b82f6)"
                        : "linear-gradient(to top, #f97316/60, #f97316)",
                    }}
                    initial={{ height: 0 }}
                    animate={inView ? { height: `${pct}%` } : { height: 0 }}
                    transition={{ delay: 0.7 + i * 0.06, duration: 0.5, ease: "easeOut" }}
                  />
                </div>
                <span className="text-[9px] text-white/25 font-mono">
                  {["M", "T", "W", "T", "F", "S", "S"][i]}
                </span>
              </div>
            ))}
          </div>
        </BentoCard>
      </motion.div>
    </section>
  );
}
