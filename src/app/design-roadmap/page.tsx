"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const onboardingSchema = z.object({
  goal: z.string().min(1, "Select a goal"),
  timeframe: z.string().min(1, "Select a timeframe"),
  experience: z.string().min(1, "Select your experience"),
  equipment: z.array(z.string()).min(1, "Select at least one equipment option"),
  daysPerWeek: z.coerce.number().min(2).max(6),
  timePreference: z.string().min(1, "Select time preference"),
  constraints: z.array(z.string()).min(1, "Select any constraints or 'None'"),
  physiqueGoal: z.string(),
  lifestyle: z.object({
    deskHours: z.coerce.number().min(0).max(24),
    sleepQuality: z.string(),
    stressLevel: z.string(),
  }),
  psychology: z.object({
    motivation: z.string(),
    pastStruggle: z.string(),
  }),
  calibration: z.object({
    pushups: z.coerce.number(),
    squatComfort: z.coerce.number().min(1).max(5),
    plankSeconds: z.coerce.number(),
    balanceSeconds: z.coerce.number(),
    hingeComfort: z.coerce.number().min(1).max(5),
  }),
});

type OnboardingValues = z.infer<typeof onboardingSchema>;

const GOAL_OPTIONS = ["Get stronger", "Build endurance", "Lose fat", "Move better", "All of the above (balanced)"];
const TIMEFRAME_OPTIONS = ["6 weeks", "8 weeks", "12 weeks", "16 weeks"];
const EXPERIENCE_OPTIONS = [
  "Never trained consistently",
  "Trained before, currently inactive (6+ months off)",
  "Train occasionally (1-2x/week)",
  "Train regularly (3+ times/week)"
];
const EQUIPMENT_OPTIONS = ["Bodyweight only", "Resistance bands", "Dumbbells", "Barbell + rack", "Machines", "Full commercial gym"];
const TIME_PREF_OPTIONS = ["Morning", "Evening"];
const CONSTRAINT_OPTIONS = ["Lower back", "Knees", "Shoulders", "Hips", "Wrists", "None"];

const PHYSIQUE_OPTIONS = ["Athletic", "Lean aesthetic", "Muscular", "Functional", "Hybrid athlete", "Slim", "Powerful", "Flexible/mobility-focused"];
const SLEEP_OPTIONS = ["Poor (< 5 hours)", "Average (6-7 hours)", "Good (8+ hours)"];
const STRESS_OPTIONS = ["Low", "Moderate", "High", "Overwhelming"];
const STRUGGLE_OPTIONS = ["Consistency", "Motivation", "Injuries", "Lack of knowledge", "Time constraints", "Boredom"];

export default function OnboardingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [step, setStep] = React.useState(1);
  const totalSteps = 15;

  // Timer state for Plank
  const [timerActive, setTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive) {
      interval = setInterval(() => {
        setTimerSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  const form = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema) as any,
    defaultValues: {
      goal: "",
      timeframe: "",
      experience: "",
      equipment: [],
      daysPerWeek: 3,
      timePreference: "",
      constraints: [],
      physiqueGoal: "",
      lifestyle: {
        deskHours: 6,
        sleepQuality: "",
        stressLevel: ""
      },
      psychology: {
        motivation: "",
        pastStruggle: ""
      },
      calibration: {
        pushups: 0,
        squatComfort: 3,
        plankSeconds: 0,
        balanceSeconds: 0,
        hingeComfort: 3,
      }
    },
  });

  const { watch, setValue, getValues } = form;

  const toggleArray = (field: any, value: string) => {
    const current = getValues(field) as string[];
    if (value === "None" && field === "constraints") {
      setValue(field, ["None"]);
      return;
    }
    let newArr = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    if (field === "constraints" && newArr.includes("None") && value !== "None") {
      newArr = newArr.filter(v => v !== "None");
    }
    setValue(field, newArr);
  };

  const nextStep = () => {
    if (step === 13 && timerSeconds > 0) {
      setValue("calibration.plankSeconds", timerSeconds);
    }
    setStep((s) => Math.min(s + 1, totalSteps));
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  async function onSubmit(data: any) {
    setIsLoading(true);
    try {
      // Compute UserProfile based on Calibration
      const pushups = data.calibration.pushups;
      let strengthTier = "beginner";
      if (pushups >= 15) strengthTier = "advanced";
      else if (pushups >= 5) strengthTier = "intermediate";

      const plank = data.calibration.plankSeconds;
      let stabilityTier = "weak";
      if (plank >= 60) stabilityTier = "strong";
      else if (plank >= 20) stabilityTier = "moderate";

      const hinge = data.calibration.hingeComfort;
      let mobilityTier = "limited";
      if (hinge >= 5) mobilityTier = "good";
      else if (hinge >= 3) mobilityTier = "moderate";

      const userProfile = {
        strengthTier,
        mobilityTier,
        stabilityTier,
        startingLoads: {
          upperPush: strengthTier === "beginner" ? "Knee push-ups, 8 reps" : "Standard push-ups, 8 reps",
          upperPull: "Bodyweight rows, 8 reps",
          lowerPush: "Bodyweight squats, 10 reps",
          lowerHinge: "Glute bridges, 12 reps",
          core: stabilityTier === "weak" ? "Knee plank, 20s" : "Plank, 30s",
        },
        exercisesToAvoid: data.constraints.filter((c: string) => c !== "None").map((c: string) => c.toLowerCase()),
        exercisesToEmphasize: []
      };

      const userId = localStorage.getItem("humanstack_user_id");

      const payload = {
        ...data,
        userProfile,
        userId
      };

      const response = await fetch("/api/workouts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (result.success && result.data) {
        localStorage.setItem("humanstack_plan", JSON.stringify(result.data));
        router.push("/dashboard");
      } else {
        const msg = result.error || "Plan generation failed. Please try again.";
        console.error("Generate error:", msg);
        alert(msg);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  const ChipMap = ({ options, selected, onClick, multi = false }: { options: string[], selected: string | string[], onClick: (val: string) => void, multi?: boolean }) => {
    const safeSelectedArray = Array.isArray(selected) ? selected : [selected];
    
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {options.map((opt) => {
          const isSelected = safeSelectedArray.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onClick(opt)}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isSelected 
                  ? "bg-green-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.4)] border border-green-400" 
                  : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white border border-zinc-700"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    );
  };

  const getStepTitle = () => {
    if (step <= 6) return "Intake Questionnaire";
    if (step <= 9) return "Deep Personalization";
    if (step === 10) return "Calibration Intro";
    return "Calibration Session";
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-4 py-12 flex justify-center items-start">
      <Card className="w-full max-w-2xl bg-zinc-900 border-zinc-800 text-zinc-100 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 h-1 bg-green-500 transition-all duration-300 ease-in-out" style={{ width: `${(step / totalSteps) * 100}%` }} />

        <CardHeader className="text-center pb-6 border-b border-zinc-800/50 pt-10">
          <CardTitle className="text-3xl font-bold tracking-tight text-white">
            {getStepTitle()}
          </CardTitle>
          <CardDescription className="text-zinc-400 mt-2 text-base">
            Step {step} of {totalSteps}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-8">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 min-h-[300px]">
            
            {step === 1 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                <Label className="text-2xl font-bold text-white block mb-4">What do you most want to achieve?</Label>
                <ChipMap options={GOAL_OPTIONS} selected={watch("goal")} onClick={(val) => setValue("goal", val)} />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                <Label className="text-2xl font-bold text-white block mb-4">How long do you want to commit to?</Label>
                <ChipMap options={TIMEFRAME_OPTIONS} selected={watch("timeframe")} onClick={(val) => setValue("timeframe", val)} />
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                <Label className="text-2xl font-bold text-white block mb-4">How would you describe your training history?</Label>
                <div className="flex flex-col gap-3">
                  {EXPERIENCE_OPTIONS.map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setValue("experience", opt)}
                      className={`p-4 rounded-xl text-left font-medium transition-all ${
                        watch("experience") === opt 
                          ? "bg-green-500/10 text-green-400 border border-green-500" 
                          : "bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                <Label className="text-2xl font-bold text-white block mb-2">What do you have access to?</Label>
                <p className="text-sm text-zinc-400 mb-4">Select all that apply.</p>
                <ChipMap options={EQUIPMENT_OPTIONS} selected={watch("equipment")} onClick={(val) => toggleArray("equipment", val)} multi={true} />
              </div>
            )}

            {step === 5 && (
              <div className="space-y-8 animate-in slide-in-from-right-4 fade-in duration-300">
                <div>
                  <Label className="text-2xl font-bold text-white block mb-2">How many days per week can you train?</Label>
                  <div className="flex items-center gap-4 mt-4">
                    <Input 
                      type="range" min="2" max="6" step="1"
                      {...form.register("daysPerWeek")} 
                      className="w-full accent-green-500 cursor-pointer"
                    />
                    <span className="text-2xl font-bold text-green-500 w-12 text-center">{watch("daysPerWeek")}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-xl font-bold text-white block mb-4 mt-8">Morning or evening preference?</Label>
                  <ChipMap options={TIME_PREF_OPTIONS} selected={watch("timePreference")} onClick={(val) => setValue("timePreference", val)} />
                </div>
              </div>
            )}

            {step === 6 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                <Label className="text-2xl font-bold text-white block mb-2">Any areas we should be careful with?</Label>
                <p className="text-sm text-zinc-400 mb-4">Select all that apply.</p>
                <ChipMap options={CONSTRAINT_OPTIONS} selected={watch("constraints")} onClick={(val) => toggleArray("constraints", val)} multi={true} />
              </div>
            )}

            {/* NEW STEP: PHYSIQUE GOAL */}
            {step === 7 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                <Label className="text-2xl font-bold text-white block mb-4">What kind of body do you want?</Label>
                <p className="text-sm text-zinc-400 mb-4">This helps us tailor your progression toward aesthetics, functional power, or mobility.</p>
                <ChipMap options={PHYSIQUE_OPTIONS} selected={watch("physiqueGoal")} onClick={(val) => setValue("physiqueGoal", val)} />
              </div>
            )}

            {/* NEW STEP: LIFESTYLE ANALYSIS */}
            {step === 8 && (
              <div className="space-y-8 animate-in slide-in-from-right-4 fade-in duration-300">
                <Label className="text-2xl font-bold text-white block mb-2">Let's look at your lifestyle.</Label>
                <p className="text-sm text-zinc-400 mb-4">Your body adapts based on how you recover outside the gym.</p>
                
                <div>
                  <Label className="text-lg font-medium text-white block mb-2 mt-4">How many hours a day do you sit at a desk?</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <Input 
                      type="range" min="0" max="16" step="1"
                      {...form.register("lifestyle.deskHours")} 
                      className="w-full accent-green-500 cursor-pointer"
                    />
                    <span className="text-xl font-bold text-green-500 w-12 text-center">{watch("lifestyle.deskHours")}h</span>
                  </div>
                </div>

                <div>
                  <Label className="text-lg font-medium text-white block mb-3">Sleep Quality</Label>
                  <ChipMap options={SLEEP_OPTIONS} selected={watch("lifestyle.sleepQuality")} onClick={(val) => setValue("lifestyle.sleepQuality", val)} />
                </div>

                <div>
                  <Label className="text-lg font-medium text-white block mb-3">Overall Stress Level</Label>
                  <ChipMap options={STRESS_OPTIONS} selected={watch("lifestyle.stressLevel")} onClick={(val) => setValue("lifestyle.stressLevel", val)} />
                </div>
              </div>
            )}

            {/* NEW STEP: PSYCHOLOGICAL DRIVERS */}
            {step === 9 && (
              <div className="space-y-8 animate-in slide-in-from-right-4 fade-in duration-300">
                <Label className="text-2xl font-bold text-white block mb-2">Understanding your drivers.</Label>
                <p className="text-sm text-zinc-400 mb-4">We use this to build a sustainable system for you.</p>

                <div>
                  <Label className="text-lg font-medium text-white block mb-3">Why do you want this transformation?</Label>
                  <textarea 
                    {...form.register("psychology.motivation")}
                    className="w-full h-24 bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:border-green-500 transition-colors resize-none"
                    placeholder="e.g., I want to feel confident, I have a wedding coming up, I want to keep up with my kids..."
                  />
                </div>

                <div>
                  <Label className="text-lg font-medium text-white block mb-3 mt-4">What has been your biggest struggle in the past?</Label>
                  <ChipMap options={STRUGGLE_OPTIONS} selected={watch("psychology.pastStruggle")} onClick={(val) => setValue("psychology.pastStruggle", val)} />
                </div>
              </div>
            )}

            {/* STEP 10: CALIBRATION INTRO */}
            {step === 10 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300 text-center">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white">Time for Calibration</h3>
                <p className="text-zinc-400 max-w-md mx-auto text-lg leading-relaxed">
                  We need to understand where you're starting from. You'll do 5 quick movements right now to calibrate your starting difficulty.
                </p>
                <ul className="text-left bg-zinc-950 p-6 rounded-xl border border-zinc-800 space-y-3 mt-6 inline-block max-w-sm w-full mx-auto">
                  <li className="flex items-center gap-3 text-zinc-300"><div className="w-2 h-2 rounded-full bg-green-500"></div> Push-up max</li>
                  <li className="flex items-center gap-3 text-zinc-300"><div className="w-2 h-2 rounded-full bg-green-500"></div> Bodyweight squat</li>
                  <li className="flex items-center gap-3 text-zinc-300"><div className="w-2 h-2 rounded-full bg-green-500"></div> Plank hold</li>
                  <li className="flex items-center gap-3 text-zinc-300"><div className="w-2 h-2 rounded-full bg-green-500"></div> Single-leg balance</li>
                  <li className="flex items-center gap-3 text-zinc-300"><div className="w-2 h-2 rounded-full bg-green-500"></div> Hip hinge</li>
                </ul>
              </div>
            )}

            {step === 11 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                <Label className="text-2xl font-bold text-white block mb-2">1. Push-up test</Label>
                <p className="text-lg text-zinc-400 mb-6 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                  Do as many controlled push-ups as you can. Stop when your form breaks.
                </p>
                <div className="max-w-xs mx-auto">
                  <Label className="text-sm text-zinc-500 uppercase tracking-wider font-bold">Total Reps</Label>
                  <Input type="number" placeholder="0" {...form.register("calibration.pushups")} className="bg-zinc-950 border-zinc-800 text-3xl py-8 text-center mt-2 focus-visible:ring-green-500 font-mono" />
                </div>
              </div>
            )}

            {step === 12 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                <Label className="text-2xl font-bold text-white block mb-2">2. Bodyweight squat</Label>
                <p className="text-lg text-zinc-400 mb-6 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                  Do 10 squats. Notice if you feel any discomfort. Rate your form comfort below.
                </p>
                <div className="space-y-4 pt-4">
                  <div className="flex justify-between text-sm text-zinc-500 font-bold uppercase tracking-wider">
                    <span>Pain / Discomfort (1)</span>
                    <span>Perfect (5)</span>
                  </div>
                  <Input 
                    type="range" min="1" max="5" step="1" 
                    {...form.register("calibration.squatComfort")} 
                    className="w-full accent-green-500 cursor-pointer"
                  />
                  <div className="text-center text-3xl font-bold text-green-500 font-mono mt-4">
                    {watch("calibration.squatComfort")}
                  </div>
                </div>
              </div>
            )}

            {step === 13 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300 text-center">
                <Label className="text-2xl font-bold text-white block mb-2 text-left">3. Plank hold</Label>
                <p className="text-lg text-zinc-400 mb-6 bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-left">
                  Hold a plank until you need to stop. Use the timer below.
                </p>
                
                <div className="text-6xl font-mono font-bold text-white my-8">
                  {Math.floor(timerSeconds / 60).toString().padStart(2, '0')}:{(timerSeconds % 60).toString().padStart(2, '0')}
                </div>
                
                <div className="flex gap-4 justify-center">
                  {!timerActive ? (
                    <Button type="button" size="lg" onClick={() => setTimerActive(true)} className="bg-green-500 text-black hover:bg-green-400 px-8 text-lg font-bold">
                      {timerSeconds > 0 ? "Resume" : "Start Timer"}
                    </Button>
                  ) : (
                    <Button type="button" size="lg" onClick={() => setTimerActive(false)} className="bg-red-500 text-white hover:bg-red-600 px-8 text-lg font-bold">
                      Stop
                    </Button>
                  )}
                  {timerSeconds > 0 && !timerActive && (
                    <Button type="button" size="lg" variant="outline" onClick={() => setTimerSeconds(0)} className="border-zinc-700 text-zinc-300 hover:text-white">
                      Reset
                    </Button>
                  )}
                </div>
                <input type="hidden" {...form.register("calibration.plankSeconds")} value={timerSeconds} />
              </div>
            )}

            {step === 14 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                <Label className="text-2xl font-bold text-white block mb-2">4. Single-leg balance</Label>
                <p className="text-lg text-zinc-400 mb-6 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                  Stand on one leg with eyes closed. Estimate average seconds until you lose balance across both sides.
                </p>
                <div className="max-w-xs mx-auto">
                  <Label className="text-sm text-zinc-500 uppercase tracking-wider font-bold">Average Seconds</Label>
                  <Input type="number" placeholder="0" {...form.register("calibration.balanceSeconds")} className="bg-zinc-950 border-zinc-800 text-3xl py-8 text-center mt-2 focus-visible:ring-green-500 font-mono" />
                </div>
              </div>
            )}

            {step === 15 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                <Label className="text-2xl font-bold text-white block mb-2">5. Hip hinge (bodyweight)</Label>
                <p className="text-lg text-zinc-400 mb-6 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                  Stand and hinge forward keeping back flat, touching your shins. Rate your mobility.
                </p>
                <div className="space-y-4 pt-4">
                  <div className="flex justify-between text-sm text-zinc-500 font-bold uppercase tracking-wider">
                    <span>Can't hinge (1)</span>
                    <span>Perfect (5)</span>
                  </div>
                  <Input 
                    type="range" min="1" max="5" step="1" 
                    {...form.register("calibration.hingeComfort")} 
                    className="w-full accent-green-500 cursor-pointer"
                  />
                  <div className="text-center text-3xl font-bold text-green-500 font-mono mt-4">
                    {watch("calibration.hingeComfort")}
                  </div>
                </div>
              </div>
            )}

            {/* NAVIGATION CONTROLS */}
            <div className="flex items-center justify-between pt-8 border-t border-zinc-800/50 mt-8">
              <Button 
                type="button" 
                variant="outline" 
                onClick={prevStep} 
                disabled={step === 1 || isLoading}
                className="bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white px-6"
              >
                Back
              </Button>

              {step < totalSteps ? (
               <Button 
                  type="button" 
                  onClick={nextStep}
                  className="bg-green-500 text-black hover:bg-green-400 px-8 font-semibold shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                >
                  {step === 10 ? "Start Calibration →" : "Continue"}
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  disabled={isLoading} 
                  className="bg-white text-black hover:bg-zinc-200 px-8 font-bold shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                >
                  {isLoading ? "Analyzing Profile..." : "GENERATE PROTOCOL"}
                </Button>
              )}
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}
