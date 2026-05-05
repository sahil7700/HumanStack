import { auth } from "@clerk/nextjs/server";
import { NavBar } from "@/components/landing/NavBar";
import { HeroSection } from "@/components/landing/HeroSection";
import { BentoGrid } from "@/components/landing/BentoGrid";
import { CtaSection } from "@/components/landing/CtaSection";

export const metadata = {
  title: "HumanStack — Clinical-Grade AI Fitness",
  description:
    "An AI system that analyzes your biology, goals, and constraints to build clinical-grade fitness protocols — personalized for you, updated with you.",
};

export default async function Home() {
  const { userId } = await auth();
  const isSignedIn = !!userId;

  return (
    <div
      className="min-h-screen text-white overflow-x-hidden"
      style={{ background: "#050505" }}
    >
      {/* ── Static background layers ───────────────────────────
          Grid + radial blobs — GPU composited, no layout shifts */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden>
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-100"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
            `,
            backgroundSize: "48px 48px",
          }}
        />
        {/* Static atmospheric glows (mouse glow overlaid in HeroSection) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-blue-600/6 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[400px] bg-blue-500/4 rounded-full blur-[120px]" />
      </div>

      {/* ── Page chrome ─────────────────────────────────────── */}
      <div className="relative z-10">
        <NavBar isSignedIn={isSignedIn} />
        <HeroSection isSignedIn={isSignedIn} />
        <BentoGrid />
        <CtaSection isSignedIn={isSignedIn} />
      </div>
    </div>
  );
}
