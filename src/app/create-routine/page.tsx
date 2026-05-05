"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, Zap, Dumbbell } from "lucide-react";
import { useRouter } from "next/navigation";

/* ─── Questions ─────────────────────────────────────── */
const QUESTIONS = [
  {
    id: "goal",
    question: "What's your primary goal?",
    subtitle: "We'll engineer your entire plan around this.",
    type: "single" as const,
    options: [
      { label: "Build Muscle", emoji: "💪", value: "build_muscle", desc: "Hypertrophy-focused protocols" },
      { label: "Lose Fat", emoji: "🔥", value: "lose_fat", desc: "Metabolic conditioning + deficit" },
      { label: "Improve Endurance", emoji: "🏃", value: "endurance", desc: "Cardiovascular + VO2 max" },
      { label: "General Fitness", emoji: "⚡", value: "general", desc: "Balanced strength + health" },
    ],
  },
  {
    id: "experience",
    question: "What's your training level?",
    subtitle: "This calibrates your starting intensity and complexity.",
    type: "single" as const,
    options: [
      { label: "Beginner", emoji: "🌱", value: "beginner", desc: "< 6 months consistent training" },
      { label: "Intermediate", emoji: "📈", value: "intermediate", desc: "6 months – 2 years" },
      { label: "Advanced", emoji: "⚡", value: "advanced", desc: "2+ years, structured training" },
    ],
  },
  {
    id: "daysPerWeek",
    question: "How many days per week?",
    subtitle: "Consistency > intensity. Pick what you can sustain.",
    type: "single" as const,
    options: [
      { label: "3 days", emoji: "3️⃣", value: "3", desc: "Full body · optimal for recovery" },
      { label: "4 days", emoji: "4️⃣", value: "4", desc: "Upper/lower split" },
      { label: "5 days", emoji: "5️⃣", value: "5", desc: "Push/pull/legs" },
      { label: "6 days", emoji: "6️⃣", value: "6", desc: "High frequency · advanced" },
    ],
  },
  {
    id: "duration",
    question: "Session length?",
    subtitle: "We'll pack the right volume within your window.",
    type: "single" as const,
    options: [
      { label: "30 minutes", emoji: "⚡", value: "30", desc: "Efficient, high-intensity" },
      { label: "45 minutes", emoji: "🕐", value: "45", desc: "Balanced volume" },
      { label: "60 minutes", emoji: "🕑", value: "60", desc: "Full protocol" },
      { label: "90 minutes", emoji: "🏋️", value: "90", desc: "High-volume sessions" },
    ],
  },
  {
    id: "equipment",
    question: "Available equipment?",
    subtitle: "Your plan will be built exclusively around what you have.",
    type: "single" as const,
    options: [
      { label: "Bodyweight Only", emoji: "🤸", value: "bodyweight", desc: "Zero equipment required" },
      { label: "Dumbbells", emoji: "🏋️", value: "dumbbells", desc: "Dumbbells + bench" },
      { label: "Full Gym", emoji: "🏟️", value: "full_gym", desc: "All machines + free weights" },
      { label: "Home Gym", emoji: "🏠", value: "home_gym", desc: "Barbell + dumbbells + rack" },
    ],
  },
  {
    id: "focusAreas",
    question: "Specific focus areas?",
    subtitle: "Select all that apply. We'll weight these in your plan.",
    type: "multi" as const,
    options: [
      { label: "Upper Body", emoji: "💪", value: "upper_body", desc: "Chest, back, shoulders, arms" },
      { label: "Lower Body", emoji: "🦵", value: "lower_body", desc: "Quads, hamstrings, glutes" },
      { label: "Core", emoji: "🎯", value: "core", desc: "Stability + anti-rotation" },
      { label: "Cardio", emoji: "❤️", value: "cardio", desc: "Conditioning + endurance" },
      { label: "Full Body", emoji: "⚡", value: "full_body", desc: "Compound movement focus" },
    ],
  },
  {
    id: "stats",
    question: "Your body metrics",
    subtitle: "Used to calibrate load recommendations. Approximate is fine.",
    type: "inputs" as const,
    fields: [
      { key: "height", label: "Height", placeholder: "175", unit: "cm" },
      { key: "weight", label: "Body Weight", placeholder: "75", unit: "kg" },
      { key: "age", label: "Age", placeholder: "28", unit: "yrs" },
    ],
  },
];

/* ─── Generating Screen ─────────────────────────────── */
function GeneratingScreen({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0);

  const phases = [
    "Analyzing your biometric profile...",
    "Structuring periodization blocks...",
    "Selecting exercise protocols...",
    "Calibrating progressive overload...",
    "Assembling your 30-day system...",
  ];

  React.useEffect(() => {
    const prog = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { clearInterval(prog); setTimeout(onDone, 500); return 100; }
        return p + 1.8;
      });
    }, 65);
    const ph = setInterval(() => setPhase((p) => Math.min(p + 1, phases.length - 1)), 750);
    return () => { clearInterval(prog); clearInterval(ph); };
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="grid-pattern absolute inset-0" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/8 rounded-full blur-[120px]" />
      </div>

      {/* Animated rings */}
      <div className="relative mb-12">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border border-blue-500/20"
            style={{ margin: `-${i * 20}px` }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ repeat: Infinity, duration: 2, delay: i * 0.4, ease: "easeInOut" }}
          />
        ))}
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600/30 to-purple-600/20 border border-blue-500/30 flex items-center justify-center">
          <Zap className="w-9 h-9 text-blue-400" />
        </div>
      </div>

      <h2 className="font-heading font-bold text-3xl text-white mb-3">Building your protocol</h2>
      <motion.p key={phase} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="text-[#9CA3AF] text-base mb-10">
        {phases[phase]}
      </motion.p>

      <div className="w-full max-w-sm">
        <div className="h-1 bg-white/5 rounded-full overflow-hidden mb-3">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
            animate={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
        <div className="flex justify-between text-xs font-mono text-[#4B5563]">
          <span>AI Processing</span>
          <span>{Math.round(Math.min(progress, 100))}%</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Plan Ready Screen ─────────────────────────────── */
function PlanReadyScreen({ answers }: { answers: Record<string, any> }) {
  const router = useRouter();

  const goalLabels: Record<string, string> = {
    build_muscle: "Muscle Hypertrophy", lose_fat: "Fat Loss Protocol",
    endurance: "Endurance Development", general: "General Fitness",
  };
  const expLabels: Record<string, string> = {
    beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced",
  };
  const equipLabels: Record<string, string> = {
    bodyweight: "Bodyweight", dumbbells: "Dumbbells",
    full_gym: "Full Gym", home_gym: "Home Gym",
  };

  const summary = [
    { label: "Protocol", value: goalLabels[answers.goal] ?? answers.goal },
    { label: "Level", value: expLabels[answers.experience] ?? answers.experience },
    { label: "Schedule", value: `${answers.daysPerWeek} days/week · ${answers.duration} min` },
    { label: "Equipment", value: equipLabels[answers.equipment] ?? answers.equipment },
    ...(answers.stats?.age ? [{ label: "Profile", value: `Age ${answers.stats.age} · ${answers.stats.weight}kg · ${answers.stats.height}cm` }] : []),
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="grid-pattern absolute inset-0" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/6 rounded-full blur-[120px]" />
      </div>

      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", damping: 14 }} className="mb-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10 text-blue-400" />
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <p className="text-blue-400 text-sm font-mono uppercase tracking-widest mb-2">System Ready</p>
        <h1 className="font-heading font-bold text-3xl text-white mb-2">Your 30-Day Protocol</h1>
        <p className="text-[#9CA3AF] text-sm mb-8">Personalized AI system — generated for your exact parameters.</p>

        {/* Summary card */}
        <div className="glass rounded-2xl p-6 border border-white/8 text-left max-w-sm mx-auto mb-8 space-y-3">
          {summary.map(({ label, value }) => (
            <div key={label} className="flex items-start justify-between gap-4">
              <span className="text-[#9CA3AF] text-sm shrink-0">{label}</span>
              <span className="text-white text-sm font-medium text-right">{value}</span>
            </div>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-4 rounded-xl transition-all hover:shadow-[0_0_32px_rgba(59,130,246,0.4)] mx-auto text-base"
        >
          Enter Dashboard <ArrowRight className="w-5 h-5" />
        </motion.button>
      </motion.div>
    </div>
  );
}

/* ─── Option Card ───────────────────────────────────── */
function OptionCard({ label, emoji, desc, selected, onClick }: {
  label: string; emoji: string; desc: string; selected: boolean; onClick: () => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl border text-left transition-all duration-200 ${
        selected
          ? "bg-blue-600/15 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.15)]"
          : "bg-white/3 border-white/6 hover:border-white/12 hover:bg-white/5"
      }`}
    >
      <span className="text-2xl flex-shrink-0">{emoji}</span>
      <div className="flex-1 min-w-0">
        <p className={`font-heading font-semibold text-sm ${selected ? "text-blue-300" : "text-white"}`}>{label}</p>
        <p className="text-[#9CA3AF] text-xs mt-0.5">{desc}</p>
      </div>
      <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${selected ? "border-blue-500 bg-blue-500" : "border-white/20"}`}>
        {selected && <div className="w-2 h-2 rounded-full bg-white" />}
      </div>
    </motion.button>
  );
}

/* ─── Main Page ─────────────────────────────────────── */
export default function CreateRoutinePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [generating, setGenerating] = useState(false);
  const [done, setDone] = useState(false);

  const q = QUESTIONS[step];
  const total = QUESTIONS.length;

  function getVal(id: string) {
    return answers[id] ?? (q.type === "multi" ? [] : q.type === "inputs" ? {} : "");
  }

  function handleOption(value: string) {
    if (q.type === "multi") {
      const arr: string[] = answers[q.id] ?? [];
      setAnswers({ ...answers, [q.id]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value] });
    } else {
      setAnswers({ ...answers, [q.id]: value });
    }
  }

  function handleInput(key: string, value: string) {
    setAnswers({ ...answers, stats: { ...(answers.stats ?? {}), [key]: value } });
  }

  function canProceed() {
    if (q.type === "multi") return ((answers[q.id] ?? []) as string[]).length > 0;
    if (q.type === "inputs") return true; // stats optional
    return !!answers[q.id];
  }

  async function handleNext() {
    if (step < total - 1) {
      setStep((s) => s + 1);
    } else {
      setGenerating(true);
      try {
        const payload = {
          goal: answers.goal, experience: answers.experience,
          daysPerWeek: parseInt(answers.daysPerWeek || "4"),
          timePreference: "Morning", equipment: [answers.equipment || "bodyweight"],
          constraints: ["None"], timeframe: "8 weeks",
          physiqueGoal: answers.focusAreas?.[0] || "Athletic",
          lifestyle: { deskHours: 8, sleepQuality: "Average (6-7 hours)", stressLevel: "Moderate" },
          psychology: { motivation: "Health", pastStruggle: "Consistency" },
          calibration: { pushups: 10, squatComfort: 3, plankSeconds: 30, balanceSeconds: 10, hingeComfort: 3 },
        };
        const res = await fetch("/api/workouts/generate", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
        });
        const result = await res.json();
        if (result.success && result.data) {
          localStorage.setItem("humanstack_plan", JSON.stringify(result.data));
        }
      } catch (e) {
        console.error(e);
      }
    }
  }

  if (generating && !done) return <GeneratingScreen onDone={() => { setGenerating(false); setDone(true); }} />;
  if (done) return <PlanReadyScreen answers={answers} />;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="grid-pattern absolute inset-0" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[100px]" />
      </div>

      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-white/5 px-6 py-4">
        <div className="max-w-xl mx-auto flex items-center gap-4">
          <button
            onClick={() => step === 0 ? router.push("/") : setStep((s) => s - 1)}
            className="w-9 h-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-[#9CA3AF] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Progress bar */}
          <div className="flex-1 relative">
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                animate={{ width: `${((step + 1) / total) * 100}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
          </div>
          <span className="text-xs font-mono text-[#4B5563] shrink-0">{step + 1}/{total}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-8">
                <p className="text-blue-400 text-xs font-mono uppercase tracking-widest mb-2">
                  Step {step + 1} of {total}
                </p>
                <h1 className="font-heading font-bold text-3xl text-white mb-2 leading-tight">
                  {q.question}
                </h1>
                <p className="text-[#9CA3AF] text-sm">{q.subtitle}</p>
              </div>

              {/* Inputs type */}
              {q.type === "inputs" && (
                <div className="space-y-4">
                  {q.fields?.map((field) => (
                    <div key={field.key}>
                      <label className="block text-xs text-[#9CA3AF] font-medium mb-2 uppercase tracking-wider">
                        {field.label}
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          placeholder={field.placeholder}
                          value={answers.stats?.[field.key] ?? ""}
                          onChange={(e) => handleInput(field.key, e.target.value)}
                          className="w-full bg-white/5 border border-white/8 rounded-xl px-4 py-3.5 text-white text-base placeholder-[#4B5563] focus:outline-none focus:border-blue-500/60 focus:bg-blue-500/5 transition-all pr-16"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] text-sm font-mono">
                          {field.unit}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Option cards */}
              {(q.type === "single" || q.type === "multi") && (
                <div className="space-y-2.5">
                  {q.options?.map((opt) => {
                    const val = getVal(q.id);
                    const isSelected = q.type === "multi"
                      ? (val as string[]).includes(opt.value)
                      : val === opt.value;
                    return (
                      <OptionCard
                        key={opt.value}
                        label={opt.label}
                        emoji={opt.emoji}
                        desc={opt.desc}
                        selected={isSelected}
                        onClick={() => handleOption(opt.value)}
                      />
                    );
                  })}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="sticky bottom-0 px-6 pb-8 pt-4 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/90 to-transparent">
        <div className="max-w-xl mx-auto">
          <button
            disabled={!canProceed()}
            onClick={handleNext}
            className={`w-full flex items-center justify-center gap-2.5 font-semibold py-4 rounded-xl text-sm transition-all ${
              canProceed()
                ? "bg-blue-600 hover:bg-blue-500 text-white hover:shadow-[0_0_28px_rgba(59,130,246,0.4)]"
                : "bg-white/5 text-white/20 cursor-not-allowed border border-white/5"
            }`}
          >
            {step === total - 1 ? (
              <><Dumbbell className="w-4 h-4" /> Generate My Protocol</>
            ) : (
              <>Continue <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
          {q.type === "multi" && (
            <p className="text-center text-[#4B5563] text-xs mt-3">Select all that apply</p>
          )}
          {q.type === "inputs" && (
            <p className="text-center text-[#4B5563] text-xs mt-3">
              <button onClick={handleNext} className="text-blue-500 hover:text-blue-400 transition-colors">
                Skip — I&apos;ll add this later
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
