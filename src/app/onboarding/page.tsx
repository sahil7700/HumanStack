"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const onboardingSchema = z.object({
  goals: z.array(z.string()).min(1, "Select at least one goal"),
  priorityNotes: z.string().optional(),
  age: z.coerce.number().min(14).max(100),
  weight: z.string().min(1, "Required"),
  posture: z.array(z.string()),
  postureNotes: z.string().optional(),
  pushups: z.coerce.number(),
  pullups: z.coerce.number(),
  equipment: z.array(z.string()),
  equipmentNotes: z.string().optional(),
  injuries: z.string().optional(),
  daysPerWeek: z.string().min(1, "Select days per week"),
  workoutDuration: z.string().min(1, "Select duration"),
  lifestyle: z.string().min(1, "Select lifestyle"),
  motivationOptions: z.array(z.string()),
  motivation: z.string().optional(),
});

type OnboardingValues = z.infer<typeof onboardingSchema>;

const GOAL_OPTIONS = ["Fat Loss", "Muscle Gain", "Pure Strength", "Athleticism", "Mobility", "Aesthetics", "Energy & Focus"];
const POSTURE_OPTIONS = ["Healthy / None", "Rounded Shoulders", "Lower Back Pain", "Forward Neck (Tech Neck)", "Tight Hips"];
const EQUIPMENT_OPTIONS = ["Bodyweight Only", "Dumbbells", "Pull-up Bar", "Resistance Bands", "Gym Rings", "Full Gym Access"];
const DAYS_OPTIONS = ["2 Days", "3 Days", "4 Days", "5 Days", "6 Days"];
const DURATION_OPTIONS = ["15-20 min", "30-45 min", "60+ min"];
const LIFESTYLE_OPTIONS = ["High Stress / Low Sleep", "Sedentary Desk Job", "Active / Good Energy", "Student (Irregular Sleep)"];
const MOTIVATION_OPTIONS = ["Build Discipline", "Insecurity / Look Better", "Health Scare / Doctor's Orders", "Mental Clarity & Focus", "Athletic Performance", "General Health & Longevity"];

export default function OnboardingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [step, setStep] = React.useState(1);
  const totalSteps = 5;

  const form = useForm({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      goals: [], priorityNotes: "", age: 25, weight: "", posture: [], postureNotes: "",
      pushups: 0, pullups: 0, equipment: [], equipmentNotes: "", injuries: "",
      daysPerWeek: "", workoutDuration: "", lifestyle: "", motivationOptions: [], motivation: "",
    },
  });

  const watchGoals = form.watch("goals");
  const watchPosture = form.watch("posture");
  const watchEquipment = form.watch("equipment");
  const watchDays = form.watch("daysPerWeek");
  const watchDuration = form.watch("workoutDuration");
  const watchLifestyle = form.watch("lifestyle");
  const watchMotivationOpts = form.watch("motivationOptions");

  const toggleArray = (field: "goals" | "posture" | "equipment" | "motivationOptions", value: string) => {
    const current = form.getValues(field);
    if (current.includes(value)) {
      form.setValue(field, current.filter((v) => v !== value));
    } else {
      form.setValue(field, [...current, value]);
    }
  };

  async function onSubmit(data: OnboardingValues) {
    setIsLoading(true);
    try {
      const response = await fetch("/api/workouts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (result.success) {
        router.push("/dashboard");
      } else {
        console.error(result.error);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  const nextStep = async () => {
    setStep((s) => Math.min(s + 1, totalSteps));
  };

  const prevStep = () => {
    setStep((s) => Math.max(s - 1, 1));
  };

  const ChipMap = ({ options, selected, onClick, multi = true, showPriority = false }: { options: string[], selected: string | string[], onClick: (val: string) => void, multi?: boolean, showPriority?: boolean }) => {
    const safeSelectedArray = Array.isArray(selected) ? selected : [];
    
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {options.map((opt) => {
          const isSelected = multi ? safeSelectedArray.includes(opt) : selected === opt;
          const selectedIndex = multi ? safeSelectedArray.indexOf(opt) : -1;

          return (
            <button
              key={opt}
              type="button"
              onClick={() => onClick(opt)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                isSelected 
                  ? "bg-green-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.4)]" 
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
              }`}
            >
              {multi && isSelected && showPriority && (
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-black text-green-500 text-xs font-bold">
                  {selectedIndex + 1}
                </span>
              )}
              {opt}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-4 py-12 flex justify-center items-start">
      <Card className="w-full max-w-2xl bg-zinc-900 border-zinc-800 text-zinc-100 h-fit shadow-2xl relative overflow-hidden">
        
        <div className="absolute top-0 left-0 h-1 bg-green-500 transition-all duration-300 ease-in-out" style={{ width: `${(step / totalSteps) * 100}%` }} />

        <CardHeader className="text-center pb-6 border-b border-zinc-800/50 pt-10">
          <CardTitle className="text-3xl font-bold tracking-tight text-white">
            {step === 1 && "Core Objectives"}
            {step === 2 && "Physical State"}
            {step === 3 && "True Capabilities"}
            {step === 4 && "The Arsenal"}
            {step === 5 && "Reality Check"}
          </CardTitle>
          <CardDescription className="text-zinc-400 mt-2 text-base">
            Step {step} of {totalSteps}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-8">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            {/* STEP 1: GOALS */}
            {step === 1 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                <div className="space-y-2">
                  <Label className="text-lg">What are you trying to achieve?</Label>
                  <p className="text-sm text-zinc-500 mb-4">Select all that apply.</p>
                  <ChipMap options={GOAL_OPTIONS} selected={watchGoals} onClick={(val) => toggleArray("goals", val)} showPriority={true} />
                  {form.formState.errors.goals && <p className="text-sm text-red-500">{form.formState.errors.goals.message}</p>}
                </div>
                
                <div className="pt-4 space-y-2">
                  <Label className="text-zinc-400">Priorities & Custom Goals</Label>
                  <Textarea 
                    placeholder="e.g. 'I want Fat Loss but my #1 priority is running a 5k without knee pain.'" 
                    {...form.register("priorityNotes")} 
                    className="bg-zinc-950 border-zinc-800 focus-visible:ring-green-500 min-h-[100px]" 
                  />
                </div>
              </div>
            )}

            {/* STEP 2: BODY & POSTURE */}
            {step === 2 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-lg">Age</Label>
                    <Input type="number" {...form.register("age")} className="bg-zinc-950 border-zinc-800 focus-visible:ring-green-500 text-lg py-6" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-lg">Weight (lbs/kg)</Label>
                    <Input placeholder="e.g. 175 lbs" {...form.register("weight")} className="bg-zinc-950 border-zinc-800 focus-visible:ring-green-500 text-lg py-6" />
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <Label className="text-lg">Posture Issues</Label>
                  <p className="text-sm text-zinc-500 mb-4">Select any that you struggle with.</p>
                  <ChipMap options={POSTURE_OPTIONS} selected={watchPosture} onClick={(val) => toggleArray("posture", val)} />
                </div>

                <div className="pt-2 space-y-2">
                  <Label className="text-zinc-400">Other Posture / Movement Issues</Label>
                  <Input placeholder="e.g. One shoulder sits higher, right hip pops, flat feet" {...form.register("postureNotes")} className="bg-zinc-950 border-zinc-800" />
                </div>
              </div>
            )}

            {/* STEP 3: CAPABILITIES */}
            {step === 3 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-lg">Max Push-ups</Label>
                    <p className="text-xs text-zinc-500">Unbroken, good form</p>
                    <Input type="number" placeholder="0" {...form.register("pushups")} className="bg-zinc-950 border-zinc-800 text-lg py-6" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-lg">Max Pull-ups</Label>
                    <p className="text-xs text-zinc-500">Unbroken, good form</p>
                    <Input type="number" placeholder="0" {...form.register("pullups")} className="bg-zinc-950 border-zinc-800 text-lg py-6" />
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <Label className="text-lg text-red-400">Injuries or Medical Limitations</Label>
                  <p className="text-sm text-zinc-500 mb-2">Be very specific. The AI will avoid exercises that aggravate these.</p>
                  <Textarea 
                    placeholder="Examples: 
- 'Torn left meniscus in 2021, hurts when I squat deep'
- 'Asthma, I can't do high-intensity cardio'
- 'Pinched nerve in neck, overhead pressing causes tingling'" 
                    {...form.register("injuries")} 
                    className="bg-zinc-950 border-zinc-800 min-h-[100px] focus-visible:ring-red-500" 
                  />
                </div>
              </div>
            )}

            {/* STEP 4: EQUIPMENT */}
            {step === 4 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                <div className="space-y-2">
                  <Label className="text-lg">What do you have access to?</Label>
                  <ChipMap options={EQUIPMENT_OPTIONS} selected={watchEquipment} onClick={(val) => toggleArray("equipment", val)} />
                </div>
                
                <div className="pt-4 space-y-2">
                  <Label className="text-zinc-400">Other Equipment / Notes</Label>
                  <Input placeholder="e.g. One 35lb kettlebell and a jump rope" {...form.register("equipmentNotes")} className="bg-zinc-950 border-zinc-800 py-6" />
                </div>
              </div>
            )}

            {/* STEP 5: LOGISTICS */}
            {step === 5 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Realistic Days Per Week</Label>
                    <ChipMap options={DAYS_OPTIONS} selected={watchDays} onClick={(val) => form.setValue("daysPerWeek", val)} multi={false} />
                  </div>

                  <div className="space-y-2">
                    <Label>Time Per Workout</Label>
                    <ChipMap options={DURATION_OPTIONS} selected={watchDuration} onClick={(val) => form.setValue("workoutDuration", val)} multi={false} />
                  </div>

                  <div className="space-y-2">
                    <Label>Current Lifestyle</Label>
                    <ChipMap options={LIFESTYLE_OPTIONS} selected={watchLifestyle} onClick={(val) => form.setValue("lifestyle", val)} multi={false} />
                  </div>

                  <div className="space-y-2 pt-4">
                    <Label className="text-lg text-white">The Deep 'Why'</Label>
                    <p className="text-sm text-zinc-500 mb-2">Motivation fades. Why are you *really* doing this?</p>
                    <ChipMap options={MOTIVATION_OPTIONS} selected={watchMotivationOpts} onClick={(val) => toggleArray("motivationOptions", val)} showPriority={true} />
                    
                    <Textarea 
                      placeholder="Add any personal details here (optional)..." 
                      {...form.register("motivation")} 
                      className="bg-zinc-950 border-zinc-800 min-h-[80px] mt-4 focus-visible:ring-green-500" 
                    />
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
                className="bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white"
              >
                Back
              </Button>

              {step < totalSteps ? (
                <Button 
                  type="button" 
                  onClick={nextStep}
                  className="bg-green-500 text-black hover:bg-green-400 px-8 font-semibold"
                >
                  Continue
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  disabled={isLoading} 
                  className="bg-white text-black hover:bg-zinc-200 px-8 font-bold shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                >
                  {isLoading ? "Forging Protocol..." : "GENERATE AI PROTOCOL"}
                </Button>
              )}
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}
