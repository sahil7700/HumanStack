"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LiveRecoveryMode, RecoverySessionProp } from '@/components/LiveRecoveryMode';

export default function RecoveryPage() {
  const [session, setSession] = useState<RecoverySessionProp | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchRecovery() {
      try {
        const storedPlan = localStorage.getItem("humanstack_plan");
        const plan = storedPlan ? JSON.parse(storedPlan) : null;
        
        let lastFocus = "General full body";
        if (plan && plan.weeks) {
          const firstNonRest = plan.weeks[0]?.days.find((d: any) => !d.isRestDay);
          if (firstNonRest) {
            lastFocus = firstNonRest.focus;
          }
        }

        const res = await fetch("/api/recovery/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lastTrainedMuscleGroups: [lastFocus],
            constraints: plan?.constraints || [],
            equipment: plan?.equipment || ["Bodyweight"],
            durationMinutes: 15,
            primaryGoal: plan?.focus || "Recovery and Mobility"
          })
        });

        const data = await res.json();
        
        if (data && data.activities) {
          setSession(data);
        } else {
          setError("Failed to generate recovery protocol. Please try again.");
        }
      } catch (err: any) {
        setError(err.message || "An error occurred");
      }
    }

    fetchRecovery();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col items-center justify-center font-mono p-4 text-center">
        <div className="text-red-500 mb-6">{error}</div>
        <button onClick={() => router.push('/dashboard')} className="text-zinc-400 hover:text-white underline">
          Return to Control Panel
        </button>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col items-center justify-center font-mono">
        <div className="w-12 h-12 border-4 border-[#00D9FF] border-t-transparent rounded-full animate-spin mb-6"></div>
        <div className="text-[#00D9FF] tracking-widest uppercase text-sm">Generating Active Recovery...</div>
      </div>
    );
  }

  return (
    <LiveRecoveryMode 
      session={session} 
      onExitSession={() => router.push('/dashboard')}
      onSessionComplete={(logs) => {
        console.log("Recovery complete", logs);
        router.push('/dashboard');
      }} 
    />
  );
}
