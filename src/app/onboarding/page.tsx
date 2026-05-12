"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowLeft,
  Flame,
  Target,
  Dumbbell,
  Salad,
  Zap,
  Heart,
  ChevronRight,
} from "lucide-react";
import { useUserStore } from "@/store/use-user-store";
import { cn } from "@/lib/utils";

const goals = [
  { id: "fat_loss", label: "Fat Loss", icon: Flame, desc: "Burn fat, get shredded" },
  { id: "muscle_gain", label: "Muscle Gain", icon: Dumbbell, desc: "Build size & strength" },
  { id: "maintain", label: "Maintain", icon: Heart, desc: "Stay fit & healthy" },
  { id: "endurance", label: "Endurance", icon: Zap, desc: "Build stamina & cardio" },
] as const;

const fitnessLevels = [
  { id: "beginner", label: "Beginner", desc: "New to fitness (0-6 months)" },
  { id: "intermediate", label: "Intermediate", desc: "Regular training (6-24 months)" },
  { id: "advanced", label: "Advanced", desc: "Experienced lifter (2+ years)" },
] as const;

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<string>("");
  const [fitnessLevel, setFitnessLevel] = useState<string>("");
  const [age, setAge] = useState<number>(25);
  const [weight, setWeight] = useState<number>(70);
  const [height, setHeight] = useState<number>(175);
  const [workoutDays, setWorkoutDays] = useState<number>(4);
  const router = useRouter();
  const { completeOnboarding } = useUserStore();

  const totalSteps = 3;

  const canProceed = () => {
    if (step === 0) return goal !== "";
    if (step === 1) return age > 0 && weight > 0 && height > 0;
    if (step === 2) return fitnessLevel !== "" && workoutDays > 0;
    return false;
  };

  const handleComplete = () => {
    completeOnboarding({
      age,
      weight,
      height,
      goal: goal as "fat_loss" | "muscle_gain" | "maintain" | "endurance",
      fitnessLevel: fitnessLevel as "beginner" | "intermediate" | "advanced",
      workoutDays,
    });
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center">
            <Flame className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-heading font-bold text-sm">RahulFitzz</span>
        </div>
        <div className="flex items-center gap-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all duration-500",
                i === step
                  ? "w-8 bg-brand"
                  : i < step
                  ? "w-4 bg-brand/50"
                  : "w-4 bg-white/10"
              )}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">
            {/* Step 1: Goal Selection */}
            {step === 0 && (
              <motion.div
                key="step-0"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-brand text-xs font-bold uppercase tracking-[0.4em] mb-3">
                  Step 1 of {totalSteps}
                </p>
                <h1 className="text-white text-3xl sm:text-4xl font-black uppercase tracking-tighter mb-3 font-heading">
                  What&apos;s Your <span className="text-brand">Goal</span>?
                </h1>
                <p className="text-text-secondary text-sm mb-10">
                  This helps us create the perfect plan for you
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {goals.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => setGoal(g.id)}
                      className={cn(
                        "flex items-start gap-4 p-5 rounded-2xl border transition-all duration-300 text-left group",
                        goal === g.id
                          ? "bg-brand/10 border-brand shadow-[0_0_30px_rgba(235,0,0,0.15)]"
                          : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/[0.07]"
                      )}
                    >
                      <div
                        className={cn(
                          "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                          goal === g.id
                            ? "bg-brand text-white"
                            : "bg-white/10 text-text-secondary group-hover:text-white"
                        )}
                      >
                        <g.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className={cn("font-bold text-sm", goal === g.id ? "text-white" : "text-text-secondary")}>
                          {g.label}
                        </p>
                        <p className="text-text-muted text-xs mt-0.5">{g.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2: Body Stats */}
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-brand text-xs font-bold uppercase tracking-[0.4em] mb-3">
                  Step 2 of {totalSteps}
                </p>
                <h1 className="text-white text-3xl sm:text-4xl font-black uppercase tracking-tighter mb-3 font-heading">
                  Your <span className="text-brand">Stats</span>
                </h1>
                <p className="text-text-secondary text-sm mb-10">
                  We&apos;ll use this to personalize your plan
                </p>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-text-secondary text-xs font-bold uppercase tracking-widest">Age</label>
                      <span className="text-brand font-bold text-lg font-heading">{age} yrs</span>
                    </div>
                    <input
                      type="range"
                      min={14}
                      max={65}
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-brand [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-brand [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(235,0,0,0.5)]"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-text-secondary text-xs font-bold uppercase tracking-widest">Weight</label>
                      <span className="text-brand font-bold text-lg font-heading">{weight} kg</span>
                    </div>
                    <input
                      type="range"
                      min={30}
                      max={150}
                      value={weight}
                      onChange={(e) => setWeight(Number(e.target.value))}
                      className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-brand [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-brand [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(235,0,0,0.5)]"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-text-secondary text-xs font-bold uppercase tracking-widest">Height</label>
                      <span className="text-brand font-bold text-lg font-heading">{height} cm</span>
                    </div>
                    <input
                      type="range"
                      min={140}
                      max={210}
                      value={height}
                      onChange={(e) => setHeight(Number(e.target.value))}
                      className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-brand [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-brand [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(235,0,0,0.5)]"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Fitness Level & Schedule */}
            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-brand text-xs font-bold uppercase tracking-[0.4em] mb-3">
                  Step 3 of {totalSteps}
                </p>
                <h1 className="text-white text-3xl sm:text-4xl font-black uppercase tracking-tighter mb-3 font-heading">
                  Your <span className="text-brand">Level</span>
                </h1>
                <p className="text-text-secondary text-sm mb-10">
                  Almost done — let&apos;s set your training frequency
                </p>

                <div className="space-y-4 mb-10">
                  {fitnessLevels.map((level) => (
                    <button
                      key={level.id}
                      onClick={() => setFitnessLevel(level.id)}
                      className={cn(
                        "w-full flex items-center justify-between p-5 rounded-2xl border transition-all duration-300 text-left",
                        fitnessLevel === level.id
                          ? "bg-brand/10 border-brand"
                          : "bg-white/5 border-white/10 hover:border-white/20"
                      )}
                    >
                      <div>
                        <p className={cn("font-bold text-sm", fitnessLevel === level.id ? "text-white" : "text-text-secondary")}>
                          {level.label}
                        </p>
                        <p className="text-text-muted text-xs mt-0.5">{level.desc}</p>
                      </div>
                      <ChevronRight className={cn("w-4 h-4 transition-colors", fitnessLevel === level.id ? "text-brand" : "text-text-muted")} />
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-text-secondary text-xs font-bold uppercase tracking-widest">
                      Workout Days / Week
                    </label>
                    <span className="text-brand font-bold text-lg font-heading">{workoutDays} days</span>
                  </div>
                  <div className="flex gap-2">
                    {[2, 3, 4, 5, 6, 7].map((d) => (
                      <button
                        key={d}
                        onClick={() => setWorkoutDays(d)}
                        className={cn(
                          "flex-1 py-3 rounded-xl font-bold text-sm transition-all",
                          workoutDays === d
                            ? "bg-brand text-white shadow-[0_0_20px_rgba(235,0,0,0.3)]"
                            : "bg-white/5 border border-white/10 text-text-secondary hover:bg-white/10"
                        )}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom buttons */}
      <div className="p-4 sm:p-8 flex gap-4">
        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            className="px-6 py-4 bg-white/5 border border-white/10 text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        )}
        <button
          onClick={() => {
            if (step < totalSteps - 1) setStep(step + 1);
            else handleComplete();
          }}
          disabled={!canProceed()}
          className="flex-1 py-4 bg-brand hover:bg-brand-dark text-white font-black text-xs uppercase tracking-[0.3em] rounded-xl transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-[0_0_30px_rgba(235,0,0,0.3)]"
        >
          {step === totalSteps - 1 ? "Launch My Plan" : "Continue"}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
