"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

export function InteractiveDemo() {
  const [goal, setGoal] = useState("Get stronger");
  const [timeframe, setTimeframe] = useState("12 weeks");
  const [equipment, setEquipment] = useState("Bodyweight only");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [loadingMessage, setLoadingMessage] = useState("Analyzing your goal...");

  const generateDemo = async () => {
    setLoading(true);
    setResult(null);

    const messages = [
      "Analyzing your goal...",
      "Designing your first session...",
      "Calculating the right intensity..."
    ];
    
    let msgIndex = 0;
    const interval = setInterval(() => {
      msgIndex = (msgIndex + 1) % messages.length;
      setLoadingMessage(messages[msgIndex]);
    }, 1000);

    try {
      const res = await fetch("/api/demo/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal, timeframe, equipment })
      });
      const data = await res.json();
      
      // Artificial delay to ensure "feel matters" as per prompt
      setTimeout(() => {
        clearInterval(interval);
        setResult(data);
        setLoading(false);
      }, 2500);
      
    } catch (e) {
      clearInterval(interval);
      setLoading(false);
      console.error(e);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-12 px-4 sm:px-6">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 md:p-10 shadow-2xl">
        <h2 className="text-3xl font-bold text-white mb-8">Try It Free</h2>
        
        {!result && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex flex-col md:flex-row items-center gap-4 text-xl">
              <span className="text-zinc-400 whitespace-nowrap">I want to</span>
              <select 
                value={goal} 
                onChange={e => setGoal(e.target.value)}
                className="w-full md:w-auto bg-zinc-900 border border-zinc-700 text-white p-3 rounded-md focus:border-[#39FF14] focus:ring-1 focus:ring-[#39FF14] outline-none"
              >
                <option>Get stronger</option>
                <option>Build endurance</option>
                <option>Lose fat</option>
                <option>Move better</option>
              </select>
              
              <span className="text-zinc-400 whitespace-nowrap">in</span>
              <select 
                value={timeframe} 
                onChange={e => setTimeframe(e.target.value)}
                className="w-full md:w-auto bg-zinc-900 border border-zinc-700 text-white p-3 rounded-md focus:border-[#39FF14] focus:ring-1 focus:ring-[#39FF14] outline-none"
              >
                <option>6 weeks</option>
                <option>8 weeks</option>
                <option>12 weeks</option>
                <option>16 weeks</option>
              </select>
              
              <span className="text-zinc-400 whitespace-nowrap">using</span>
              <select 
                value={equipment} 
                onChange={e => setEquipment(e.target.value)}
                className="w-full md:w-auto bg-zinc-900 border border-zinc-700 text-white p-3 rounded-md focus:border-[#39FF14] focus:ring-1 focus:ring-[#39FF14] outline-none"
              >
                <option>Bodyweight only</option>
                <option>Home gym</option>
                <option>Full gym</option>
              </select>
            </div>

            <Button 
              onClick={generateDemo}
              className="w-full h-16 text-lg font-bold bg-[#39FF14] text-black hover:bg-[#32e011] mt-8 flex gap-2 rounded-xl"
            >
              Generate My Day 1 Plan <ArrowRight className="w-5 h-5" />
            </Button>
          </motion.div>
        )}

        {loading && (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-6">
            <Loader2 className="w-12 h-12 text-[#39FF14] animate-spin" />
            <motion.p 
              key={loadingMessage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-2xl font-medium text-white"
            >
              {loadingMessage}
            </motion.p>
            <div className="w-64 h-2 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-[#39FF14]"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2.5, ease: "easeInOut" }}
              />
            </div>
          </div>
        )}

        {result && !loading && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
            <div className="bg-[#0A0A0A] border border-zinc-800 rounded-2xl p-6 md:p-8">
              <div className="flex justify-between items-start mb-6 border-b border-zinc-800/50 pb-6">
                <div>
                  <div className="text-[#39FF14] font-mono text-xs font-bold uppercase tracking-widest mb-2">Day 1 Preview</div>
                  <h3 className="text-3xl font-bold text-white">{result.sessionName}</h3>
                  <p className="text-zinc-500 mt-1">{result.focus} • {result.durationMinutes} min</p>
                </div>
              </div>
              
              <div className="space-y-4 mb-8">
                {result.exercises.map((ex: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-sm text-zinc-400 font-mono">{idx + 1}</div>
                      <div>
                        <div className="font-medium text-white">{ex.name}</div>
                        <div className="text-xs text-zinc-500 uppercase tracking-wider">{ex.muscleTarget}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-[#39FF14]">{ex.sets} × {ex.reps}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="bg-zinc-900 border-l-2 border-[#39FF14] p-4 rounded-r-xl">
                <div className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#39FF14]" /> AI Coach Note
                </div>
                <p className="text-zinc-300 italic">"{result.coachNote}"</p>
              </div>
            </div>
            
            <div className="text-center space-y-4">
              <p className="text-zinc-500 text-sm">The full plan includes 12 weeks of customized sessions like this, adjusting to your feedback every set.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                <Button className="h-14 px-8 text-lg font-bold bg-[#39FF14] text-black hover:bg-[#32e011] rounded-xl shadow-[0_0_20px_rgba(57,255,20,0.2)]">
                  Get Your Full 12-Week Plan — Free
                </Button>
                <Button variant="ghost" onClick={() => setResult(null)} className="h-14 px-8 text-zinc-400 hover:text-white">
                  See another example
                </Button>
              </div>
            </div>
          </motion.div>
        )}
        
      </div>
    </div>
  );
}
