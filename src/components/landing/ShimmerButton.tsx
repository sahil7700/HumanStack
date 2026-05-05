"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { ArrowRight } from "lucide-react";

/* ─── Shimmer Button ─────────────────────────────────── */
interface ShimmerButtonProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "ghost";
}

export function ShimmerButton({ href, children, className = "", variant = "primary" }: ShimmerButtonProps) {
  if (variant === "ghost") {
    return (
      <Link
        href={href}
        className={`relative flex items-center justify-center gap-2.5 overflow-hidden bg-white/4 border border-white/10 hover:bg-white/7 text-white font-medium px-8 py-4 rounded-xl transition-all duration-300 text-base group ${className}`}
      >
        {children}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={`relative flex items-center justify-center gap-2.5 overflow-hidden bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 text-base group hover:shadow-[0_0_40px_rgba(59,130,246,0.5)] hover:scale-[1.02] active:scale-[0.98] ${className}`}
    >
      {/* Shimmer sweep — runs every 3s */}
      <motion.span
        className="absolute inset-0 -translate-x-full skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
        animate={{ x: ["−100%", "200%"] }}
        transition={{
          duration: 0.8,
          ease: "easeInOut",
          repeat: Infinity,
          repeatDelay: 2.5,
        }}
      />
      <span className="relative z-10 flex items-center gap-2.5">{children}</span>
    </Link>
  );
}

/* ─── Nav CTA (small) ────────────────────────────────── */
export function NavShimmerButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="relative overflow-hidden flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:scale-[1.02] active:scale-[0.98]"
    >
      <motion.span
        className="absolute inset-0 -translate-x-full skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
        animate={{ x: ["−100%", "200%"] }}
        transition={{ duration: 0.7, ease: "easeInOut", repeat: Infinity, repeatDelay: 2.8 }}
      />
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </Link>
  );
}
