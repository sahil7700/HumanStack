"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { ChevronRight, Sparkles } from "lucide-react";
import { ShimmerButton } from "@/components/landing/ShimmerButton";
import { staggerContainer, fadeUp } from "@/lib/motion";

/* ── How-it-works section ────────────────────────────── */
function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const steps = [
    {
      num: "01",
      title: "Tell the system about you",
      desc: "Answer 7 quick questions about your goals, biology, schedule, and any constraints. Takes 3 minutes.",
      color: "text-blue-400",
      border: "border-blue-500/20",
      bg: "bg-blue-500/8",
    },
    {
      num: "02",
      title: "AI builds your protocol",
      desc: "The engine synthesizes a 30-day, day-by-day workout plan calibrated exactly to your profile.",
      color: "text-purple-400",
      border: "border-purple-500/20",
      bg: "bg-purple-500/8",
    },
    {
      num: "03",
      title: "Execute & adapt",
      desc: "Log sessions, track progress, and watch the plan auto-adjust as your performance data accumulates.",
      color: "text-emerald-400",
      border: "border-emerald-500/20",
      bg: "bg-emerald-500/8",
    },
  ];

  return (
    <section id="how" className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pb-32">
      <motion.div
        ref={ref}
        className="text-center mb-14"
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="text-blue-400 text-xs font-mono uppercase tracking-[0.2em] mb-3">
          Protocol
        </p>
        <h2 className="font-heading text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
          How it works
        </h2>
        <p className="text-[#9CA3AF] max-w-md mx-auto">
          From zero to a precision training plan in under 5 minutes.
        </p>
      </motion.div>

      <motion.div
        className="grid md:grid-cols-3 gap-5"
        variants={staggerContainer(0.13)}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
      >
        {steps.map((s) => (
          <motion.div
            key={s.num}
            variants={fadeUp}
            className={`relative group rounded-2xl p-6 border ${s.border} ${s.bg} backdrop-blur-sm hover:scale-[1.01] transition-transform duration-300`}
          >
            {/* Connector line (hidden on mobile) */}
            <div className="hidden md:block absolute top-10 right-0 translate-x-1/2 z-10">
              {s.num !== "03" && (
                <ChevronRight className="w-4 h-4 text-white/15" />
              )}
            </div>

            <span className={`font-mono text-xs ${s.color} mb-4 block tracking-widest`}>
              {s.num}
            </span>
            <h3 className="font-heading font-semibold text-white text-lg mb-2 leading-snug">
              {s.title}
            </h3>
            <p className="text-[#9CA3AF] text-sm leading-relaxed">{s.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

/* ── Social proof ticker ─────────────────────────────── */
function ProofTicker() {
  const stats = [
    { value: "30-day", label: "AI-generated plans" },
    { value: "7 min", label: "avg onboarding time" },
    { value: "100%", label: "personalized" },
    { value: "Zero", label: "generic workouts" },
  ];

  return (
    <div className="relative z-10 border-y border-white/5 py-8 mb-24 overflow-hidden">
      {/* Fade masks */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#050505] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#050505] to-transparent z-10 pointer-events-none" />

      <motion.div
        className="flex gap-16 w-max"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      >
        {[...stats, ...stats].map((s, i) => (
          <div key={i} className="flex items-center gap-4 shrink-0">
            <div>
              <p className="font-heading font-bold text-2xl text-white">{s.value}</p>
              <p className="text-[#9CA3AF] text-xs font-mono">{s.label}</p>
            </div>
            <div className="w-px h-8 bg-white/8 mx-2" />
          </div>
        ))}
      </motion.div>
    </div>
  );
}

/* ── Final CTA section ───────────────────────────────── */
function FinalCta({ isSignedIn }: { isSignedIn: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section id="science" className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pb-32">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative rounded-3xl overflow-hidden border border-blue-500/20"
      >
        {/* Layered background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-[#0a0a14] to-purple-600/10" />
        <div className="absolute inset-0 grid-pattern opacity-40" />

        {/* Animated corner glow */}
        <motion.div
          className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-600/15 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.9, 0.5] }}
          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
        />

        <div className="relative z-10 text-center px-8 py-20">
          <div className="inline-flex items-center gap-2 glass px-3.5 py-1.5 rounded-full text-xs text-emerald-400 font-medium mb-6 border border-emerald-500/15">
            <Sparkles className="w-3.5 h-3.5" />
            Science-backed · Clinical-grade
          </div>

          <h2 className="font-heading text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
            Ready to train like a system?
          </h2>
          <p className="text-[#9CA3AF] mb-10 max-w-md mx-auto text-lg leading-relaxed">
            Join athletes training with precision intelligence —
            no guesswork, no plateaus.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <ShimmerButton href={isSignedIn ? "/dashboard" : "/sign-up"} variant="primary">
              Start Your Plan <ChevronRight className="w-5 h-5" />
            </ShimmerButton>
            {!isSignedIn && (
              <ShimmerButton href="/sign-in" variant="ghost">
                Already have an account
              </ShimmerButton>
            )}
          </div>

          {/* Trust row */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-xs text-[#9CA3AF] font-mono">
            {["No credit card required", "Free to start", "Cancel anytime"].map((t) => (
              <div key={t} className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-emerald-500" />
                {t}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}

/* ── Footer ──────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-8 border-t border-white/5">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">H</span>
          </div>
          <span className="font-heading font-semibold text-sm text-white">HumanStack</span>
        </div>
        <p className="text-[#9CA3AF] text-xs font-mono">
          © {new Date().getFullYear()} HumanStack Systems. All rights reserved.
        </p>
        <div className="flex items-center gap-4 text-xs text-[#9CA3AF]">
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
        </div>
      </div>
    </footer>
  );
}

/* ── Named export for page assembly ─────────────────── */
export function CtaSection({ isSignedIn }: { isSignedIn: boolean }) {
  return (
    <>
      <ProofTicker />
      <HowItWorks />
      <FinalCta isSignedIn={isSignedIn} />
      <Footer />
    </>
  );
}
