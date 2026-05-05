import { SignUp } from "@clerk/nextjs";
import { Zap } from "lucide-react";

export default function Page() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="grid-pattern absolute inset-0" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/6 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md flex flex-col items-center">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-heading font-bold text-white text-lg">HumanStack</span>
        </div>

        {/* Clerk sign-up */}
        <SignUp
          path="/sign-up"
          routing="path"
          signInUrl="/sign-in"
          forceRedirectUrl="/create-routine"
        />
      </div>
    </div>
  );
}
