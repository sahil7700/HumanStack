"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, Dumbbell, BarChart2, User, Zap, Menu, X, LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/components/home/EmptyState";
import { CalendarTab } from "@/components/home/CalendarTab";
import { TodayTab } from "@/components/home/TodayTab";
import { ProgressTab } from "@/components/home/ProgressTab";

type Tab = "today" | "calendar" | "progress";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "today", label: "Today", icon: <Dumbbell className="w-4 h-4" /> },
  { id: "calendar", label: "Calendar", icon: <CalendarDays className="w-4 h-4" /> },
  { id: "progress", label: "Progress", icon: <BarChart2 className="w-4 h-4" /> },
];

function Sidebar({ activeTab, setActiveTab, userName }: {
  activeTab: Tab;
  setActiveTab: (t: Tab) => void;
  userName: string;
}) {
  const router = useRouter();

  function handleSignOut() {
    localStorage.removeItem("humanstack_plan");
    localStorage.removeItem("humanstack_user");
    localStorage.removeItem("humanstack_user_id");
    router.push("/");
  }

  return (
    <div className="w-56 h-full flex flex-col bg-[#080810] border-r border-white/5">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-heading font-bold text-white text-base">HumanStack</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-blue-600/20 text-blue-300 border border-blue-500/25"
                  : "text-[#9CA3AF] hover:text-white hover:bg-white/5"
              }`}
            >
              <span className={isActive ? "text-blue-400" : "text-white/40"}>{tab.icon}</span>
              {tab.label}
              {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />}
            </button>
          );
        })}

        <div className="pt-3 mt-3 border-t border-white/5">
          <Link
            href="/profile"
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#9CA3AF] hover:text-white hover:bg-white/5 transition-all"
          >
            <User className="w-4 h-4 text-white/40" />
            Profile
          </Link>
        </div>
      </nav>

      {/* User + sign out */}
      <div className="px-3 py-4 border-t border-white/5">
        <div className="flex items-center gap-2.5 px-3 mb-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-600/30 border border-blue-500/30 flex items-center justify-center">
            <span className="text-[10px] font-bold text-blue-300">{userName?.charAt(0)?.toUpperCase() || "U"}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">{userName || "Athlete"}</p>
            <p className="text-[#9CA3AF] text-[10px]">Active Protocol</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs text-[#9CA3AF] hover:text-white hover:bg-white/5 transition-all"
        >
          <LogOut className="w-3.5 h-3.5" /> Sign Out
        </button>
      </div>
    </div>
  );
}

export function HomeShell() {
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("today");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("humanstack_plan");
    const user = localStorage.getItem("humanstack_user");
    if (stored) { try { setPlan(JSON.parse(stored)); } catch { /* ignore */ } }
    if (user) { try { setUserName(JSON.parse(user).name || ""); } catch { /* ignore */ } }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.6 }}
          className="text-[#9CA3AF] text-sm font-mono">Initializing system...</motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex relative">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="grid-pattern absolute inset-0 opacity-60" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/4 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/3 rounded-full blur-[100px]" />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col h-screen sticky top-0 z-30 relative">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} userName={userName} />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-56 z-50 lg:hidden"
            >
              <Sidebar activeTab={activeTab} setActiveTab={(t) => { setActiveTab(t); setSidebarOpen(false); }} userName={userName} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header className="sticky top-0 z-20 bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-white/5">
          <div className="px-5 py-4 flex items-center justify-between max-w-4xl mx-auto w-full">
            <div className="flex items-center gap-3">
              {/* Mobile menu */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden w-9 h-9 rounded-xl glass border border-white/8 flex items-center justify-center text-[#9CA3AF] hover:text-white transition-colors"
              >
                <Menu className="w-4 h-4" />
              </button>
              {/* Mobile tab label */}
              <div className="lg:hidden">
                <p className="font-heading font-semibold text-white text-base capitalize">{activeTab}</p>
              </div>
              {/* Desktop greeting */}
              <div className="hidden lg:block">
                <p className="text-[#9CA3AF] text-sm">
                  {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </p>
                <h1 className="font-heading font-bold text-white text-lg">
                  {userName ? `Good ${new Date().getHours() < 12 ? "morning" : "afternoon"}, ${userName.split(" ")[0]}` : "Your Dashboard"}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {plan && (
                <div className="hidden sm:flex items-center gap-1.5 glass border border-white/8 rounded-full px-3 py-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                  <span className="text-[#9CA3AF] text-xs font-mono">Active Protocol</span>
                </div>
              )}
              <Link href="/profile">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-600/30 border border-blue-500/30 flex items-center justify-center hover:border-blue-500/60 transition-colors">
                  <span className="text-[11px] font-bold text-blue-300">{userName?.charAt(0)?.toUpperCase() || "U"}</span>
                </div>
              </Link>
            </div>
          </div>

          {/* Mobile tab nav */}
          <div className="lg:hidden px-5 pb-3 flex gap-1">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive ? "bg-blue-600/20 text-blue-300 border border-blue-500/25" : "text-[#9CA3AF] hover:text-white"
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              );
            })}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-5 py-6 max-w-4xl mx-auto w-full pb-8">
          {!plan ? (
            <EmptyState />
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                {activeTab === "today" && <TodayTab plan={plan} />}
                {activeTab === "calendar" && <CalendarTab plan={plan} />}
                {activeTab === "progress" && <ProgressTab plan={plan} />}
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>
    </div>
  );
}
