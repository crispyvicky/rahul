"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dumbbell, Plus, Minus, ChevronRight, Timer, CheckCircle, Volume2, RefreshCw, Trash2, Calendar, Sparkles, Trophy, Heart, Activity, Play
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/use-user-store";
import { useGymPlanStore, DAYS_OF_WEEK } from "@/store/use-gym-plan-store";
import type { SetLog } from "@/lib/gym-plan-types";
import { ExerciseSwapModal } from "@/components/gym/exercise-swap-modal";
import toast from "react-hot-toast";

const muscleGroups = [
  { id: "chest", label: "Chest", emoji: "🔥" },
  { id: "back", label: "Back", emoji: "💪" },
  { id: "shoulders", label: "Shoulders", emoji: "⚡" },
  { id: "legs", label: "Legs", emoji: "🦵" },
  { id: "arms", label: "Arms", emoji: "💪" },
  { id: "core", label: "Core", emoji: "🎯" },
];

export default function GymModePage() {
  const { data: session } = useSession();
  const { user } = useUserStore();
  const userId = user?.id ?? session?.user?.id ?? null;

  const {
    schedule,
    weeklyPlan,
    sets,
    isHydrated,
    weeklyPlanId,
    hydrate,
    updateSchedule,
    generatePlan,
    swapExercise,
    applyAiSuggestion,
    reorderExercises,
    updateSetLogs,
    resetPlan,
    setUserId,
    isMutating,
    error: planError,
  } = useGymPlanStore();

  const [activeDayIndex, setActiveDayIndex] = useState<number>(0);
  const [activeExerciseSection, setActiveExerciseSection] = useState<"warmup" | "workout" | "cooldown">("workout");
  const [activeExerciseIndex, setActiveExerciseIndex] = useState<number | null>(null);
  const [restTimer, setRestTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [setupMode, setSetupMode] = useState(false);
  const [generatingStatus, setGeneratingStatus] = useState<string | null>(null);
  const [swapModal, setSwapModal] = useState<{ dayIndex: number; exerciseIndex: number } | null>(null);

  useEffect(() => {
    if (userId) setUserId(userId);
  }, [userId, setUserId]);

  useEffect(() => {
    void hydrate(userId ?? "local");
    const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
    const matchIndex = DAYS_OF_WEEK.indexOf(todayName);
    if (matchIndex !== -1) setActiveDayIndex(matchIndex);
  }, [userId, hydrate]);

  const toggleMuscle = (day: string, muscleId: string) => {
    void updateSchedule(day, muscleId);
  };

  const createWeeklyPlan = () => {
    setGeneratingStatus("GENERATING SHUFFLED PRESETS...");
    setTimeout(() => {
      setGeneratingStatus("STRUCTURING ACTIVE WARM-UPS & COOL-DOWNS...");
      setTimeout(() => {
        setGeneratingStatus("STORING CODE OF DISCIPLINE...");
        setTimeout(async () => {
          await generatePlan();
          setSetupMode(false);
          setGeneratingStatus(null);
        }, 600);
      }, 600);
    }, 600);
  };

  const handleResetPlan = () => {
    if (window.confirm("Are you sure you want to reset your weekly plan? This will clear your customized days and workout sets.")) {
      void resetPlan();
      setSetupMode(true);
    }
  };

  const handleAiSwap = async () => {
    if (!swapModal || !weeklyPlan || !userId || isMutating) return;
    const result = await applyAiSuggestion(swapModal.dayIndex, swapModal.exerciseIndex);
    if (result.ok === true) {
      toast.success(`Swapped to ${result.name}`);
    } else if (result.ok === false) {
      toast.error(result.error);
    }
  };

  // Set Tracking Logic
  const getSetLogs = (section: string, dayName: string, exIndex: number): SetLog[] => {
    const key = `${section}-${dayName}-${exIndex}`;
    return sets[key] || [];
  };

  const addSet = (section: string, dayName: string, exIndex: number) => {
    const key = `${section}-${dayName}-${exIndex}`;
    const current = sets[key] || [];
    const lastSet = current[current.length - 1];
    updateSetLogs({
      ...sets,
      [key]: [...current, { weight: lastSet?.weight || 0, reps: lastSet?.reps || 0, completed: false }]
    });
  };

  const updateSet = (section: string, dayName: string, exIndex: number, setIndex: number, field: keyof SetLog, value: any) => {
    const key = `${section}-${dayName}-${exIndex}`;
    const current = [...(sets[key] || [])];
    current[setIndex] = { ...current[setIndex], [field]: value };
    updateSetLogs({ ...sets, [key]: current });
  };

  const deleteSet = (section: string, dayName: string, exIndex: number, setIndex: number) => {
    const key = `${section}-${dayName}-${exIndex}`;
    const current = [...(sets[key] || [])];
    current.splice(setIndex, 1);
    updateSetLogs({ ...sets, [key]: current });
  };

  // Timer Logic
  const startTimer = (seconds: number) => {
    setRestTimer(seconds);
    setTimerRunning(true);
  };

  useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(() => {
      setRestTimer((prev) => {
        if (prev <= 1) {
          setTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning]);

  // Video guide YouTube launcher
  const getDemoUrl = (exerciseName: string) => {
    return `https://www.youtube.com/results?search_query=how+to+do+${encodeURIComponent(exerciseName)}+correct+form`;
  };

  useEffect(() => {
    if (planError) toast.error(planError);
  }, [planError]);

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Dumbbell className="w-8 h-8 text-[#eb0000] animate-spin" />
      </div>
    );
  }

  // 1. GENERATING TRANSITION OVERLAY
  if (generatingStatus) {
    return (
      <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-16 h-16 rounded-full border-t-2 border-[#eb0000] border-r-2 border-transparent flex items-center justify-center mb-6"
        >
          <Dumbbell className="w-6 h-6 text-[#eb0000]" />
        </motion.div>
        <h2 className="text-white text-xl font-black uppercase tracking-[0.2em] font-heading mb-2">Code of Discipline</h2>
        <motion.p
          key={generatingStatus}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-[#eb0000] text-xs font-bold uppercase tracking-widest"
        >
          {generatingStatus}
        </motion.p>
      </div>
    );
  }

  // 2. ONBOARDING / SETUP PLAN VIEW
  if (setupMode || !weeklyPlan) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 pb-24 max-w-4xl mx-auto">
        <div className="text-center sm:text-left">
          <h1 className="text-white text-2xl sm:text-4xl font-black uppercase tracking-tighter" style={{ fontFamily: '"Orbitron", sans-serif' }}>
            Gym <span className="text-[#eb0000]">Mode Setup</span>
          </h1>
          <p className="text-[#96979c] text-xs sm:text-sm mt-1 second">Configure your custom weekly training split. Tap muscle groups to toggle.</p>
        </div>

        <div className="space-y-4">
          {DAYS_OF_WEEK.map((day) => {
            const selectedList = schedule[day] || [];
            return (
              <div key={day} className="bg-[#0c0c0e] border border-white/5 p-4 sm:p-5 rounded-none flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex items-center gap-3 shrink-0">
                  <Calendar className="w-5 h-5 text-[#eb0000]" />
                  <span className="text-white font-black text-sm uppercase tracking-wider font-heading">{day}</span>
                </div>

                {/* Muscle Assignment Buttons */}
                <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-start sm:justify-end">
                  {muscleGroups.map(group => {
                    const isSelected = selectedList.includes(group.id);
                    return (
                      <button
                        key={group.id}
                        type="button"
                        onClick={() => toggleMuscle(day, group.id)}
                        className={cn(
                          "px-3 py-1.5 text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-none border transition-all duration-300 flex items-center gap-1.5 touch-manipulation",
                          isSelected
                            ? "bg-[#eb0000]/15 text-[#eb0000] border-[#eb0000]"
                            : "bg-transparent text-white/50 border-white/5 hover:border-white/10 hover:text-white"
                        )}
                      >
                        <span>{group.emoji}</span>
                        {group.label}
                      </button>
                    );
                  })}
                </div>

                {/* Status Indicator */}
                <div className="w-full sm:w-auto text-right text-[10px] font-bold uppercase tracking-widest shrink-0 mt-1 sm:mt-0">
                  {selectedList.length === 0 ? (
                    <span className="text-[#96979c]/60 border border-white/5 px-2.5 py-1 text-[9px]">Recovery Day</span>
                  ) : (
                    <span className="text-white border border-[#eb0000]/30 px-2.5 py-1 text-[9px] bg-[#eb0000]/5">{selectedList.length} Muscle Groups</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Generate Button */}
        <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-end">
          {weeklyPlan && (
            <button
              type="button"
              onClick={() => setSetupMode(false)}
              className="min-h-[52px] px-8 border border-white/10 text-white font-black text-xs uppercase tracking-widest rounded-none hover:bg-white hover:text-black transition-all"
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={createWeeklyPlan}
            className="min-h-[52px] px-8 bg-[#eb0000] text-white font-black text-xs uppercase tracking-widest rounded-none hover:bg-[#ff1a1a] transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(235,0,0,0.2)]"
          >
            <Sparkles className="w-4 h-4" /> Generate My Dynamic Plan
          </button>
        </div>
      </div>
    );
  }

  // 3. MAIN WORKOUT TRACKER VIEW (State B - Active Plan)
  const currentDayPlan = weeklyPlan[activeDayIndex];
  const activeMuscleNames = currentDayPlan.muscleGroups.map(id => muscleGroups.find(g => g.id === id)?.label || id).join(" & ");
  const isRestDay = currentDayPlan.muscleGroups.length === 0;

  // Active workout arrays based on active tab selection
  const exerciseList = 
    activeExerciseSection === "warmup" 
      ? currentDayPlan.warmups || []
      : activeExerciseSection === "cooldown" 
        ? currentDayPlan.cooldowns || []
        : currentDayPlan.exercises || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 pb-28 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-white text-2xl sm:text-3xl font-black uppercase tracking-tighter flex items-center gap-2" style={{ fontFamily: '"Orbitron", sans-serif' }}>
            Gym <span className="text-[#eb0000]">Mode</span> <Activity className="w-6 h-6 text-[#eb0000] animate-pulse" />
          </h1>
          <p className="text-[#96979c] text-xs sm:text-sm mt-1 second">Track in real-time, execute with perfect discipline.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSetupMode(true)}
            className="min-h-10 px-4 border border-white/10 bg-transparent text-white hover:bg-white hover:text-black font-black text-[10px] uppercase tracking-widest rounded-none transition-all flex items-center gap-1.5 touch-manipulation"
          >
            <Plus className="w-3.5 h-3.5" /> Edit Split
          </button>
          <button
            type="button"
            onClick={handleResetPlan}
            className="min-h-10 px-4 border border-white/10 bg-transparent text-[#eb0000] hover:bg-[#eb0000] hover:text-white font-black text-[10px] uppercase tracking-widest rounded-none transition-all flex items-center gap-1.5 touch-manipulation"
          >
            <Trash2 className="w-3.5 h-3.5" /> Reset Plan
          </button>
        </div>
      </div>

      {/* Floating Rest Timer */}
      <AnimatePresence>
        {timerRunning && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed z-40 bg-[#0c0c0e] border border-[#eb0000]/30 rounded-none p-4 shadow-[0_0_50px_rgba(235,0,0,0.25)] flex items-center gap-4 right-4 top-20 sm:right-8 sm:top-24"
          >
            <Timer className="w-5 h-5 text-[#eb0000] animate-pulse" />
            <div className="text-left">
              <span className="text-white text-2xl font-black font-heading tabular-nums block">
                {Math.floor(restTimer / 60)}:{String(restTimer % 60).padStart(2, "0")}
              </span>
              <span className="text-[#96979c] text-[8px] uppercase tracking-widest font-black block">Resting</span>
            </div>
            <button
              type="button"
              onClick={() => setTimerRunning(false)}
              className="text-white/40 hover:text-[#eb0000] font-black text-[10px] uppercase tracking-widest ml-2 border border-white/5 px-2 py-1 hover:border-[#eb0000]/30"
            >
              Skip
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Calendar Week Row */}
      <div className="bg-[#0c0c0e] border border-white/5 p-2 rounded-none grid grid-cols-7 gap-1">
        {weeklyPlan.map((p, idx) => {
          const isActive = idx === activeDayIndex;
          const hasWork = p.muscleGroups.length > 0;
          return (
            <button
              key={p.day}
              type="button"
              onClick={() => {
                setActiveDayIndex(idx);
                setActiveExerciseIndex(null);
                setActiveExerciseSection("workout");
              }}
              className={cn(
                "py-3 flex flex-col items-center justify-center transition-all touch-manipulation rounded-none border border-transparent",
                isActive
                  ? "bg-[#eb0000] text-white font-black"
                  : "bg-transparent text-white/50 hover:bg-white/5"
              )}
            >
              <span className="text-[10px] font-black uppercase tracking-wider">{p.day.substring(0, 3)}</span>
              <div className="mt-1 flex items-center justify-center gap-1">
                {hasWork ? (
                  <div className={cn("w-1.5 h-1.5 rounded-full", isActive ? "bg-white" : "bg-[#eb0000]")} />
                ) : (
                  <Heart className={cn("w-2 h-2", isActive ? "text-white" : "text-[#96979c]/30")} />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Dynamic Summary Card */}
      <div className="bg-gradient-to-r from-[#0c0c0e] to-[#121215] border border-white/5 p-6 rounded-none relative overflow-hidden">
        <div className="absolute top-1/2 right-6 -translate-y-1/2 opacity-[0.03] select-none pointer-events-none text-9xl font-black uppercase italic tracking-tighter">
          RF
        </div>
        <div className="relative z-10 space-y-1.5">
          <div className="flex items-center gap-2 text-[#eb0000] text-[10px] font-black uppercase tracking-[0.3em] font-heading">
            <Trophy className="w-3.5 h-3.5" /> Plan of Execution
          </div>
          <h2 className="text-white text-xl sm:text-2xl font-black uppercase tracking-tight font-heading">
            {currentDayPlan.day}&apos;s Discipline
          </h2>
          <p className="text-[#96979c] text-xs uppercase tracking-[0.25em] font-bold">
            {isRestDay ? (
              <span className="text-emerald-400">Rest & Recovery Day</span>
            ) : (
              <span>Target: <span className="text-white">{activeMuscleNames}</span></span>
            )}
          </p>
        </div>
      </div>

      {/* REST DAY RECOVERY SCREEN */}
      {isRestDay && (
        <div className="bg-[#0c0c0e] border border-white/5 p-8 rounded-none text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
            <Heart className="w-8 h-8 animate-pulse" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-white font-black text-lg uppercase tracking-wider font-heading">Recovery Strategy</h3>
            <p className="text-[#96979c] text-xs leading-relaxed second">
              Muscles grow during rest, not during training. Focus on optimized hydration, full-mobility foam rolling, deep sleep (8h+), and premium metabolic nutrition.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="bg-white/5 p-4 border border-white/5 text-center">
              <span className="text-emerald-400 font-black text-sm block">4L+ WATER</span>
              <span className="text-[#96979c] text-[8px] uppercase tracking-widest font-black block mt-1">Hydration</span>
            </div>
            <div className="bg-white/5 p-4 border border-white/5 text-center">
              <span className="text-emerald-400 font-black text-sm block">15 MIN</span>
              <span className="text-[#96979c] text-[8px] uppercase tracking-widest font-black block mt-1">Active Mobility</span>
            </div>
            <div className="bg-white/5 p-4 border border-white/5 text-center">
              <span className="text-emerald-400 font-black text-sm block">120G+ PRO</span>
              <span className="text-[#96979c] text-[8px] uppercase tracking-widest font-black block mt-1">Protein Intake</span>
            </div>
          </div>
        </div>
      )}

      {/* WORKOUT WORK PHASE SELECTOR (Warmup vs Workout vs Cooldown) */}
      {!isRestDay && (
        <div className="grid grid-cols-3 gap-2 border-b border-white/5 pb-2">
          {/* Phase 1: Warmup */}
          <button
            type="button"
            onClick={() => {
              setActiveExerciseSection("warmup");
              setActiveExerciseIndex(null);
            }}
            className={cn(
              "py-2 px-1 text-[10px] sm:text-xs font-black uppercase tracking-wider border-b-2 text-center transition-all",
              activeExerciseSection === "warmup"
                ? "border-[#d97706] text-[#d97706]"
                : "border-transparent text-white/40 hover:text-white"
            )}
          >
            🔥 Phase 1: Warmup
          </button>
          
          {/* Phase 2: Workout */}
          <button
            type="button"
            onClick={() => {
              setActiveExerciseSection("workout");
              setActiveExerciseIndex(null);
            }}
            className={cn(
              "py-2 px-1 text-[10px] sm:text-xs font-black uppercase tracking-wider border-b-2 text-center transition-all",
              activeExerciseSection === "workout"
                ? "border-[#eb0000] text-[#eb0000]"
                : "border-transparent text-white/40 hover:text-white"
            )}
          >
            💪 Phase 2: Main Lift
          </button>

          {/* Phase 3: Cooldown */}
          <button
            type="button"
            onClick={() => {
              setActiveExerciseSection("cooldown");
              setActiveExerciseIndex(null);
            }}
            className={cn(
              "py-2 px-1 text-[10px] sm:text-xs font-black uppercase tracking-wider border-b-2 text-center transition-all",
              activeExerciseSection === "cooldown"
                ? "border-[#0284c7] text-[#0284c7]"
                : "border-transparent text-white/40 hover:text-white"
            )}
          >
            ❄️ Phase 3: Cooldown
          </button>
        </div>
      )}

      {/* ACTIVE WORKOUT LIST */}
      {!isRestDay && (
        <div className="space-y-4">
          {exerciseList.length === 0 && (
            <p className="text-[#96979c]/50 text-center py-8 text-xs uppercase tracking-widest">No activities for this phase.</p>
          )}

          {exerciseList.map((ex, exIdx) => {
            const setLogs = getSetLogs(activeExerciseSection, currentDayPlan.day, exIdx);
            const isCompleted = setLogs.length >= ex.targetSets && setLogs.every(s => s.completed);

            return (
              <div key={exIdx} className="bg-[#0c0c0e] border border-white/5 rounded-none overflow-hidden">
                <div className="w-full flex items-center justify-between p-4 sm:p-5">
                  <button
                    type="button"
                    onClick={() => setActiveExerciseIndex(activeExerciseIndex === exIdx ? null : exIdx)}
                    className="flex items-center gap-4 text-left flex-1 min-w-0 touch-manipulation"
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-none flex items-center justify-center shrink-0 border transition-all",
                      isCompleted 
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                        : activeExerciseSection === "warmup" 
                          ? "bg-[#d97706]/10 border-[#d97706]/20 text-[#d97706]"
                          : activeExerciseSection === "cooldown"
                            ? "bg-[#0284c7]/10 border-[#0284c7]/20 text-[#0284c7]"
                            : "bg-[#eb0000]/10 border-[#eb0000]/20 text-[#eb0000]"
                    )}>
                      <Dumbbell className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-black text-sm sm:text-base uppercase tracking-tight font-heading truncate">{ex.name}</p>
                      <p className="text-[#96979c] text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                        Target: <span className="text-white">{ex.targetSets} Sets × {ex.targetReps}</span>
                      </p>
                    </div>
                  </button>

                  <div className="flex items-center gap-3 shrink-0">
                    {/* Shuffle Exercise Button (Only for main workouts!) */}
                    {activeExerciseSection === "workout" && (
                      <button
                        type="button"
                        onClick={() => setSwapModal({ dayIndex: activeDayIndex, exerciseIndex: exIdx })}
                        title="Swap or reorder this exercise"
                        className="w-9 h-9 border border-white/5 hover:border-[#eb0000]/30 hover:bg-[#eb0000]/5 flex items-center justify-center text-white/50 hover:text-[#eb0000] rounded-none transition-all touch-manipulation"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    )}

                    {isCompleted && (
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    )}

                    <button
                      type="button"
                      onClick={() => setActiveExerciseIndex(activeExerciseIndex === exIdx ? null : exIdx)}
                      className={cn(
                        "w-9 h-9 border border-white/5 hover:border-white/10 flex items-center justify-center text-white/50 hover:text-white rounded-none transition-all touch-manipulation",
                        activeExerciseIndex === exIdx && "rotate-90"
                      )}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Sets & logging inside Expanded view */}
                <AnimatePresence>
                  {activeExerciseIndex === exIdx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-t border-white/5"
                    >
                      <div className="px-4 pb-5 sm:px-5 sm:pb-6 space-y-4 pt-4 bg-[#0a0a0b]/40">
                        {/* Coach Tip Panel */}
                        <div className="flex items-start gap-2.5 p-3 bg-[#eb0000]/5 border border-[#eb0000]/10 rounded-none">
                          <Volume2 className="w-4 h-4 text-[#eb0000] shrink-0 mt-0.5" />
                          <p className="text-[#96979c] text-[11px] sm:text-xs leading-relaxed second">
                            <span className="text-[#eb0000] font-black uppercase tracking-wider">Coach Tip:</span> {ex.tip}
                          </p>
                        </div>

                        {/* Step-by-Step Exercise Execution Guide (SOLVES user request: "dont know how to do just by name") */}
                        {ex.steps && ex.steps.length > 0 && (
                          <div className="bg-white/5 p-4 border border-white/5 rounded-none space-y-2.5">
                            <div className="flex items-center justify-between border-b border-white/5 pb-2">
                              <span className="text-white font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-[#eb0000]" /> Step-By-Step Execution Guide
                              </span>
                              
                              {/* 🎥 YouTube Video Demo Button */}
                              <a
                                href={getDemoUrl(ex.name)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-[#eb0000] hover:text-white transition-colors border border-[#eb0000]/20 hover:border-[#eb0000] px-2.5 py-1 bg-[#eb0000]/5 no-underline"
                              >
                                <Play className="w-3 h-3 fill-current" /> Watch Video Tutorial
                              </a>
                            </div>

                            <ol className="list-decimal pl-4 space-y-2">
                              {ex.steps.map((step, sIdx) => (
                                <li key={sIdx} className="text-[#96979c] text-[11px] leading-relaxed">
                                  {step}
                                </li>
                              ))}
                            </ol>
                          </div>
                        )}

                        {/* Sets Grid */}
                        <div className="space-y-3">
                          {setLogs.length > 0 && (
                            <div className="flex items-center gap-3 px-2 text-[#96979c] text-[9px] font-black uppercase tracking-[0.2em]">
                              <span className="w-8 text-center">Set</span>
                              <span className="flex-1 text-center">Weight (kg)</span>
                              <span className="flex-1 text-center">Reps</span>
                              <span className="w-10 text-center">Done</span>
                            </div>
                          )}

                          {setLogs.map((set, sIdx) => (
                            <div key={sIdx} className="flex items-center gap-2 sm:gap-3 bg-[#0f0f12] p-2 border border-white/5 rounded-none">
                              {/* Set Label */}
                              <span className="w-8 text-center text-white font-mono font-bold text-xs">{sIdx + 1}</span>

                              {/* Weight Counter */}
                              <div className="flex-1 flex items-center justify-between bg-black border border-white/5">
                                <button
                                  type="button"
                                  onClick={() => updateSet(activeExerciseSection, currentDayPlan.day, exIdx, sIdx, "weight", Math.max(0, set.weight - 2.5))}
                                  className="h-9 w-9 text-[#96979c] hover:text-white flex items-center justify-center touch-manipulation hover:bg-white/5"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <input
                                  type="number"
                                  value={set.weight || ""}
                                  placeholder="0"
                                  onChange={(e) => updateSet(activeExerciseSection, currentDayPlan.day, exIdx, sIdx, "weight", Number(e.target.value))}
                                  className="w-full bg-transparent text-white text-center text-sm font-mono focus:outline-none font-bold min-w-0"
                                />
                                <button
                                  type="button"
                                  onClick={() => updateSet(activeExerciseSection, currentDayPlan.day, exIdx, sIdx, "weight", set.weight + 2.5)}
                                  className="h-9 w-9 text-[#96979c] hover:text-white flex items-center justify-center touch-manipulation hover:bg-white/5"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* Reps Counter */}
                              <div className="flex-1 flex items-center justify-between bg-black border border-white/5">
                                <button
                                  type="button"
                                  onClick={() => updateSet(activeExerciseSection, currentDayPlan.day, exIdx, sIdx, "reps", Math.max(0, set.reps - 1))}
                                  className="h-9 w-9 text-[#96979c] hover:text-white flex items-center justify-center touch-manipulation hover:bg-white/5"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <input
                                  type="number"
                                  value={set.reps || ""}
                                  placeholder="0"
                                  onChange={(e) => updateSet(activeExerciseSection, currentDayPlan.day, exIdx, sIdx, "reps", Number(e.target.value))}
                                  className="w-full bg-transparent text-white text-center text-sm font-mono focus:outline-none font-bold min-w-0"
                                />
                                <button
                                  type="button"
                                  onClick={() => updateSet(activeExerciseSection, currentDayPlan.day, exIdx, sIdx, "reps", set.reps + 1)}
                                  className="h-9 w-9 text-[#96979c] hover:text-white flex items-center justify-center touch-manipulation hover:bg-white/5"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* Complete Switch */}
                              <button
                                type="button"
                                onClick={() => {
                                  updateSet(activeExerciseSection, currentDayPlan.day, exIdx, sIdx, "completed", !set.completed);
                                  if (!set.completed) {
                                    startTimer(90); // Auto-start rest timer
                                  }
                                }}
                                className={cn(
                                  "h-9 w-10 border transition-all duration-300 flex items-center justify-center rounded-none touch-manipulation",
                                  set.completed
                                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                    : "bg-transparent border-white/5 text-white/30 hover:text-white hover:border-white/10"
                                )}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>

                              {/* Delete set */}
                              <button
                                type="button"
                                onClick={() => deleteSet(activeExerciseSection, currentDayPlan.day, exIdx, sIdx)}
                                className="w-8 h-9 text-white/20 hover:text-[#eb0000] flex items-center justify-center touch-manipulation"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Control buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => addSet(activeExerciseSection, currentDayPlan.day, exIdx)}
                            className="flex-1 min-h-[48px] bg-white/5 border border-dashed border-white/10 text-white font-black text-xs uppercase tracking-widest rounded-none hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2 touch-manipulation"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Logged Set
                          </button>

                          <div className="flex gap-2 w-full sm:w-auto shrink-0">
                            {[60, 90, 120].map((s) => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => startTimer(s)}
                                className="px-4 min-h-[48px] bg-[#eb0000]/10 border border-[#eb0000]/20 text-[#eb0000] font-black text-[10px] uppercase tracking-wider rounded-none hover:bg-[#eb0000]/20 transition-all flex items-center justify-center touch-manipulation"
                              >
                                {s}s Rest
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}

      {swapModal && weeklyPlan && (
        <ExerciseSwapModal
          open
          onOpenChange={(open) => !open && setSwapModal(null)}
          disabled={isMutating}
          exercise={weeklyPlan[swapModal.dayIndex].exercises[swapModal.exerciseIndex]}
          dayName={weeklyPlan[swapModal.dayIndex].day}
          exerciseIndex={swapModal.exerciseIndex}
          onShuffle={async () => {
            await swapExercise(swapModal.dayIndex, swapModal.exerciseIndex, "shuffle");
            return null;
          }}
          onAiReplace={handleAiSwap}
          onReorder={async (direction) => {
            const to =
              direction === "up"
                ? swapModal.exerciseIndex - 1
                : swapModal.exerciseIndex + 1;
            await reorderExercises(swapModal.dayIndex, swapModal.exerciseIndex, to);
            setSwapModal({ ...swapModal, exerciseIndex: to });
          }}
          canMoveUp={swapModal.exerciseIndex > 0}
          canMoveDown={
            swapModal.exerciseIndex <
            weeklyPlan[swapModal.dayIndex].exercises.length - 1
          }
        />
      )}
    </div>
  );
}
