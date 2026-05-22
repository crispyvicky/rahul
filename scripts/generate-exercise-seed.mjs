/**
 * Generates supabase/migrations/20260519000003_seed_exercise_library.sql
 * from EXERCISE_LIBRARY in src/lib/exercise-library.ts
 *
 * Usage: node scripts/generate-exercise-seed.mjs
 */
import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import {
  EXERCISE_LIBRARY,
} from "../src/lib/exercise-library.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, "../supabase/migrations/20260519000003_seed_exercise_library.sql");

function esc(s) {
  return String(s).replace(/'/g, "''");
}

function categoryFor(group) {
  if (group === "warmup") return "warmup";
  if (group === "cooldown") return "cooldown";
  return "workout";
}

const lines = [
  "-- Auto-generated from EXERCISE_LIBRARY — re-run: node scripts/generate-exercise-seed.mjs",
  "INSERT INTO exercise_library (name, muscle_group, category, target_sets, target_reps, tip, steps)",
  "VALUES",
];

const values = EXERCISE_LIBRARY.map((ex) => {
  const steps = JSON.stringify(ex.steps ?? []).replace(/'/g, "''");
  return `  ('${esc(ex.name)}', '${esc(ex.group)}', '${categoryFor(ex.group)}', ${ex.targetSets}, '${esc(ex.targetReps)}', '${esc(ex.tip)}', '${steps}'::jsonb)`;
});

lines.push(values.join(",\n"));
lines.push("ON CONFLICT (name, muscle_group, category) DO UPDATE SET");
lines.push("  target_sets = EXCLUDED.target_sets,");
lines.push("  target_reps = EXCLUDED.target_reps,");
lines.push("  tip = EXCLUDED.tip,");
lines.push("  steps = EXCLUDED.steps;");

writeFileSync(outPath, lines.join("\n") + "\n", "utf8");
console.log(`Wrote ${EXERCISE_LIBRARY.length} exercises to ${outPath}`);
