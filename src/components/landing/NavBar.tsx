"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { Zap, Menu, X } from "lucide-react";
import { NavShimmerButton } from "@/components/landing/ShimmerButton";

interface NavBarProps {
  isSignedIn: boolean;
}

export function NavBar({ isSignedIn }: NavBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { scrollY } = useScroll();

  useEffect(() => {
    return scrollY.on("change", (y) => setScrolled(y > 12));
  }, [scrollY]);

  const links = [
    { href: "#features", label: "Features" },
    { href: "#how", label: "How it works" },
    { href: "#science", label: "Science" },
  ];

  return (
    <motion.nav
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 shadow-xl shadow-black/20"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-[0_0_16px_rgba(59,130,246,0.4)] group-hover:shadow-[0_0_24px_rgba(59,130,246,0.6)] transition-shadow">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-heading font-bold text-lg tracking-tight text-white">
            HumanStack
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8 text-sm text-[#9CA3AF]">
          {links.map(({ href, label }, i) => (
            <motion.a
              key={label}
              href={href}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07, duration: 0.4 }}
              className="hover:text-white transition-colors duration-200 relative group"
            >
              {label}
              {/* underline reveal */}
              <span className="absolute -bottom-0.5 left-0 w-0 group-hover:w-full h-px bg-blue-500/60 transition-all duration-300" />
            </motion.a>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          {isSignedIn ? (
            <NavShimmerButton href="/dashboard">
              Dashboard <span className="opacity-60">→</span>
            </NavShimmerButton>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="text-sm text-[#9CA3AF] hover:text-white transition-colors px-4 py-2"
              >
                Sign In
              </Link>
              <NavShimmerButton href="/sign-up">
                Get Started →
              </NavShimmerButton>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden w-9 h-9 rounded-xl glass border border-white/8 flex items-center justify-center text-[#9CA3AF] hover:text-white transition-colors"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden border-t border-white/5 bg-[#050505]/95 backdrop-blur-xl px-6 py-5 space-y-4"
        >
          {links.map(({ href, label }) => (
            <a
              key={label}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="block text-[#9CA3AF] hover:text-white text-sm transition-colors py-1"
            >
              {label}
            </a>
          ))}
          <div className="pt-3 border-t border-white/5 flex flex-col gap-3">
            {isSignedIn ? (
              <NavShimmerButton href="/dashboard">Dashboard →</NavShimmerButton>
            ) : (
              <>
                <Link href="/sign-in" className="text-center text-sm text-[#9CA3AF] py-2">Sign In</Link>
                <NavShimmerButton href="/sign-up">Get Started →</NavShimmerButton>
              </>
            )}
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
