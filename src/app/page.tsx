import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { ArrowRight, Activity, Brain, Shield, ChevronRight } from "lucide-react";

export default async function Home() {
  // We won't redirect immediately so you can actually admire and edit your landing page!
  const { userId } = await auth();

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-zinc-800 selection:text-white">
      
      {/* NAVIGATION */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#09090b]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-black rounded-full" />
            </div>
            <span className="font-semibold tracking-tight text-lg">HumanStack</span>
          </div>
          
          <div className="flex items-center gap-6">
            {userId ? (
              <Link 
                href="/dashboard" 
                className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link href="/sign-in" className="text-sm font-medium bg-white text-black px-6 py-2 rounded-full hover:bg-zinc-200 transition-colors">
                  Enter System
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <main className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[500px] opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent blur-3xl rounded-full mix-blend-screen" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col items-center text-center">
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-zinc-300 mb-8">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Local AI Engine Active
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter mb-6">
              Engineering the <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">
                Apex Human.
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mb-10 leading-relaxed">
              Stop guessing. We analyze your posture, constraints, and goals to generate clinical-grade, hyper-optimized fitness protocols using local artificial intelligence.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link 
                href="/sign-in" 
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#39FF14] text-black px-8 py-4 rounded-full font-bold hover:scale-105 transition-transform duration-200 shadow-[0_0_20px_rgba(57,255,20,0.2)]"
              >
                Access System
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a 
                href="#architecture" 
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-full font-medium text-white border border-white/10 hover:bg-white/5 transition-colors"
              >
                View Architecture
              </a>
            </div>

          </div>
        </div>
      </main>

      {/* MINIMAL FOOTER */}
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-50">
            <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
              <div className="w-1 h-1 bg-black rounded-full" />
            </div>
            <span className="font-medium text-sm tracking-tight">HumanStack</span>
          </div>
          <div className="text-sm text-zinc-500">
            © {new Date().getFullYear()} HumanStack Systems.
          </div>
        </div>
      </footer>

    </div>
  );
}
