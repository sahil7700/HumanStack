"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LiveSessionMode, SessionProp } from '@/components/LiveSessionMode';

export default function WorkoutPage() {
  const [session, setSession] = useState<SessionProp | null>(null);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("humanstack_plan");
    if (stored) {
      try {
        const plan = JSON.parse(stored);
        let foundDay = null;
        for (const week of plan.weeks || []) {
            const day = week.days.find((d: any) => !d.isRestDay && d.exercises?.length > 0);
            if (day) {
                foundDay = day;
                break;
            }
        }

        if (foundDay) {
          setSession({
            dayName: `Day ${foundDay.dayNumber}`,
            focus: foundDay.focus || plan.focus,
            estimatedDurationMinutes: foundDay.estimatedDurationMinutes || 45,
            exercises: foundDay.exercises.map((ex: any, idx: number) => ({
              id: `ex-${idx}`,
              name: ex.name,
              sets: ex.sets || 3,
              reps: ex.reps || "10",
              restSeconds: 60,
              muscleTarget: "Primary Focus",
              formCue: ex.notes || "Keep core tight.",
              commonMistake: "Rushing the eccentric phase."
            }))
          });
        }
      } catch (e) {
        console.error("Failed to load workout", e);
      }
    }
  }, []);

  if (!session) {
    return <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center font-mono">Loading Workout Protocol...</div>;
  }

  return (
    <LiveSessionMode 
      session={session} 
      onExitSession={() => router.push('/dashboard')}
      onSessionComplete={(log) => {
        console.log("Session complete", log);
        router.push('/dashboard');
      }} 
    />
  );
}
