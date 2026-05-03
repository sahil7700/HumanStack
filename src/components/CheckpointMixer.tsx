"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, SlidersHorizontal, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function CheckpointMixer({ plan }: { plan?: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [weights, setWeights] = useState({ strength: 5, endurance: 3, hypertrophy: 4, mobility: 6 });
  const [insight, setInsight] = useState<string>("Adjust the sliders to recalculate your next phase parameters.");
  const [loading, setLoading] = useState(false);

  const handleSliderChange = (key: keyof typeof weights, value: number) => {
    setWeights(prev => ({ ...prev, [key]: value }));
  };

  const getPercentage = (val: number) => {
    const total = Object.values(weights).reduce((a, b) => a + b, 0);
    return total === 0 ? 0 : Math.round((val / total) * 100);
  };

  const generateInsight = async () => {
    setLoading(true);
    setTimeout(() => {
      const topFocus = Object.entries(weights).sort((a, b) => b[1] - a[1])[0][0];
      setInsight(`Your next checkpoint will heavily bias towards ${topFocus}. We will adjust your total volume and introduce specific accessory movements to support this new vector.`);
      setLoading(false);
    }, 1500);
  };

  return (
    <>
      <Button 
        variant="outline" 
        onClick={() => setIsOpen(true)}
        className="w-full mt-6 bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 h-12 rounded-xl flex items-center justify-center gap-2"
      >
        <SlidersHorizontal className="w-4 h-4" /> Goal Calibration Mixer
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl p-8"
            >
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-3xl font-bold text-white mb-2">Phase Calibration</h3>
                  <p className="text-zinc-400">Shift your adaptive focus for the upcoming checkpoint.</p>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white p-2">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-8 mb-8">
                {(Object.keys(weights) as Array<keyof typeof weights>).map((key) => (
                  <div key={key}>
                    <div className="flex justify-between text-sm font-bold uppercase tracking-wider mb-3">
                      <span className="text-white">{key}</span>
                      <span className="text-[#39FF14]">{getPercentage(weights[key])}%</span>
                    </div>
                    <input 
                      type="range" min="1" max="10" step="1"
                      value={weights[key]}
                      onChange={(e) => handleSliderChange(key, parseInt(e.target.value))}
                      className="w-full accent-[#39FF14] cursor-pointer"
                    />
                  </div>
                ))}
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#39FF14]"></div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">AI Prediction Model</h4>
                {loading ? (
                  <div className="flex items-center gap-3 text-zinc-400">
                    <RefreshCw className="w-5 h-5 animate-spin text-[#39FF14]" /> Running simulations...
                  </div>
                ) : (
                  <p className="text-zinc-300 leading-relaxed">{insight}</p>
                )}
              </div>

              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  onClick={generateInsight}
                  className="flex-1 h-14 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-900 rounded-xl"
                >
                  Analyze Shift
                </Button>
                <Button 
                  onClick={() => setIsOpen(false)}
                  className="flex-1 h-14 font-bold bg-[#39FF14] text-black hover:bg-[#32e011] shadow-[0_0_20px_rgba(57,255,20,0.2)] rounded-xl"
                >
                  Commit Vector
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
