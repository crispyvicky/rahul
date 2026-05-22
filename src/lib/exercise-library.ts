import {
  exercisePool,
  warmupPool,
  cooldownPool,
  type ExercisePoolItem,
} from "./exercise-library-data";

export type { ExercisePoolItem };
export { exercisePool, warmupPool, cooldownPool };

/** Flat catalog for DB seeding and swap lookups */
export const EXERCISE_LIBRARY: ExercisePoolItem[] = [
  ...Object.values(warmupPool).flat(),
  ...Object.values(cooldownPool).flat(),
  ...Object.values(exercisePool).flat(),
];

export function getExercisesByGroup(group: string): ExercisePoolItem[] {
  if (group === "warmup") return Object.values(warmupPool).flat();
  if (group === "cooldown") return Object.values(cooldownPool).flat();
  return exercisePool[group] ?? [];
}

export function pickRandomSwap(
  current: ExercisePoolItem,
  usedNames: string[]
): ExercisePoolItem | null {
  const pool = getExercisesByGroup(current.group);
  const available = pool.filter((ex) => !usedNames.includes(ex.name));
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}
