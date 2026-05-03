"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Play, ArrowRight } from 'lucide-react';

export type Activity = {
  name: string;
  durationSeconds: number;
  instruction: string;
  targetArea: string;
  breathingCue?: string;
};

export type RecoverySessionProp = {
  sessionType: string;
  title: string;
  durationMinutes: number;
  activities: Activity[];
  whyThisHelps: string;
};

export type RecoveryState =
  | { phase: 'INTRO' }
  | { phase: 'ACTIVITY_VIEW'; activityIndex: number }
  | { phase: 'ACTIVITY_TIMER'; activityIndex: number; secondsElapsed: number }
  | { phase: 'FEEL_RATING'; activityIndex: number }
  | { phase: 'COMPLETE' };

interface LiveRecoveryModeProps {
  session: RecoverySessionProp;
  onSessionComplete: (logs: any) => void;
  onExitSession: () => void;
}

const MotionWrapper = ({ children, keyId }: { children: React.ReactNode; keyId: string }) => (
  <motion.div
    key={keyId}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.2 }}
    className="h-full w-full flex flex-col items-center justify-center relative max-w-xl mx-auto px-4"
  >
    {children}
  </motion.div>
);

export function LiveRecoveryMode({ session, onSessionComplete, onExitSession }: LiveRecoveryModeProps) {
  const [state, setState] = useState<RecoveryState>({ phase: 'INTRO' });
  const [startTime, setStartTime] = useState<number>(0);
  const [ratings, setRatings] = useState<Record<number, string>>({});
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (state.phase === 'INTRO') {
      setStartTime(Date.now());
    }
  }, [state.phase]);

  const submitRating = (activityIndex: number, rating: string) => {
    setRatings(prev => ({ ...prev, [activityIndex]: rating }));

    if (activityIndex + 1 < session.activities.length) {
      setState({ phase: 'ACTIVITY_VIEW', activityIndex: activityIndex + 1 });
    } else {
      setState({ phase: 'COMPLETE' });
    }
  };

  useEffect(() => {
    if (state.phase === 'ACTIVITY_TIMER') {
      timerRef.current = setInterval(() => {
        setState(prev => {
          if (prev.phase === 'ACTIVITY_TIMER') {
            const currentActivity = session.activities[prev.activityIndex];
            if (prev.secondsElapsed >= currentActivity.durationSeconds) {
              clearInterval(timerRef.current!);
              return { phase: 'FEEL_RATING', activityIndex: prev.activityIndex };
            }
            return { ...prev, secondsElapsed: prev.secondsElapsed + 1 };
          }
          return prev;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.phase, session.activities]);

  // Accent color is #00D9FF for recovery
  return (
    <div className="fixed inset-0 z-50 bg-[#0A0A0A] text-[#F0F0F0] overflow-hidden flex flex-col">
      <AnimatePresence mode="wait">
        
        {state.phase === 'INTRO' && (
          <MotionWrapper keyId="intro">
            <Button variant="ghost" onClick={onExitSession} className="absolute top-4 right-4 text-zinc-500 hover:text-white">Close</Button>
            <div className="inline-block px-4 py-1 rounded-full bg-[#00D9FF]/10 text-[#00D9FF] mb-6 font-mono text-sm uppercase tracking-widest border border-[#00D9FF]/30">
              Active Recovery
            </div>
            <h1 className="text-4xl font-bold mb-4 text-center text-white">{session.title}</h1>
            <p className="text-zinc-400 text-center mb-8 max-w-sm">{session.whyThisHelps}</p>
            
            <div className="w-full bg-zinc-900 rounded-2xl p-6 mb-24 max-h-[40vh] overflow-y-auto border border-zinc-800">
              <h3 className="text-zinc-500 text-sm font-bold uppercase tracking-wider mb-4">Flow Sequence</h3>
              <div className="space-y-4">
                {session.activities.map((act, i) => (
                  <div key={i} className="flex justify-between items-center border-b border-zinc-800/50 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs text-[#00D9FF] font-mono">{i + 1}</div>
                      <span className="font-medium text-lg text-white">{act.name}</span>
                    </div>
                    <span className="text-zinc-500 font-mono">{act.durationSeconds}s</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute bottom-8 left-4 right-4 max-w-xl mx-auto">
              <Button 
                onClick={() => setState({ phase: 'ACTIVITY_VIEW', activityIndex: 0 })}
                className="w-full h-16 text-lg font-bold bg-[#00D9FF] text-black hover:bg-[#00c4e6] shadow-[0_0_30px_rgba(0,217,255,0.2)] rounded-xl"
              >
                Begin Recovery
              </Button>
            </div>
          </MotionWrapper>
        )}

        {state.phase === 'ACTIVITY_VIEW' && (
          <MotionWrapper keyId="activity-view">
            <div className="w-full flex flex-col h-full pt-8 pb-32">
              <div className="flex justify-between text-xs text-zinc-500 font-mono tracking-widest uppercase mb-12">
                <span>Movement {state.activityIndex + 1} of {session.activities.length}</span>
              </div>
              
              <div className="flex-1 flex flex-col justify-center items-center text-center space-y-8">
                <div className="inline-block px-3 py-1 rounded-md bg-zinc-800/80 text-[#00D9FF] text-xs font-bold uppercase tracking-wider mb-2">
                  {session.activities[state.activityIndex].targetArea}
                </div>
                <h2 className="text-5xl md:text-6xl font-bold tracking-tight text-white mb-8">
                  {session.activities[state.activityIndex].name}
                </h2>
                
                <div className="w-full max-w-md space-y-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 text-left">
                  <p className="text-white text-lg leading-relaxed">{session.activities[state.activityIndex].instruction}</p>
                  {session.activities[state.activityIndex].breathingCue && (
                    <div className="pt-4 border-t border-zinc-800/50">
                      <p className="text-[#00D9FF] italic">{session.activities[state.activityIndex].breathingCue}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-auto">
                <Button 
                  onClick={() => setState({ phase: 'ACTIVITY_TIMER', activityIndex: state.activityIndex, secondsElapsed: 0 })}
                  className="w-full h-20 text-2xl font-bold bg-[#00D9FF] text-black hover:bg-[#00c4e6] shadow-[0_0_40px_rgba(0,217,255,0.3)] rounded-2xl flex gap-3"
                >
                  <Play fill="currentColor" /> Start Timer
                </Button>
              </div>
            </div>
          </MotionWrapper>
        )}

        {state.phase === 'ACTIVITY_TIMER' && (
          <MotionWrapper keyId="activity-timer">
            <div className="text-center w-full">
              <div className="text-[#00D9FF] font-mono tracking-widest uppercase mb-16 text-sm">
                Hold & Breathe
              </div>
              
              <div className="font-mono font-bold text-white relative">
                <div className="text-[140px] md:text-[200px] leading-none">
                  {state.secondsElapsed}
                </div>
                <div className="text-2xl text-zinc-500 mt-4">
                  of {session.activities[state.activityIndex].durationSeconds} seconds
                </div>
              </div>

              <Button 
                variant="outline"
                size="lg"
                onClick={() => {
                  clearInterval(timerRef.current!);
                  setState({ phase: 'FEEL_RATING', activityIndex: state.activityIndex });
                }}
                className="mt-24 border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl px-8"
              >
                Skip to Rating
              </Button>
            </div>
          </MotionWrapper>
        )}

        {state.phase === 'FEEL_RATING' && (
          <MotionWrapper keyId="feel-rating">
            <div className="w-full text-center max-w-lg">
              <h2 className="text-4xl font-bold mb-12 text-white">How does this area feel?</h2>
              
              <div className="flex flex-col gap-4 mb-12">
                <button 
                  onClick={() => submitRating(state.activityIndex, 'Loose')}
                  className="bg-blue-500/10 border border-blue-500/50 hover:bg-blue-500/20 text-blue-400 rounded-2xl p-6 transition-all text-xl font-bold"
                >
                  Loose & Mobile
                </button>
                <button 
                  onClick={() => submitRating(state.activityIndex, 'Normal')}
                  className="bg-zinc-800/50 border border-zinc-700 hover:bg-zinc-800 text-zinc-300 rounded-2xl p-6 transition-all text-xl font-bold"
                >
                  Normal
                </button>
                <button 
                  onClick={() => submitRating(state.activityIndex, 'Tight')}
                  className="bg-red-500/10 border border-red-500/50 hover:bg-red-500/20 text-red-400 rounded-2xl p-6 transition-all text-xl font-bold"
                >
                  Very Tight
                </button>
              </div>
            </div>
          </MotionWrapper>
        )}

        {state.phase === 'COMPLETE' && (
          <MotionWrapper keyId="complete">
            <div className="text-center w-full max-w-lg">
              <div className="w-24 h-24 bg-[#00D9FF]/20 rounded-full flex items-center justify-center mx-auto mb-8">
                <CheckCircle2 className="w-12 h-12 text-[#00D9FF]" />
              </div>
              <h2 className="text-5xl font-bold text-white mb-4 tracking-tight">Recovery Complete</h2>
              <p className="text-xl text-zinc-400 mb-12">Great job prioritizing your active rest.</p>
              
              <Button 
                onClick={() => onSessionComplete(ratings)}
                className="w-full h-16 text-lg font-bold bg-[#00D9FF] text-black hover:bg-[#00c4e6] rounded-xl"
              >
                Save & Exit
              </Button>
            </div>
          </MotionWrapper>
        )}
        
      </AnimatePresence>
    </div>
  );
}
