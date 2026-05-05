"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Zap, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

export default function SignInPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", age: "", weight: "" });
  const [loading, setLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await res.json();
      if (result.success) {
        localStorage.setItem("humanstack_user_id", result.userId);
        localStorage.setItem("humanstack_user", JSON.stringify(form));
        if (result.plan) {
          localStorage.setItem("humanstack_plan", JSON.stringify(result.plan));
        } else {
          localStorage.removeItem("humanstack_plan");
        }
        router.push("/dashboard");
      } else {
        alert(result.error || "Sign in failed.");
        setLoading(false);
      }
    } catch {
      alert("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="grid-pattern absolute inset-0" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/6 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-heading font-bold text-white text-lg">HumanStack</span>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-8 border border-white/8">
          <div className="mb-6">
            <h1 className="font-heading font-bold text-2xl text-white mb-1.5">Welcome back</h1>
            <p className="text-[#9CA3AF] text-sm">Access your personal training intelligence.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-[#9CA3AF] font-medium mb-2 uppercase tracking-wider">
                Name
              </label>
              <input
                required
                type="text"
                placeholder="Your name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-white/5 border border-white/8 rounded-xl px-4 py-3 text-white text-sm placeholder-[#4B5563] focus:outline-none focus:border-blue-500/60 focus:bg-blue-500/5 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-[#9CA3AF] font-medium mb-2 uppercase tracking-wider">
                  Age
                </label>
                <input
                  required
                  type="number"
                  placeholder="25"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  className="w-full bg-white/5 border border-white/8 rounded-xl px-4 py-3 text-white text-sm placeholder-[#4B5563] focus:outline-none focus:border-blue-500/60 focus:bg-blue-500/5 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs text-[#9CA3AF] font-medium mb-2 uppercase tracking-wider">
                  Weight (kg)
                </label>
                <input
                  required
                  type="number"
                  placeholder="75"
                  value={form.weight}
                  onChange={(e) => setForm({ ...form, weight: e.target.value })}
                  className="w-full bg-white/5 border border-white/8 rounded-xl px-4 py-3 text-white text-sm placeholder-[#4B5563] focus:outline-none focus:border-blue-500/60 focus:bg-blue-500/5 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all hover:shadow-[0_0_24px_rgba(59,130,246,0.4)] mt-2 text-sm"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Accessing System...
                </>
              ) : (
                <>
                  Enter Dashboard <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/6 text-center">
            <p className="text-[#9CA3AF] text-sm">
              New here?{" "}
              <Link href="/sign-up" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
                Create an account
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-[#4B5563] text-xs mt-6">
          Secure · Private · No tracking outside your fitness data
        </p>
      </motion.div>
    </div>
  );
}
