"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, GripVertical, CheckCircle2, AlertTriangle, BatteryCharging, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type CalendarDay = {
  date: Date;
  status: 'COMPLETED' | 'MISSED' | 'SCHEDULED' | 'RECOVERY' | 'REST' | 'CHECKPOINT';
  title?: string;
  focus?: string;
};

export function DynamicCalendar({ plan }: { plan?: any }) {
  const [days, setDays] = useState<CalendarDay[]>([]);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  React.useEffect(() => {
    const today = new Date();
    if (plan && plan.weeks && plan.weeks[0]) {
      const week1 = plan.weeks[0].days;
      const initialDays: CalendarDay[] = week1.map((d: any, i: number) => {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        let status: CalendarDay['status'] = 'SCHEDULED';
        if (d.isRestDay) status = 'REST';
        return {
          date,
          status,
          title: d.isRestDay ? 'Rest Day' : `Day ${d.dayNumber}`,
          focus: d.focus
        };
      });
      // Just ensure we have exactly 7 days
      while (initialDays.length < 7) {
        const date = new Date(today);
        date.setDate(today.getDate() + initialDays.length);
        initialDays.push({ date, status: 'REST', title: 'Rest Day', focus: 'Recovery' });
      }
      setDays(initialDays.slice(0, 7));
    } else {
       // fallback fresh start
       const mockWeek: CalendarDay[] = Array.from({ length: 7 }).map((_, i) => {
          const date = new Date(today);
          date.setDate(today.getDate() + i);
          return {
             date,
             status: i % 2 === 0 ? 'SCHEDULED' : 'REST',
             title: i % 2 === 0 ? `Day ${i+1}` : 'Rest Day',
             focus: i % 2 === 0 ? 'Full Body' : 'Recovery'
          };
       });
       setDays(mockWeek);
    }
  }, [plan]);

  const getStatusColor = (status: CalendarDay['status']) => {
    switch (status) {
      case 'COMPLETED': return 'bg-zinc-800 border-green-500/50 text-white';
      case 'MISSED': return 'bg-red-500/10 border-red-500/30 text-white';
      case 'SCHEDULED': return 'bg-zinc-900 border-[#39FF14] text-[#39FF14] shadow-[0_0_15px_rgba(57,255,20,0.1)]';
      case 'RECOVERY': return 'bg-zinc-900 border-[#00D9FF] text-[#00D9FF]';
      case 'CHECKPOINT': return 'bg-purple-500/10 border-purple-500 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]';
      case 'REST': return 'bg-zinc-950 border-zinc-800 text-zinc-600';
    }
  };

  const getStatusIcon = (status: CalendarDay['status']) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'MISSED': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'SCHEDULED': return <Flame className="w-4 h-4 text-[#39FF14]" />;
      case 'RECOVERY': return <BatteryCharging className="w-4 h-4 text-[#00D9FF]" />;
      case 'CHECKPOINT': return <CheckCircle2 className="w-4 h-4 text-purple-400" />;
      case 'REST': return null;
    }
  };

  const handleDragStart = (idx: number) => {
    if (days[idx].status === 'COMPLETED') return;
    setDraggedIdx(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === targetIdx) return;
    
    // Simple reschedule rule: swap the target and the dragged item
    const newDays = [...days];
    const temp = newDays[draggedIdx];
    newDays[draggedIdx] = newDays[targetIdx];
    newDays[targetIdx] = temp;
    
    const today = new Date();
    // Ensure dates remain correct for the index
    newDays.forEach((day, i) => {
      const newDate = new Date(today);
      newDate.setDate(today.getDate() + i);
      day.date = newDate;
    });

    setDays(newDays);
    setDraggedIdx(null);
  };

  return (
    <div className="bg-[#0A0A0A] border border-zinc-800 rounded-2xl p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight">Training Calendar</h3>
          <p className="text-zinc-500 text-sm">Drag to reschedule sessions.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8 bg-zinc-900 border-zinc-800 text-zinc-400">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8 bg-zinc-900 border-zinc-800 text-zinc-400">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
        <AnimatePresence>
          {days.map((day, idx) => (
            <motion.div
              key={idx}
              layout
              draggable={day.status !== 'COMPLETED' && day.status !== 'REST'}
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDrop={(e) => handleDrop(e, idx)}
              className={`relative flex flex-col p-4 rounded-xl border transition-colors ${getStatusColor(day.status)} ${draggedIdx === idx ? 'opacity-50' : ''}`}
            >
              {day.status !== 'COMPLETED' && day.status !== 'REST' && (
                <div className="absolute top-2 right-2 cursor-grab text-zinc-500 opacity-50 hover:opacity-100">
                  <GripVertical className="w-4 h-4" />
                </div>
              )}
              
              <div className="text-xs font-mono uppercase tracking-wider mb-2 opacity-70">
                {day.date.toLocaleDateString('en-US', { weekday: 'short' })} {day.date.getDate()}
              </div>
              
              <div className="flex items-center gap-2 mb-1">
                {getStatusIcon(day.status)}
                <span className="font-bold text-sm leading-none">{day.status}</span>
              </div>
              
              {day.title && (
                <div className="mt-2">
                  <div className="text-sm font-semibold truncate text-white">{day.title}</div>
                  <div className="text-xs opacity-70 truncate">{day.focus}</div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
