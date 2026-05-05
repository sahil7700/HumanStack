"use client";

import { useRef, useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { staggerContainer, wordReveal } from "@/lib/motion";
import { ShimmerButton } from "@/components/landing/ShimmerButton";
import { AnimatedDashboard } from "@/components/landing/AnimatedDashboard";

/* ── Word-split headline ─────────────────────────────── */
function AnimatedHeadline() {
  const line1 = ["Train", "Smarter."];
  const line2 = ["Not", "Harder."];

  return (
    <h1 className="font-heading text-6xl lg:text-7xl font-bold leading-[1.08] tracking-tight mb-6">
      {/* Line 1 */}
      <span className="flex gap-4 overflow-hidden">
        {line1.map((word, i) => (
          <motion.span
            key={word}
            custom={i}
            variants={wordReveal}
            className={i === 1 ? "gradient-text" : ""}
            style={{ display: "inline-block" }}
          >
            {word}
          </motion.span>
        ))}
      </span>
      {/* Line 2 */}
      <span className="flex gap-4 overflow-hidden mt-1">
        {line2.map((word, i) => (
          <motion.span
            key={word}
            custom={i + 2}
            variants={wordReveal}
            style={{ display: "inline-block" }}
          >
            {word}
          </motion.span>
        ))}
      </span>
    </h1>
  );
}

/* ── Mouse-tracking radial glow background ──────────── */
function MouseGlow() {
  const glowX = useMotionValue(-9999);
  const glowY = useMotionValue(-9999);
  const springX = useSpring(glowX, { stiffness: 60, damping: 20 });
  const springY = useSpring(glowY, { stiffness: 60, damping: 20 });

  useEffect(() => {
    function onMove(e: MouseEvent) {
      glowX.set(e.clientX);
      glowY.set(e.clientY);
    }
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [glowX, glowY]);

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        background: "transparent",
      }}
    >
      <motion.div
        className="absolute w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{
          x: springX,
          y: springY,
          translateX: "-50%",
          translateY: "-50%",
          background:
            "radial-gradient(circle, rgba(59,130,246,0.10) 0%, rgba(59,130,246,0.04) 40%, transparent 70%)",
        }}
      />
    </motion.div>
  );
}

/* ── Badge pill ──────────────────────────────────────── */
function BadgePill() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="inline-flex items-center gap-2 glass px-3.5 py-1.5 rounded-full text-xs text-blue-400 font-medium mb-8 border border-blue-500/15"
    >
      {/* Animated dot */}
      <motion.span
        className="w-1.5 h-1.5 rounded-full bg-blue-400"
        animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      />
      <Sparkles className="w-3.5 h-3.5" />
      AI-Powered Fitness Intelligence
    </motion.div>
  );
}

/* ── Trust badges row ────────────────────────────────── */
function TrustBadges() {
  const items = [
    { dot: "bg-blue-500", label: "Personalized AI" },
    { dot: "bg-emerald-500", label: "Science-backed" },
    { dot: "bg-purple-500", label: "Adaptive Plans" },
  ];
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.9, duration: 0.6 }}
      className="flex flex-wrap items-center gap-5 text-sm text-[#9CA3AF]"
    >
      {items.map(({ dot, label }) => (
        <div key={label} className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${dot}`} />
          {label}
        </div>
      ))}
    </motion.div>
  );
}

/* ── Hero section ────────────────────────────────────── */
interface HeroSectionProps {
  isSignedIn: boolean;
}

export function HeroSection({ isSignedIn }: HeroSectionProps) {
  return (
    <>
      {/* Mouse glow — fixed, sits behind everything */}
      <MouseGlow />

      <main className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-20 pb-28">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* ── Left column ── */}
          <motion.div
            variants={staggerContainer(0.08, 0.1)}
            initial="hidden"
            animate="visible"
          >
            <BadgePill />
            <AnimatedHeadline />

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-[#9CA3AF] text-xl leading-relaxed mb-10 max-w-lg"
            >
              An AI system that analyzes your biology, goals, and constraints to build
              clinical-grade fitness protocols —{" "}
              <span className="text-white/70">personalized for you, updated with you.</span>
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col sm:flex-row gap-4 mb-12"
            >
              <ShimmerButton
                href={isSignedIn ? "/dashboard" : "/sign-up"}
                variant="primary"
              >
                Start Your Plan <ArrowRight className="w-5 h-5" />
              </ShimmerButton>
              <ShimmerButton href="/sign-in" variant="ghost">
                Sign In
              </ShimmerButton>
            </motion.div>

            <TrustBadges />
          </motion.div>

          {/* ── Right column — 3-D animated dashboard ── */}
          <AnimatedDashboard />
        </div>
      </main>
    </>
  );
}
