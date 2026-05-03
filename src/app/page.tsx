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
                <Link href="/sign-in" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                  Log in
                </Link>
                <Link 
                  href="/sign-up" 
                  className="text-sm font-medium bg-white text-black px-4 py-2 rounded-full hover:bg-zinc-200 transition-colors"
                >
                  Get Started
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
                href={userId ? "/dashboard" : "/sign-up"} 
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-black px-8 py-4 rounded-full font-medium hover:scale-105 transition-transform duration-200"
              >
                Initialize Protocol
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

      {/* BENTO BOX FEATURES SECTION */}
      <section id="architecture" className="py-24 bg-[#09090b] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">The Stack</h2>
            <p className="text-zinc-400 max-w-xl">Every component of the protocol is generated specifically to prevent injury and force adaptation.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Box 1 */}
            <div className="col-span-1 md:col-span-2 bg-gradient-to-b from-white/5 to-transparent border border-white/10 p-8 rounded-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-100 transition-opacity">
                <Brain className="w-32 h-32 text-white/20" />
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 border border-white/10">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">Hyper-Personalized AI</h3>
                <p className="text-zinc-400 max-w-md leading-relaxed">
                  Your protocol isn't a template. The AI ingests your posture deficits and creates targeted corrective exercises directly into your warm-up and primary lifts.
                </p>
              </div>
            </div>

            {/* Box 2 */}
            <div className="col-span-1 bg-gradient-to-b from-white/5 to-transparent border border-white/10 p-8 rounded-3xl">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 border border-white/10">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Clinical Precision</h3>
              <p className="text-zinc-400 leading-relaxed text-sm">
                Prioritizing joint longevity over ego lifting. If you select rounded shoulders, expect face pulls and Y-raises.
              </p>
            </div>

          </div>
        </div>
      </section>

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
