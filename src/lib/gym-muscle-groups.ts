import type { WeeklySchedule } from "./gym-plan-types";
import type { ExercisePoolItem } from "./exercise-library-data";
import type { DayPlan } from "./gym-plan-types";

export const GYM_MUSCLE_GROUPS = [
  { id: "chest", label: "Chest", emoji: "🔥" },
  { id: "back", label: "Back", emoji: "💪" },
  { id: "shoulders", label: "Shoulders", emoji: "⚡" },
  { id: "legs", label: "Legs", emoji: "🦵" },
  { id: "biceps", label: "Biceps", emoji: "💪" },
  { id: "triceps", label: "Triceps", emoji: "🦾" },
  { id: "core", label: "Core", emoji: "🎯" },
] as const;

export const UPPER_BODY_MUSCLE_IDS = [
  "chest",
  "back",
  "shoulders",
  "biceps",
  "triceps",
] as const;

export function getMuscleLabel(id: string): string {
  return GYM_MUSCLE_GROUPS.find((g) => g.id === id)?.label ?? id;
}

/** Map legacy combined "arms" schedule to biceps + triceps. */
export function migrateGymSchedule(schedule: WeeklySchedule): WeeklySchedule {
  const migrated: WeeklySchedule = {};
  for (const day of Object.keys(schedule)) {
    const muscles = schedule[day] || [];
    const next: string[] = [];
    for (const m of muscles) {
      if (m === "arms" || m === "arm") {
        if (!next.includes("biceps")) next.push("biceps");
        if (!next.includes("triceps")) next.push("triceps");
      } else if (m === "bicep") {
        if (!next.includes("biceps")) next.push("biceps");
      } else if (m === "tricep") {
        if (!next.includes("triceps")) next.push("triceps");
      } else if (!next.includes(m)) {
        next.push(m);
      }
    }
    migrated[day] = next;
  }
  return migrated;
}

function inferArmGroup(name: string): "biceps" | "triceps" {
  const n = name.toLowerCase();
  if (
    n.includes("tricep") ||
    n.includes("pushdown") ||
    n.includes("skull") ||
    n.includes("kickback") ||
    n.includes("close grip") ||
    n.includes("dip") && !n.includes("grip")
  ) {
    return "triceps";
  }
  return "biceps";
}

export function migrateExerciseItem(ex: ExercisePoolItem): ExercisePoolItem {
  if (ex.group !== "arms") return ex;
  const group = inferArmGroup(ex.name);
  return { ...ex, group };
}

export function migrateWeeklyPlan(plan: DayPlan[] | null): DayPlan[] | null {
  if (!plan) return null;
  return plan.map((day) => ({
    ...day,
    muscleGroups: migrateGymSchedule({ [day.day]: day.muscleGroups })[day.day] || [],
    exercises: day.exercises.map(migrateExerciseItem),
    warmups: day.warmups.map(migrateExerciseItem),
    cooldowns: day.cooldowns.map(migrateExerciseItem),
  }));
}
