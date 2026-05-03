"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Checkpoint, GoalWeights, CheckpointOutcome } from '@/lib/adaptiveLogic';

interface CheckpointReviewProps {
  checkpoint: Checkpoint;
  totalCheckpoints: number;
  checkpointIndex: number; // 1-indexed
  onKeepPlan: () => void;
  onApplyNewGoal: (weights: GoalWeights, reason: string) => void;
}

const balanceWeights = (changedKey: keyof GoalWeights, newValue: number, currentWeights: GoalWeights): GoalWeights => {
  const others = (Object.keys(currentWeights) as Array<keyof GoalWeights>).filter(k => k !== changedKey);
  
  let clampedValue = Math.min(100, Math.max(0, newValue));
  
  const newWeights = { ...currentWeights, [changedKey]: clampedValue };
  const othersSum = others.reduce((acc, k) => acc + currentWeights[k], 0);

  if (othersSum === 0) {
    const toDistribute = (100 - clampedValue) / others.length;
    others.forEach(k => { newWeights[k] = Math.round(toDistribute); });
  } else {
    const ratio = (100 - clampedValue) / othersSum;
    others.forEach(k => {
      newWeights[k] = Math.max(0, Math.round(currentWeights[k] * ratio));
    });
  }

  // Handle rounding errors
  const total = Object.values(newWeights).reduce((a, b) => a + b, 0);
  if (total !== 100) {
    const error = 100 - total;
    let largestKey = others[0];
    for (const k of others) {
      if (newWeights[k] > newWeights[largestKey]) largestKey = k;
    }
    newWeights[largestKey] += error;
  }

  return newWeights;
};

export function CheckpointReview({
  checkpoint,
  totalCheckpoints,
  checkpointIndex,
  onKeepPlan,
  onApplyNewGoal
}: CheckpointReviewProps) {
  const [weights, setWeights] = useState<GoalWeights>(checkpoint.userGoalWeights);
  const [reason, setReason] = useState("");
  const [previewText, setPreviewText] = useState<string[]>([]);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const previewTimer = useRef<NodeJS.Timeout | null>(null);

  const handleSliderChange = (key: keyof GoalWeights, e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    const balanced = balanceWeights(key, val, weights);
    setWeights(balanced);
  };

  useEffect(() => {
    // Debounced Preview Fetch
    if (previewTimer.current) clearTimeout(previewTimer.current);
    
    // Only fetch if weights have actually changed significantly from checkpoint
    const hasChanged = JSON.stringify(weights) !== JSON.stringify(checkpoint.userGoalWeights);
    if (!hasChanged) {
      setPreviewText([]);
      return;
    }

    setIsPreviewLoading(true);
    previewTimer.current = setTimeout(async () => {
      try {
        // Mock fetch to an AI endpoint
        // const res = await fetch("/api/plan/preview", { method: "POST", body: JSON.stringify({ weights }) });
        // const data = await res.json();
        
        // Mocked response for UI showcase
        const lines = [];
        if (weights.strength > 40) lines.push("Increased frequency of heavy compound lifts.");
        if (weights.endurance > 40) lines.push("Added more high-volume conditioning days.");
        if (weights.mobility > 30) lines.push("Dedicated active recovery and stretching days integrated.");
        if (weights.fatLoss > 30) lines.push("Shortened rest periods and introduced metabolic circuits.");
        
        if (lines.length === 0) lines.push("A balanced mix of all training modalities.");

        setPreviewText(lines);
      } catch (e) {
        console.error(e);
      } finally {
        setIsPreviewLoading(false);
      }
    }, 500);

    return () => {
      if (previewTimer.current) clearTimeout(previewTimer.current);
    };
  }, [weights, checkpoint.userGoalWeights]);

  const completionPercent = Math.round(checkpoint.actualCompletionRate * 100);
  const badgeColor = completionPercent >= 80 ? 'text-[#39FF14] border-[#39FF14]/30 bg-[#39FF14]/10' : 
                     completionPercent >= 50 ? 'text-amber-500 border-amber-500/30 bg-amber-500/10' : 
                     'text-red-500 border-red-500/30 bg-red-500/10';

  const isTotal100 = Object.values(weights).reduce((a, b) => a + b, 0) === 100;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F0F0F0] font-sans p-6 md:p-12 pb-32">
      <div className="max-w-3xl mx-auto space-y-12">
        
        {/* HEADER */}
        <div className="space-y-4">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
            Checkpoint {checkpointIndex} of {totalCheckpoints} — Week {checkpoint.week}
          </h1>
          <div className={"inline-flex items-center px-4 py-2 rounded-none border text-sm font-mono " + badgeColor}>
            You completed {completionPercent}% of sessions
          </div>
        </div>

        {/* OUTCOME REVIEW */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-zinc-900 border-l-4 border-zinc-700 p-6 space-y-4">
            <h3 className="text-zinc-500 font-bold uppercase tracking-widest text-xs">What we projected</h3>
            <ul className="space-y-3">
              {checkpoint.projectedOutcomes.map((outcome, i) => (
                <li key={i} className="flex flex-col">
                  <span className="text-white font-medium">{outcome.label}</span>
                  <span className="text-zinc-400 font-mono text-sm">{outcome.metric}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-zinc-900 border-l-4 border-[#39FF14] p-6 space-y-4">
            <h3 className="text-zinc-500 font-bold uppercase tracking-widest text-xs">What you actually did</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-3xl font-mono font-bold text-white">{completionPercent}%</div>
                <div className="text-zinc-500 text-xs uppercase tracking-wider mt-1">Completion</div>
              </div>
              <div>
                <div className="text-3xl font-mono font-bold text-white">7.5</div>
                <div className="text-zinc-500 text-xs uppercase tracking-wider mt-1">Avg RPE</div>
              </div>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed pt-2 border-t border-zinc-800">
              {completionPercent >= 80 
                ? "Excellent consistency. You're adapting well to the current volume." 
                : "You missed a few sessions. Consider shifting focus to mobility if recovery is an issue."}
            </p>
          </div>
        </div>

        {/* GOAL MIXER */}
        <div className="bg-zinc-950 border border-zinc-800 p-6 md:p-8 space-y-8">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-white tracking-tight">Adjust your goals for the next phase</h2>
            <p className="text-zinc-500 text-sm">Move one slider, and the rest will automatically rebalance.</p>
          </div>

          <div className="space-y-6">
            {(Object.keys(weights) as Array<keyof GoalWeights>).map(key => (
              <div key={key} className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold uppercase tracking-wider text-zinc-300 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</label>
                  <span className="font-mono text-[#39FF14]">{weights[key]}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={weights[key]}
                  onChange={(e) => handleSliderChange(key, e)}
                  className="w-full h-2 bg-zinc-800 appearance-none outline-none accent-[#39FF14] cursor-pointer"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-zinc-800">
            <span className="text-zinc-500 text-sm font-bold uppercase tracking-wider">Total</span>
            <span className={"font-mono text-lg " + (isTotal100 ? 'text-[#39FF14]' : 'text-red-500')}>
              {Object.values(weights).reduce((a, b) => a + b, 0)}%
            </span>
          </div>
        </div>

        {/* LIVE PREVIEW */}
        <div className="min-h-[100px]">
          {isPreviewLoading && <div className="text-zinc-500 font-mono animate-pulse">Analyzing new mix...</div>}
          
          {!isPreviewLoading && previewText.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="bg-zinc-900/50 border border-[#39FF14]/20 p-6 rounded-none space-y-4"
            >
              <h4 className="text-[#39FF14] font-medium">Based on your new mix, the next 3 weeks will:</h4>
              <ul className="space-y-2">
                {previewText.map((line, i) => (
                  <li key={i} className="flex gap-3 text-zinc-300">
                    <span className="text-[#39FF14] mt-1">↳</span>
                    {line}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </div>

        {/* REASON INPUT */}
        <div className="space-y-2">
          <label className="text-sm font-bold uppercase tracking-wider text-zinc-500">Why are you adjusting? (optional)</label>
          <textarea 
            value={reason}
            onChange={(e) => setReason(e.target.value.slice(0, 280))}
            placeholder="e.g. My knee has been feeling better so I want to push strength more..."
            className="w-full h-24 bg-zinc-900 border border-zinc-800 rounded-none p-4 text-white focus:outline-none focus:border-[#39FF14] transition-colors resize-none"
          />
          <div className="text-right text-xs font-mono text-zinc-600">{reason.length}/280</div>
        </div>

        {/* CTA ROW */}
        <div className="flex flex-col sm:flex-row gap-4 pt-8">
          <Button 
            variant="outline" 
            onClick={onKeepPlan}
            className="flex-1 h-14 rounded-none border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800"
          >
            Keep current plan
          </Button>
          <Button 
            onClick={() => onApplyNewGoal(weights, reason)}
            disabled={!isTotal100}
            className="flex-1 h-14 rounded-none bg-[#39FF14] text-black hover:bg-[#32e011] font-bold shadow-[0_0_20px_rgba(57,255,20,0.2)] disabled:opacity-50 disabled:shadow-none"
          >
            Apply new goal
          </Button>
        </div>

      </div>
    </div>
  );
}
