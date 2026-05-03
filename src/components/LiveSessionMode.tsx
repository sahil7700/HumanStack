"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertTriangle, Play, SkipForward, X, RefreshCw } from 'lucide-react';

export type Exercise = {
  id: string;
  name: string;
  sets: number;
  reps: string;
  restSeconds: number;
  muscleTarget: string;
  formCue: string;
  commonMistake: string;
};

export type SessionProp = {
  dayName: string;
  focus: string;
  estimatedDurationMinutes: number;
  exercises: Exercise[];
};

export type SessionLog = {
  completedAt: string;
  totalTimeSeconds: number;
  holisticReview?: { energy: number, soreness: string, enjoyment: number };
  exerciseLogs: Array<{
    exerciseId: string;
    setsCompleted: number;
    rpeRatings: Array<1 | 2 | 3>;
    repsActual: number[];
  }>;
};

export type Alternative = {
  name: string;
  sets: number;
  reps: string;
  muscleTarget: string;
  whyThisWorks: string;
  formCue: string;
};

export type SessionState =
  | { phase: 'INTRO' }
  | { phase: 'EXERCISE_VIEW'; exerciseIndex: number }
  | { phase: 'SET_TIMER'; exerciseIndex: number; setIndex: number; secondsLeft: number }
  | { phase: 'RPE'; exerciseIndex: number; setIndex: number }
  | { phase: 'REST'; exerciseIndex: number; setIndex: number; secondsLeft: number; nextSetReps: number }
  | { phase: 'HOLISTIC_REVIEW' }
  | { phase: 'COMPLETE' };

interface LiveSessionModeProps {
  session: SessionProp;
  onSessionComplete: (sessionLog: SessionLog) => void;
  onExitSession: () => void;
}

const playBeep = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
    
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.2);
  } catch (e) {
    console.error("Audio error:", e);
  }
};

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

export function LiveSessionMode({ session, onSessionComplete, onExitSession }: LiveSessionModeProps) {
  const [localExercises, setLocalExercises] = useState<Exercise[]>(session.exercises);
  const [state, setState] = useState<SessionState>({ phase: 'INTRO' });
  const [startTime, setStartTime] = useState<number>(0);
  
  // Adaptive state tracking
  const [logs, setLogs] = useState<Record<string, { rpeRatings: (1|2|3)[], repsActual: number[] }>>({});
  const [currentReps, setCurrentReps] = useState<number>(0);
  const [holisticReview, setHolisticReview] = useState({ energy: 3, soreness: 'Expected', enjoyment: 3 });
  
  // Ensure we track timer
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Swap State
  const [isSwapOpen, setIsSwapOpen] = useState(false);
  const [swapReason, setSwapReason] = useState<string | null>(null);
  const [swapLoading, setSwapLoading] = useState(false);
  const [swapAlternatives, setSwapAlternatives] = useState<Alternative[]>([]);

  useEffect(() => {
    if (state.phase === 'INTRO') {
      setStartTime(Date.now());
      // initialize logs
      const initLogs: Record<string, any> = {};
      localExercises.forEach(ex => {
        initLogs[ex.id] = { rpeRatings: [], repsActual: [] };
      });
      setLogs(initLogs);
    }
  }, [state.phase, localExercises]);

  const parseReps = (repStr: string): number => {
    const match = repStr.match(/\d+/);
    return match ? parseInt(match[0], 10) : 10;
  };

  const handleStartSet = (exerciseIndex: number, setIndex: number) => {
    const ex = localExercises[exerciseIndex];
    const initialReps = setIndex === 0 ? parseReps(ex.reps) : currentReps;
    setCurrentReps(initialReps);
    // Rough estimate for a set timer: 3 seconds per rep
    setState({ phase: 'SET_TIMER', exerciseIndex, setIndex, secondsLeft: initialReps * 3 });
  };

  const submitRPE = (exerciseIndex: number, setIndex: number, rating: 1 | 2 | 3) => {
    const ex = localExercises[exerciseIndex];
    const newLogs = { ...logs };
    newLogs[ex.id].rpeRatings.push(rating);
    newLogs[ex.id].repsActual.push(currentReps);
    setLogs(newLogs);

    let nextSetReps = currentReps;
    if (rating === 3) {
      nextSetReps = Math.max(1, currentReps - 2);
    } else if (rating === 1 && setIndex > 0 && newLogs[ex.id].rpeRatings[setIndex - 1] === 1) {
      nextSetReps = currentReps + 2;
    }
    setCurrentReps(nextSetReps);

    if (setIndex + 1 < ex.sets) {
      setState({ phase: 'REST', exerciseIndex, setIndex, secondsLeft: ex.restSeconds, nextSetReps });
    } else {
      if (exerciseIndex + 1 < localExercises.length) {
        setState({ phase: 'EXERCISE_VIEW', exerciseIndex: exerciseIndex + 1 });
      } else {
        setState({ phase: 'HOLISTIC_REVIEW' });
      }
    }
  };

  const finishSession = () => {
    const totalTimeSeconds = Math.floor((Date.now() - startTime) / 1000);
    const exerciseLogs = localExercises.map(ex => ({
      exerciseId: ex.id,
      setsCompleted: logs[ex.id].rpeRatings.length,
      rpeRatings: logs[ex.id].rpeRatings,
      repsActual: logs[ex.id].repsActual
    }));
    
    onSessionComplete({
      completedAt: new Date().toISOString(),
      totalTimeSeconds,
      holisticReview,
      exerciseLogs
    });
  };

  const handleFetchSwap = async (reason: string) => {
    setSwapReason(reason);
    setSwapLoading(true);
    setSwapAlternatives([]);

    if (state.phase !== 'EXERCISE_VIEW') return;
    const currentEx = localExercises[state.exerciseIndex];

    try {
      const res = await fetch("/api/exercise/swap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exerciseName: currentEx.name,
          reason,
          availableEquipment: ["Bodyweight", "Dumbbells", "Bands"], // Usually gathered from context/userProfile
          constraints: [], // Usually from userProfile
          sessionContext: {
            dayFocus: session.focus,
            completedExercises: localExercises.slice(0, state.exerciseIndex).map(e => e.name)
          }
        })
      });
      const data = await res.json();
      if (data.alternatives) {
        setSwapAlternatives(data.alternatives);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSwapLoading(false);
    }
  };

  const handleConfirmSwap = (alt: Alternative) => {
    if (state.phase !== 'EXERCISE_VIEW') return;
    
    const currentEx = localExercises[state.exerciseIndex];
    const newEx: Exercise = {
      ...currentEx,
      id: "swap-" + Date.now(),
      name: alt.name,
      sets: alt.sets,
      reps: alt.reps,
      muscleTarget: alt.muscleTarget,
      formCue: alt.formCue,
      commonMistake: "Focus on form and slow execution." // Fallback since API doesn't return mistake
    };

    const newLocal = [...localExercises];
    newLocal[state.exerciseIndex] = newEx;
    setLocalExercises(newLocal);
    
    // Initialize log for new exercise
    const newLogs = { ...logs };
    newLogs[newEx.id] = { rpeRatings: [], repsActual: [] };
    setLogs(newLogs);

    setIsSwapOpen(false);
    setSwapReason(null);
    setSwapAlternatives([]);
  };

  // Timer Effect
  useEffect(() => {
    if (state.phase === 'SET_TIMER' || state.phase === 'REST') {
      timerRef.current = setInterval(() => {
        setState(prev => {
          if (prev.phase === 'SET_TIMER') {
            if (prev.secondsLeft <= 1) {
              playBeep();
              clearInterval(timerRef.current!);
              return { phase: 'RPE', exerciseIndex: prev.exerciseIndex, setIndex: prev.setIndex };
            }
            return { ...prev, secondsLeft: prev.secondsLeft - 1 };
          } else if (prev.phase === 'REST') {
            if (prev.secondsLeft <= 4 && prev.secondsLeft > 1) {
              playBeep();
            } else if (prev.secondsLeft <= 1) {
              playBeep();
              clearInterval(timerRef.current!);
              return { phase: 'EXERCISE_VIEW', exerciseIndex: prev.exerciseIndex };
            }
            return { ...prev, secondsLeft: prev.secondsLeft - 1 };
          }
          return prev;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.phase]);

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0A0A] text-[#F0F0F0] overflow-hidden flex flex-col">
      <AnimatePresence mode="wait">
        
        {state.phase === 'INTRO' && (
          <MotionWrapper keyId="intro">
            <Button variant="ghost" onClick={onExitSession} className="absolute top-4 right-4 text-zinc-500 hover:text-white">Close</Button>
            <h1 className="text-4xl font-bold mb-2 text-center text-white">{session.dayName}</h1>
            <div className="inline-block px-4 py-1 rounded-full bg-zinc-800 text-green-400 mb-8 font-mono text-sm">
              Focus: {session.focus} • ~{session.estimatedDurationMinutes} min
            </div>
            
            <div className="w-full bg-zinc-900 rounded-2xl p-6 mb-24 max-h-[50vh] overflow-y-auto border border-zinc-800">
              <h3 className="text-zinc-500 text-sm font-bold uppercase tracking-wider mb-4">Exercises</h3>
              <div className="space-y-4">
                {localExercises.map((ex, i) => (
                  <div key={ex.id} className="flex justify-between items-center border-b border-zinc-800/50 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs text-zinc-400 font-mono">{i + 1}</div>
                      <span className="font-medium text-lg">{ex.name}</span>
                    </div>
                    <span className="text-zinc-500 font-mono">{ex.sets} × {ex.reps}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute bottom-8 left-4 right-4 max-w-xl mx-auto">
              <Button 
                onClick={() => setState({ phase: 'EXERCISE_VIEW', exerciseIndex: 0 })}
                className="w-full h-16 text-lg font-bold bg-[#39FF14] text-black hover:bg-[#32e011] shadow-[0_0_30px_rgba(57,255,20,0.2)] rounded-xl"
              >
                Begin Session
              </Button>
            </div>
          </MotionWrapper>
        )}

        {state.phase === 'EXERCISE_VIEW' && (
          <MotionWrapper keyId="exercise-view">
            <div className="w-full flex flex-col h-full pt-8 pb-32">
              <div className="flex justify-between text-xs text-zinc-500 font-mono tracking-widest uppercase mb-12">
                <span>Exercise {state.exerciseIndex + 1} of {localExercises.length}</span>
                <span>Set {logs[localExercises[state.exerciseIndex].id]?.rpeRatings.length + 1 || 1} of {localExercises[state.exerciseIndex].sets}</span>
              </div>
              
              <div className="flex-1 flex flex-col justify-center items-center text-center space-y-8">
                <div className="inline-block px-3 py-1 rounded-md bg-zinc-800/80 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
                  {localExercises[state.exerciseIndex].muscleTarget}
                </div>
                <h2 className="text-5xl md:text-6xl font-bold tracking-tight text-white mb-8">
                  {localExercises[state.exerciseIndex].name}
                </h2>
                
                <div className="w-full max-w-md space-y-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 text-left">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#39FF14] mt-0.5 shrink-0" />
                    <p className="text-[#39FF14] leading-relaxed">{localExercises[state.exerciseIndex].formCue}</p>
                  </div>
                  <div className="flex items-start gap-3 pt-4 border-t border-zinc-800/50">
                    <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                    <p className="text-amber-500/90 leading-relaxed">{localExercises[state.exerciseIndex].commonMistake}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mt-auto">
                <Button 
                  onClick={() => handleStartSet(state.exerciseIndex, logs[localExercises[state.exerciseIndex].id]?.rpeRatings.length || 0)}
                  className="w-full h-20 text-2xl font-bold bg-[#39FF14] text-black hover:bg-[#32e011] shadow-[0_0_40px_rgba(57,255,20,0.3)] rounded-2xl flex gap-3"
                >
                  <Play fill="currentColor" /> Start Set
                </Button>
                
                <Button 
                  variant="ghost" 
                  onClick={() => setIsSwapOpen(true)}
                  className="w-full text-zinc-500 hover:text-white"
                >
                  <RefreshCw className="w-4 h-4 mr-2" /> Swap Exercise
                </Button>
              </div>
            </div>
          </MotionWrapper>
        )}

        {state.phase === 'SET_TIMER' && (
          <MotionWrapper keyId="set-timer">
            <div className="text-center w-full">
              <div className="text-zinc-500 font-mono tracking-widest uppercase mb-16 text-sm">
                Set {state.setIndex + 1} / {localExercises[state.exerciseIndex].sets}
              </div>
              
              <div className="font-mono font-bold text-white relative">
                <motion.div 
                  className="text-[140px] md:text-[200px] leading-none"
                  animate={{ opacity: [1, 0.8, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  {state.secondsLeft}
                </motion.div>
                <div className="text-2xl text-zinc-500 mt-4">seconds</div>
              </div>
              
              <div className="mt-16 text-2xl text-green-400 font-medium">
                Target: {currentReps} reps
              </div>

              <Button 
                variant="outline"
                size="lg"
                onClick={() => {
                  clearInterval(timerRef.current!);
                  setState({ phase: 'RPE', exerciseIndex: state.exerciseIndex, setIndex: state.setIndex });
                }}
                className="mt-24 border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl px-8"
              >
                Done Early
              </Button>
            </div>
          </MotionWrapper>
        )}

        {state.phase === 'RPE' && (
          <MotionWrapper keyId="rpe">
            <div className="w-full text-center max-w-lg">
              <h2 className="text-4xl font-bold mb-12 text-white">How did that set feel?</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
                <button 
                  onClick={() => submitRPE(state.exerciseIndex, state.setIndex, 1)}
                  className="bg-blue-500/10 border border-blue-500/50 hover:bg-blue-500/20 text-blue-400 rounded-2xl p-8 flex flex-col items-center justify-center transition-all"
                >
                  <span className="text-2xl font-bold mb-2">Too Easy</span>
                  <span className="text-xs opacity-70 font-mono">RPE 1-6</span>
                </button>
                <button 
                  onClick={() => submitRPE(state.exerciseIndex, state.setIndex, 2)}
                  className="bg-green-500/10 border border-green-500/50 hover:bg-green-500/20 text-green-400 rounded-2xl p-8 flex flex-col items-center justify-center transition-all"
                >
                  <span className="text-2xl font-bold mb-2">Felt Right</span>
                  <span className="text-xs opacity-70 font-mono">RPE 7-8</span>
                </button>
                <button 
                  onClick={() => submitRPE(state.exerciseIndex, state.setIndex, 3)}
                  className="bg-red-500/10 border border-red-500/50 hover:bg-red-500/20 text-red-400 rounded-2xl p-8 flex flex-col items-center justify-center transition-all"
                >
                  <span className="text-2xl font-bold mb-2">Too Hard</span>
                  <span className="text-xs opacity-70 font-mono">RPE 9-10</span>
                </button>
              </div>
            </div>
          </MotionWrapper>
        )}

        {state.phase === 'REST' && (
          <MotionWrapper keyId="rest">
            <div className="text-center w-full">
              <div className="text-cyan-400 font-bold tracking-widest uppercase mb-12 text-xl">
                Resting
              </div>
              
              <div className="text-[120px] md:text-[160px] font-mono font-bold leading-none text-white mb-16">
                {state.secondsLeft}
              </div>
              
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-16">
                <span className="text-zinc-500 uppercase text-xs font-bold tracking-widest block mb-2">Next up</span>
                <span className="text-2xl text-white font-medium">Set {state.setIndex + 2} — {state.nextSetReps} reps</span>
              </div>

              <div className="flex justify-center gap-4">
                <Button 
                  variant="outline"
                  onClick={() => {
                    clearInterval(timerRef.current!);
                    setState({ phase: 'EXERCISE_VIEW', exerciseIndex: state.exerciseIndex });
                  }}
                  className="border-zinc-700 text-zinc-300 hover:text-white rounded-xl h-14 px-8"
                >
                  <SkipForward className="mr-2 h-5 w-5" /> Skip Rest
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setState(prev => prev.phase === 'REST' ? { ...prev, secondsLeft: prev.secondsLeft + 30 } : prev)}
                  className="border-zinc-700 text-zinc-300 hover:text-white rounded-xl h-14 px-8"
                >
                  +30 sec
                </Button>
              </div>
            </div>
          </MotionWrapper>
        )}

        {state.phase === 'HOLISTIC_REVIEW' && (
          <MotionWrapper keyId="holistic">
            <div className="text-center w-full max-w-lg">
              <h2 className="text-4xl font-bold mb-8 text-white">Post-Session Review</h2>
              <p className="text-zinc-400 mb-8">This feedback calibrates your next workout.</p>
              
              <div className="space-y-8 text-left mb-12">
                <div>
                  <label className="block text-zinc-300 font-bold mb-4 uppercase tracking-wider text-sm">Overall Energy Level</label>
                  <div className="flex justify-between gap-2">
                    {[1, 2, 3, 4, 5].map(val => (
                      <button 
                        key={val} 
                        onClick={() => setHolisticReview(prev => ({ ...prev, energy: val }))}
                        className={`flex-1 h-12 rounded-xl border ${holisticReview.energy === val ? 'bg-green-500 text-black border-green-500 font-bold' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'}`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-300 font-bold mb-4 uppercase tracking-wider text-sm">Muscle Soreness (from last session)</label>
                  <div className="flex flex-col gap-2">
                    {['None', 'Expected', 'Too much'].map(val => (
                      <button 
                        key={val} 
                        onClick={() => setHolisticReview(prev => ({ ...prev, soreness: val }))}
                        className={`w-full h-12 rounded-xl border ${holisticReview.soreness === val ? 'bg-green-500 text-black border-green-500 font-bold' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'}`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-300 font-bold mb-4 uppercase tracking-wider text-sm">Enjoyment</label>
                  <div className="flex justify-between gap-2">
                    {[1, 2, 3, 4, 5].map(val => (
                      <button 
                        key={val} 
                        onClick={() => setHolisticReview(prev => ({ ...prev, enjoyment: val }))}
                        className={`flex-1 h-12 rounded-xl border ${holisticReview.enjoyment === val ? 'bg-green-500 text-black border-green-500 font-bold' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'}`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <Button 
                onClick={() => setState({ phase: 'COMPLETE' })}
                className="w-full h-16 text-lg font-bold bg-[#39FF14] text-black hover:bg-[#32e011] rounded-xl"
              >
                Complete Review
              </Button>
            </div>
          </MotionWrapper>
        )}

        {state.phase === 'COMPLETE' && (
          <MotionWrapper keyId="complete">
            <div className="text-center w-full max-w-lg">
              <div className="w-24 h-24 bg-[#39FF14]/20 rounded-full flex items-center justify-center mx-auto mb-8">
                <CheckCircle2 className="w-12 h-12 text-[#39FF14]" />
              </div>
              <h2 className="text-5xl font-bold text-white mb-4 tracking-tight">Session Complete</h2>
              <p className="text-xl text-zinc-400 mb-12">Protocol successfully executed.</p>
              
              <div className="grid grid-cols-2 gap-4 mb-12 text-left">
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
                  <div className="text-zinc-500 text-sm font-mono mb-2 uppercase">Time</div>
                  <div className="text-3xl font-bold text-white">{Math.floor((Date.now() - startTime) / 60000)}m {Math.floor(((Date.now() - startTime) / 1000) % 60)}s</div>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
                  <div className="text-zinc-500 text-sm font-mono mb-2 uppercase">Sets</div>
                  <div className="text-3xl font-bold text-white">
                    {localExercises.reduce((acc, ex) => acc + (logs[ex.id]?.rpeRatings.length || 0), 0)}
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl mb-12 text-left">
                <div className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div> AI Coach Note
                </div>
                <p className="text-zinc-300 leading-relaxed">
                  Solid effort. You pushed through the difficult sets and maintained form. We'll adjust the load for next session based on your feedback.
                </p>
              </div>
              
              <Button 
                onClick={finishSession}
                className="w-full h-16 text-lg font-bold bg-[#39FF14] text-black hover:bg-[#32e011] rounded-xl"
              >
                Save & Exit
              </Button>
            </div>
          </MotionWrapper>
        )}
        
      </AnimatePresence>

      {/* SWAP BOTTOM SHEET */}
      <AnimatePresence>
        {isSwapOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/80 flex flex-col justify-end"
          >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="bg-zinc-950 w-full rounded-t-3xl border-t border-zinc-800 p-6 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">Swap Exercise</h3>
                <Button variant="ghost" size="icon" onClick={() => setIsSwapOpen(false)}>
                  <X className="w-6 h-6 text-zinc-400" />
                </Button>
              </div>

              {!swapReason && !swapLoading && swapAlternatives.length === 0 && (
                <div className="space-y-4">
                  <p className="text-zinc-400 mb-6">Why do you need to change this exercise?</p>
                  <Button variant="outline" className="w-full justify-start h-14 text-lg border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white" onClick={() => handleFetchSwap("no_equipment")}>
                    Missing Equipment
                  </Button>
                  <Button variant="outline" className="w-full justify-start h-14 text-lg border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white" onClick={() => handleFetchSwap("joint_pain")}>
                    Joint Pain / Discomfort
                  </Button>
                  <Button variant="outline" className="w-full justify-start h-14 text-lg border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white" onClick={() => handleFetchSwap("too_hard")}>
                    Too Difficult Right Now
                  </Button>
                  <Button variant="outline" className="w-full justify-start h-14 text-lg border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white" onClick={() => handleFetchSwap("dont_like")}>
                    I Just Hate It
                  </Button>
                </div>
              )}

              {swapLoading && (
                <div className="py-20 flex flex-col items-center justify-center text-zinc-400">
                  <RefreshCw className="w-10 h-10 animate-spin mb-6 text-[#39FF14]" />
                  <p className="text-lg">Analyzing alternatives...</p>
                </div>
              )}

              {!swapLoading && swapAlternatives.length > 0 && (
                <div className="space-y-4">
                  <p className="text-[#39FF14] font-medium mb-6">Found 3 alternatives that train the same muscles:</p>
                  {swapAlternatives.map((alt, idx) => (
                    <div key={idx} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="text-xl font-bold text-white">{alt.name}</h4>
                        <span className="text-zinc-500 font-mono text-sm">{alt.sets} × {alt.reps}</span>
                      </div>
                      <p className="text-zinc-400 text-sm mb-4 leading-relaxed">{alt.whyThisWorks}</p>
                      <Button 
                        onClick={() => handleConfirmSwap(alt)}
                        className="w-full bg-zinc-800 hover:bg-zinc-700 text-white"
                      >
                        Select this swap
                      </Button>
                    </div>
                  ))}
                  <Button variant="ghost" className="w-full text-zinc-500 mt-4" onClick={() => setSwapAlternatives([])}>
                    Back to reasons
                  </Button>
                </div>
              )}

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
