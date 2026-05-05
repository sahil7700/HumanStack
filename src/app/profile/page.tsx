"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, User, Camera, Save, Lock, Zap, Target, Activity, LogOut, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

/* ─── Field ── */
function Field({ label, value, onChange, type = "text", unit, readOnly }: {
  label: string; value: string; onChange?: (v: string) => void;
  type?: string; unit?: string; readOnly?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs text-[#9CA3AF] font-medium mb-2 uppercase tracking-wider">{label}</label>
      <div className="relative">
        <input
          type={type}
          value={value}
          readOnly={readOnly}
          onChange={(e) => onChange?.(e.target.value)}
          className={`w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition-all ${
            readOnly ? "cursor-default text-[#9CA3AF]" : "focus:border-blue-500/50 focus:bg-blue-500/4 hover:border-white/12"
          } ${unit ? "pr-12" : ""}`}
        />
        {unit && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] text-xs font-mono">{unit}</span>}
      </div>
    </div>
  );
}

/* ─── Section ── */
function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl border border-white/8 overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-white/6">
        <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/20 flex items-center justify-center">
          <span className="text-blue-400">{icon}</span>
        </div>
        <h2 className="font-heading font-semibold text-white text-base">{title}</h2>
      </div>
      <div className="p-6 space-y-4">{children}</div>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState({
    name: "", email: "", age: "", weight: "", height: "",
    goal: "", experience: "", avatar: "",
  });

  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });

  useEffect(() => {
    const user = localStorage.getItem("humanstack_user");
    if (user) {
      try {
        const u = JSON.parse(user);
        setProfile((p) => ({ ...p, name: u.name || "", age: u.age || "", weight: u.weight || "" }));
      } catch { /* ignore */ }
    }
    const plan = localStorage.getItem("humanstack_plan");
    if (plan) {
      try {
        const p = JSON.parse(plan);
        setProfile((prev) => ({ ...prev, goal: p.focus || "" }));
      } catch { /* ignore */ }
    }
  }, []);

  const logs = (() => { try { return JSON.parse(localStorage.getItem("humanstack_progress") || "[]"); } catch { return []; } })();
  const plan = (() => { try { return JSON.parse(localStorage.getItem("humanstack_plan") || "null"); } catch { return null; } })();
  const totalDays = plan ? (plan.weeks || []).flatMap((w: any) => w.days || []).filter((d: any) => !d.isRestDay).length : 0;

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setProfile((p) => ({ ...p, avatar: reader.result as string }));
    reader.readAsDataURL(file);
  }

  function handleSave() {
    localStorage.setItem("humanstack_user", JSON.stringify({
      name: profile.name, age: profile.age, weight: profile.weight,
    }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function handleSignOut() {
    localStorage.removeItem("humanstack_plan");
    localStorage.removeItem("humanstack_user");
    localStorage.removeItem("humanstack_user_id");
    router.push("/");
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="grid-pattern absolute inset-0 opacity-60" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-white/5 px-5 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="w-9 h-9 rounded-xl glass border border-white/8 flex items-center justify-center text-[#9CA3AF] hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="font-heading font-bold text-white text-lg">Profile</h1>
              <p className="text-[#9CA3AF] text-xs">Manage your account</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              saved
                ? "bg-green-600/20 border border-green-500/30 text-green-400"
                : "bg-blue-600 hover:bg-blue-500 text-white hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]"
            }`}
          >
            <Save className="w-4 h-4" />
            {saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </header>

      <main className="relative z-10 max-w-2xl mx-auto px-5 py-8 space-y-5 pb-16">
        {/* Avatar + name */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl border border-white/8 p-6 flex items-center gap-5">
          <div className="relative">
            <div
              onClick={() => fileRef.current?.click()}
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600/30 to-purple-600/30 border-2 border-blue-500/30 flex items-center justify-center cursor-pointer group hover:border-blue-500/60 transition-all overflow-hidden"
              style={profile.avatar ? { backgroundImage: `url(${profile.avatar})`, backgroundSize: "cover", backgroundPosition: "center" } : {}}
            >
              {!profile.avatar && (
                <span className="font-heading font-bold text-3xl text-blue-300 group-hover:scale-90 transition-transform">
                  {profile.name?.charAt(0)?.toUpperCase() || "U"}
                </span>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-blue-600 border border-[#0A0A0A] flex items-center justify-center">
              <Camera className="w-3.5 h-3.5 text-white" />
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
          <div>
            <h2 className="font-heading font-bold text-xl text-white">{profile.name || "Athlete"}</h2>
            <p className="text-[#9CA3AF] text-sm mt-0.5">{profile.email || "Click avatar to upload photo"}</p>
            {plan && (
              <div className="flex items-center gap-1.5 mt-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                <span className="text-blue-400 text-xs font-mono">Active Protocol</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Progress snapshot */}
        {logs.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="grid grid-cols-3 gap-3">
            {[
              { label: "Sessions", value: logs.length },
              { label: "Plan Days", value: totalDays },
              { label: "Progress", value: `${Math.round((logs.length / (totalDays || 1)) * 100)}%` },
            ].map(({ label, value }) => (
              <div key={label} className="glass rounded-2xl border border-white/8 p-4 text-center">
                <p className="font-heading font-bold text-2xl text-white">{value}</p>
                <p className="text-[#9CA3AF] text-xs font-mono uppercase tracking-wider mt-0.5">{label}</p>
              </div>
            ))}
          </motion.div>
        )}

        {/* Personal info */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Section title="Personal Information" icon={<User className="w-4 h-4" />}>
            <Field label="Name" value={profile.name} onChange={(v) => setProfile({ ...profile, name: v })} />
            <Field label="Email" value={profile.email} onChange={(v) => setProfile({ ...profile, email: v })} type="email" />
            <div className="grid grid-cols-3 gap-3">
              <Field label="Age" value={profile.age} onChange={(v) => setProfile({ ...profile, age: v })} type="number" unit="yrs" />
              <Field label="Weight" value={profile.weight} onChange={(v) => setProfile({ ...profile, weight: v })} type="number" unit="kg" />
              <Field label="Height" value={profile.height} onChange={(v) => setProfile({ ...profile, height: v })} type="number" unit="cm" />
            </div>
          </Section>
        </motion.div>

        {/* Fitness preferences */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Section title="Fitness Preferences" icon={<Target className="w-4 h-4" />}>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Primary Goal" value={profile.goal} onChange={(v) => setProfile({ ...profile, goal: v })} />
              <Field label="Experience Level" value={profile.experience} onChange={(v) => setProfile({ ...profile, experience: v })} />
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-blue-600/8 border border-blue-500/20">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" />
                <span className="text-white text-sm font-medium">{plan ? "Active 30-Day Protocol" : "No active plan"}</span>
              </div>
              {plan ? (
                <button onClick={() => router.push("/dashboard")} className="text-blue-400 text-xs hover:text-blue-300 transition-colors flex items-center gap-1">
                  View <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button onClick={() => router.push("/create-routine")} className="text-blue-400 text-xs hover:text-blue-300 transition-colors flex items-center gap-1">
                  Create <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </Section>
        </motion.div>

        {/* Security */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Section title="Security" icon={<Lock className="w-4 h-4" />}>
            <Field label="Current Password" value={passwords.current} onChange={(v) => setPasswords({ ...passwords, current: v })} type="password" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="New Password" value={passwords.newPass} onChange={(v) => setPasswords({ ...passwords, newPass: v })} type="password" />
              <Field label="Confirm Password" value={passwords.confirm} onChange={(v) => setPasswords({ ...passwords, confirm: v })} type="password" />
            </div>
            <button className="w-full py-3 rounded-xl border border-white/8 text-[#9CA3AF] hover:text-white hover:border-white/12 hover:bg-white/3 text-sm transition-all">
              Update Password
            </button>
          </Section>
        </motion.div>

        {/* Danger zone */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <div className="glass rounded-2xl border border-red-500/15 overflow-hidden">
            <div className="px-6 py-4 border-b border-red-500/10">
              <h2 className="font-heading font-semibold text-white/60 text-sm">Account Actions</h2>
            </div>
            <div className="p-6">
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2.5 text-red-400 hover:text-red-300 text-sm font-medium transition-colors group"
              >
                <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                Sign Out of HumanStack
              </button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
