"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function SignInPage() {
  const router = useRouter();
  const [data, setData] = useState({ name: '', age: '', weight: '' });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      
      if (result.success) {
        localStorage.setItem('humanstack_user_id', result.userId);
        localStorage.setItem('humanstack_user', JSON.stringify(data));
        if (result.plan) {
          localStorage.setItem('humanstack_plan', JSON.stringify(result.plan));
        } else {
          localStorage.removeItem('humanstack_plan'); // Ensure clean state if no plan
        }
        router.push('/dashboard');
      } else {
        alert('Failed to initialize account: ' + result.error);
        setLoading(false);
      }
    } catch (err) {
      alert('Network error during initialization');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] p-4 font-sans text-white">
      <div className="w-full max-w-md bg-zinc-950/60 backdrop-blur-xl border border-zinc-800/50 p-8 rounded-2xl shadow-2xl">
        <h1 className="text-3xl font-bold mb-2">Initialize Account</h1>
        <p className="text-zinc-500 mb-8 text-sm">Enter basic biological parameters to enter the system.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-zinc-400 mb-2">Name</label>
            <input 
              required
              type="text" 
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14] transition-colors"
              value={data.name}
              onChange={(e) => setData({...data, name: e.target.value})}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-zinc-400 mb-2">Age</label>
              <input 
                required
                type="number" 
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14] transition-colors"
                value={data.age}
                onChange={(e) => setData({...data, age: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-zinc-400 mb-2">Weight (kg)</label>
              <input 
                required
                type="number" 
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14] transition-colors"
                value={data.weight}
                onChange={(e) => setData({...data, weight: e.target.value})}
              />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full h-14 bg-[#39FF14] text-black hover:bg-[#32e011] font-bold text-lg rounded-xl mt-4 disabled:opacity-50">
            {loading ? 'Initializing...' : 'Enter Control Panel'} <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </form>
      </div>
    </div>
  );
}
