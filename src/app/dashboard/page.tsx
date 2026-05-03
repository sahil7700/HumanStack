import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  // 1. Secure the page and get the user
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({ where: { clerkId } });
  if (!dbUser) redirect("/onboarding");

  // 2. Fetch the active workout plan with all nested relations
  const activePlan = await prisma.workoutPlan.findFirst({
    where: { 
      userId: dbUser.id,
      active: true 
    },
    include: {
      sessions: {
        orderBy: { scheduledFor: 'asc' },
        include: {
          exercises: {
            orderBy: { order: 'asc' },
            include: {
              exercise: true,
              sets: {
                orderBy: { setNumber: 'asc' }
              }
            }
          }
        }
      }
    }
  });

  // If no plan exists, redirect them to create one
  if (!activePlan || activePlan.sessions.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
        <h1 className="text-xl font-medium text-zinc-100 mb-6">No Active Protocol Found</h1>
        <a href="/onboarding" className="px-6 py-2 bg-white text-black font-medium text-sm rounded-md hover:bg-zinc-200 transition-colors">
          Initialize Plan
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-32">
      
      {/* MINIMAL NAV */}
      <nav className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900 px-6 py-4 flex justify-between items-center">
        <div className="font-semibold tracking-tight text-zinc-100">HumanStack</div>
        <div className="text-zinc-500 text-sm">Dashboard</div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 md:px-8 pt-16 md:pt-24">
        
        {/* REFINED HERO */}
        <header className="mb-20">
          <p className="text-zinc-500 text-sm mb-3">Active Protocol</p>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4 text-zinc-100">
            {activePlan.title}
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl leading-relaxed">
            Engineered for <span className="text-zinc-200 font-medium">{activePlan.focus}</span>.
          </p>
          
          <div className="flex gap-8 mt-8 pt-8 border-t border-zinc-900">
            <div>
              <div className="text-2xl font-semibold text-zinc-100">{activePlan.sessions.length}</div>
              <div className="text-zinc-500 text-xs mt-1">Training Days</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-zinc-100">Phase 1</div>
              <div className="text-zinc-500 text-xs mt-1">Current Block</div>
            </div>
          </div>
        </header>

        {/* SECTION 1: WEEKLY OVERVIEW */}
        <section className="mb-20">
          <h2 className="text-lg font-medium text-zinc-100 mb-6">Weekly Structure</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activePlan.sessions.map((session, i) => (
              <div key={`overview-${session.id}`} className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-5">
                <div className="text-xs text-zinc-500 mb-2">Day {i + 1}</div>
                <div className="font-medium text-zinc-200 mb-1">{session.name}</div>
                <div className="text-sm text-zinc-500">{session.exercises.length} Exercises</div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 2: DAILY PROTOCOLS */}
        <section>
          <h2 className="text-lg font-medium text-zinc-100 mb-6">Daily Protocols</h2>
          
          <div className="space-y-4">
            {activePlan.sessions.map((session, i) => (
              <details 
                key={session.id} 
                className="group bg-zinc-900/30 border border-zinc-800/80 rounded-lg overflow-hidden transition-all open:bg-zinc-900/50 open:border-zinc-700" 
                open={i === 0}
              >
                <summary className="flex items-center justify-between p-5 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden">
                  <div className="flex items-center gap-4">
                    <span className="text-zinc-500 text-sm w-12">Day {i + 1}</span>
                    <span className="font-medium text-zinc-200 text-lg">{session.name}</span>
                  </div>
                  <svg className="w-5 h-5 text-zinc-500 group-open:rotate-180 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                
                <div className="px-5 pb-5 pt-2">
                  <div className="space-y-6">
                    {session.exercises.map((workoutEx) => (
                      <div key={workoutEx.id} className="pt-4 border-t border-zinc-800/50 first:border-0 first:pt-0">
                        
                        <div className="flex flex-col md:flex-row md:items-baseline justify-between mb-3 gap-2">
                          <div>
                            <div className="text-zinc-200 font-medium">{workoutEx.exercise.name}</div>
                            <div className="text-xs text-zinc-500 mt-0.5">{workoutEx.exercise.targetMuscle}</div>
                          </div>
                          <div className="text-zinc-400 text-sm bg-zinc-800/50 px-3 py-1 rounded-full w-fit">
                            {workoutEx.sets.length} Sets × {workoutEx.sets[0]?.targetReps || "Failure"}
                          </div>
                        </div>

                        {workoutEx.notes && (
                          <div className="bg-zinc-950/50 border border-zinc-800/50 rounded p-3 mt-3">
                            <span className="text-xs font-medium text-zinc-400 block mb-1">Coach Note</span>
                            <p className="text-sm text-zinc-400 leading-relaxed">{workoutEx.notes}</p>
                          </div>
                        )}
                        
                      </div>
                    ))}
                  </div>
                </div>
              </details>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
