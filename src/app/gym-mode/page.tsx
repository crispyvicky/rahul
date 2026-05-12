"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dumbbell, Plus, Minus, ChevronRight, Timer, CheckCircle, Volume2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const muscleGroups = [
  { id: "chest", label: "Chest", emoji: "🔥" },
  { id: "back", label: "Back", emoji: "💪" },
  { id: "shoulders", label: "Shoulders", emoji: "⚡" },
  { id: "legs", label: "Legs", emoji: "🦵" },
  { id: "arms", label: "Arms", emoji: "💪" },
  { id: "core", label: "Core", emoji: "🎯" },
];

const exercisesByGroup: Record<string, Array<{ name: string; targetSets: number; targetReps: string; tip: string }>> = {
  chest: [
    { name: "Flat Barbell Bench Press", targetSets: 4, targetReps: "8-10", tip: "Retract scapulae, arch back, drive feet into ground" },
    { name: "Incline Dumbbell Press", targetSets: 3, targetReps: "10-12", tip: "30° incline, squeeze at top, slow eccentric" },
    { name: "Cable Flyes", targetSets: 3, targetReps: "12-15", tip: "Slight bend in elbows, bring hands together" },
    { name: "Dips (Chest-focused)", targetSets: 3, targetReps: "10-12", tip: "Lean forward, elbows out, full stretch" },
  ],
  back: [
    { name: "Barbell Rows", targetSets: 4, targetReps: "8-10", tip: "Hinge at hips, pull to lower chest" },
    { name: "Pull-ups", targetSets: 4, targetReps: "8-12", tip: "Full dead hang, pull chest to bar" },
    { name: "Seated Cable Rows", targetSets: 3, targetReps: "10-12", tip: "Keep torso upright, drive elbows back" },
    { name: "Face Pulls", targetSets: 3, targetReps: "15-20", tip: "High pulley, external rotate at end" },
  ],
  shoulders: [
    { name: "Overhead Press", targetSets: 4, targetReps: "6-8", tip: "Brace core, press straight up" },
    { name: "Lateral Raises", targetSets: 4, targetReps: "12-15", tip: "Lead with elbows, pause at top" },
    { name: "Rear Delt Flyes", targetSets: 3, targetReps: "15-20", tip: "Bent over, squeeze rear delts" },
    { name: "Arnold Press", targetSets: 3, targetReps: "10-12", tip: "Rotate palms as you press up" },
  ],
  legs: [
    { name: "Barbell Back Squats", targetSets: 4, targetReps: "6-8", tip: "Break at hips, knees track toes" },
    { name: "Romanian Deadlifts", targetSets: 4, targetReps: "8-10", tip: "Soft knees, feel hamstring stretch" },
    { name: "Leg Press", targetSets: 3, targetReps: "10-12", tip: "Feet high for hams, low for quads" },
    { name: "Walking Lunges", targetSets: 3, targetReps: "12/leg", tip: "Long steps, upright torso" },
  ],
  arms: [
    { name: "Barbell Curls", targetSets: 3, targetReps: "10-12", tip: "Elbows locked at sides, squeeze at top" },
    { name: "Skull Crushers", targetSets: 3, targetReps: "10-12", tip: "Elbows pointed to ceiling" },
    { name: "Hammer Curls", targetSets: 3, targetReps: "12-15", tip: "Neutral grip for arm thickness" },
    { name: "Tricep Pushdowns", targetSets: 3, targetReps: "12-15", tip: "Keep elbows pinned, squeeze triceps" },
  ],
  core: [
    { name: "Hanging Leg Raises", targetSets: 3, targetReps: "12-15", tip: "Curl pelvis up, slow descent" },
    { name: "Cable Crunches", targetSets: 3, targetReps: "15-20", tip: "Round spine, ribs to hips" },
    { name: "Plank Hold", targetSets: 3, targetReps: "45-60s", tip: "Straight line head to heels" },
    { name: "Ab Wheel Rollouts", targetSets: 3, targetReps: "10-12", tip: "Extend as far as you can control" },
  ],
};

interface SetLog { weight: number; reps: number; completed: boolean; }

export default function GymModePage() {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [activeExercise, setActiveExercise] = useState<number | null>(null);
  const [sets, setSets] = useState<Record<string, SetLog[]>>({});
  const [restTimer, setRestTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  const exercises = selectedGroup ? exercisesByGroup[selectedGroup] || [] : [];

  const getSetLogs = (exIndex: number): SetLog[] => {
    const key = `${selectedGroup}-${exIndex}`;
    return sets[key] || [];
  };

  const addSet = (exIndex: number) => {
    const key = `${selectedGroup}-${exIndex}`;
    const current = sets[key] || [];
    const lastSet = current[current.length - 1];
    setSets({ ...sets, [key]: [...current, { weight: lastSet?.weight || 0, reps: 0, completed: false }] });
  };

  const updateSet = (exIndex: number, setIndex: number, field: keyof SetLog, value: number | boolean) => {
    const key = `${selectedGroup}-${exIndex}`;
    const current = [...(sets[key] || [])];
    current[setIndex] = { ...current[setIndex], [field]: value };
    setSets({ ...sets, [key]: current });
  };

  const startTimer = (seconds: number) => {
    setRestTimer(seconds);
    setTimerRunning(true);
    const interval = setInterval(() => {
      setRestTimer((prev) => {
        if (prev <= 1) { clearInterval(interval); setTimerRunning(false); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 pb-20">
      <div>
        <h1 className="text-white text-2xl sm:text-3xl font-black uppercase tracking-tighter font-heading">
          Gym <span className="text-brand">Mode</span>
        </h1>
        <p className="text-text-secondary text-sm mt-1">Real-time workout tracker & assistant</p>
      </div>

      {/* Floating rest timer */}
      <AnimatePresence>
        {timerRunning && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed z-40 bg-surface-card border border-brand/30 rounded-2xl p-4 shadow-[0_0_40px_rgba(235,0,0,0.2)] flex items-center gap-4 right-[max(1rem,env(safe-area-inset-right))] top-[max(5rem,calc(env(safe-area-inset-top)+4.5rem))] lg:right-8"
          >
            <Timer className="w-5 h-5 text-brand animate-pulse" />
            <span className="text-white text-2xl font-black font-heading tabular-nums">
              {Math.floor(restTimer / 60)}:{String(restTimer % 60).padStart(2, "0")}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Muscle group selection */}
      {!selectedGroup && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {muscleGroups.map((group, i) => (
            <motion.button
              key={group.id}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedGroup(group.id)}
              className="flex items-center gap-3 min-h-[52px] p-4 sm:p-5 bg-surface-card border border-white/5 rounded-2xl hover:border-brand/30 hover:bg-brand/5 transition-all group text-left touch-manipulation"
            >
              <span className="text-2xl">{group.emoji}</span>
              <div>
                <p className="text-white font-bold text-sm group-hover:text-brand transition-colors">{group.label}</p>
                <p className="text-text-muted text-xs">{(exercisesByGroup[group.id] || []).length} exercises</p>
              </div>
              <ChevronRight className="w-4 h-4 text-text-muted ml-auto" />
            </motion.button>
          ))}
        </div>
      )}

      {/* Exercise tracking */}
      {selectedGroup && (
        <>
          <button type="button" onClick={() => { setSelectedGroup(null); setActiveExercise(null); }}
            className="min-h-11 px-1 py-2 text-text-secondary text-xs font-bold uppercase tracking-widest hover:text-white transition-colors touch-manipulation text-left">
            ← Back to Groups
          </button>

          <div className="space-y-3">
            {exercises.map((ex, exIdx) => (
              <div key={exIdx} className="bg-surface-card border border-white/5 rounded-2xl overflow-hidden">
                <button type="button" onClick={() => setActiveExercise(activeExercise === exIdx ? null : exIdx)}
                  className="w-full min-h-[52px] flex items-center gap-3 p-4 sm:p-5 touch-manipulation">
                  <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
                    <Dumbbell className="w-5 h-5 text-brand" />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-white font-bold text-sm truncate">{ex.name}</p>
                    <p className="text-text-muted text-xs">{ex.targetSets} sets × {ex.targetReps}</p>
                  </div>
                  {getSetLogs(exIdx).filter(s => s.completed).length >= ex.targetSets && getSetLogs(exIdx).length > 0 && (
                    <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                  )}
                  <ChevronRight className={cn("w-4 h-4 text-text-muted transition-transform shrink-0", activeExercise === exIdx && "rotate-90")} />
                </button>

                <AnimatePresence>
                  {activeExercise === exIdx && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden">
                      <div className="px-4 pb-4 sm:px-5 sm:pb-5 space-y-3">
                        {/* Coach tip */}
                        <div className="flex items-start gap-2 p-3 bg-brand/5 border border-brand/10 rounded-xl">
                          <Volume2 className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                          <p className="text-text-secondary text-xs"><span className="text-brand font-bold">Coach: </span>{ex.tip}</p>
                        </div>

                        {/* Sets */}
                        <div className="space-y-2 overflow-x-auto pb-1 -mx-1 px-1 touch-pan-x">
                          <div className="flex items-center gap-3 px-2 text-text-muted text-[10px] font-bold uppercase tracking-widest min-w-[280px]">
                            <span className="w-6">Set</span>
                            <span className="flex-1 text-center">Weight (kg)</span>
                            <span className="flex-1 text-center">Reps</span>
                            <span className="w-8 text-center">Done</span>
                          </div>
                          {getSetLogs(exIdx).map((set, sIdx) => (
                            <div key={sIdx} className="flex items-center gap-2 sm:gap-3 min-w-[280px]">
                              <span className="w-6 text-text-muted text-xs font-mono text-center">{sIdx + 1}</span>
                              <div className="flex-1 flex items-center gap-1">
                                <button type="button" onClick={() => updateSet(exIdx, sIdx, "weight", Math.max(0, set.weight - 2.5))}
                                  className="min-h-10 min-w-10 h-10 w-10 bg-white/5 rounded-lg flex items-center justify-center text-text-muted hover:text-white shrink-0 touch-manipulation">
                                  <Minus className="w-4 h-4" />
                                </button>
                                <input type="number" value={set.weight}
                                  onChange={(e) => updateSet(exIdx, sIdx, "weight", Number(e.target.value))}
                                  className="w-full min-w-0 bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-white text-center text-base sm:text-sm focus:outline-none focus:border-brand" />
                                <button type="button" onClick={() => updateSet(exIdx, sIdx, "weight", set.weight + 2.5)}
                                  className="min-h-10 min-w-10 h-10 w-10 bg-white/5 rounded-lg flex items-center justify-center text-text-muted hover:text-white shrink-0 touch-manipulation">
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                              <div className="flex-1 flex items-center gap-1">
                                <button type="button" onClick={() => updateSet(exIdx, sIdx, "reps", Math.max(0, set.reps - 1))}
                                  className="min-h-10 min-w-10 h-10 w-10 bg-white/5 rounded-lg flex items-center justify-center text-text-muted hover:text-white shrink-0 touch-manipulation">
                                  <Minus className="w-4 h-4" />
                                </button>
                                <input type="number" value={set.reps}
                                  onChange={(e) => updateSet(exIdx, sIdx, "reps", Number(e.target.value))}
                                  className="w-full min-w-0 bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-white text-center text-base sm:text-sm focus:outline-none focus:border-brand" />
                                <button type="button" onClick={() => updateSet(exIdx, sIdx, "reps", set.reps + 1)}
                                  className="min-h-10 min-w-10 h-10 w-10 bg-white/5 rounded-lg flex items-center justify-center text-text-muted hover:text-white shrink-0 touch-manipulation">
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                              <button type="button" onClick={() => { updateSet(exIdx, sIdx, "completed", !set.completed); if (!set.completed) startTimer(90); }}
                                className={cn("min-h-10 min-w-10 h-10 w-10 rounded-lg flex items-center justify-center transition-all shrink-0 touch-manipulation",
                                  set.completed ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-text-muted hover:text-white")}>
                                <CheckCircle className="w-5 h-5" />
                              </button>
                            </div>
                          ))}
                        </div>

                        <button type="button" onClick={() => addSet(exIdx)}
                          className="w-full min-h-11 py-3 bg-white/5 border border-dashed border-white/10 text-text-secondary font-bold text-xs uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 hover:text-white transition-all touch-manipulation">
                          <Plus className="w-3.5 h-3.5" /> Add Set
                        </button>

                        <div className="flex gap-2">
                          {[60, 90, 120].map((s) => (
                            <button type="button" key={s} onClick={() => startTimer(s)}
                              className="flex-1 min-h-11 py-3 bg-brand/10 border border-brand/20 text-brand font-bold text-xs rounded-lg hover:bg-brand/20 transition-all touch-manipulation">
                              {s}s Rest
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
