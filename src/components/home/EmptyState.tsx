"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight, Zap } from "lucide-react";

export function EmptyState() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6 relative">
      {/* Faint radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/6 rounded-full blur-[100px] pointer-events-none" />

      {/* Animated icon */}
      <div className="relative mb-8">
        {[0, 1].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-2xl border border-blue-500/15"
            style={{ margin: `-${(i + 1) * 12}px` }}
            animate={{ scale: [1, 1.05, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ repeat: Infinity, duration: 3, delay: i * 0.5, ease: "easeInOut" }}
          />
        ))}
        <motion.div
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600/20 to-purple-600/15 border border-blue-500/25 flex items-center justify-center"
        >
          <Zap className="w-9 h-9 text-blue-400" />
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <p className="text-blue-400 text-xs font-mono uppercase tracking-widest mb-3">No Active Protocol</p>
        <h2 className="font-heading font-bold text-3xl text-white mb-3">
          You don&apos;t have a routine yet.
        </h2>
        <p className="text-[#9CA3AF] text-base mb-8 max-w-sm leading-relaxed">
          Build your personalized AI-generated month plan in under 3 minutes.
        </p>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push("/create-routine")}
          className="flex items-center gap-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-4 rounded-xl transition-all hover:shadow-[0_0_32px_rgba(59,130,246,0.4)] mx-auto text-base"
        >
          Create Your Plan <ArrowRight className="w-5 h-5" />
        </motion.button>

        <p className="text-[#4B5563] text-xs mt-6">AI-powered · Personalized · Takes 3 min</p>
      </motion.div>
    </div>
  );
}
