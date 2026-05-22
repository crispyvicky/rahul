import { NextRequest, NextResponse } from "next/server";
import { pickRandomSwap } from "@/lib/exercise-library";
import { saveAiPlan } from "@/lib/supabase-service";
import { logExerciseSwap, saveWeeklyPlan } from "@/lib/gym-plan-service";
import type { DayPlan, WeeklySchedule } from "@/lib/gym-plan-types";
import type { ExercisePoolItem } from "@/lib/exercise-library";
import { consumeAiRateLimit, getAiClientIp } from "@/lib/ai-rate-limit";
import { invalidUserIdResponse, isUuidUserId } from "@/lib/api-guards";

export const runtime = "nodejs";

/** Suggest replacement exercise; persists ai_plans row + gym_weekly_plan update */
export async function POST(req: NextRequest) {
  const rl = consumeAiRateLimit(getAiClientIp(req), "gym");
  if (rl.ok === false) {
    return NextResponse.json(
      { error: rl.message, retryAfterSec: rl.retryAfterSec },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  const body = await req.json();
  const {
    userId,
    currentExercise,
    usedNames,
    dayName,
    exerciseIndex,
    planData,
    schedule,
    weeklyPlanId,
  }: {
    userId: string;
    currentExercise: ExercisePoolItem;
    usedNames: string[];
    dayName: string;
    exerciseIndex: number;
    planData: DayPlan[];
    schedule: WeeklySchedule;
    weeklyPlanId?: string;
  } = body;

  if (!userId || !currentExercise || !planData) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (!isUuidUserId(userId)) {
    return invalidUserIdResponse();
  }

  let suggestion = pickRandomSwap(currentExercise, usedNames);
  if (!suggestion) {
    return NextResponse.json({ error: "No alternatives available" }, { status: 404 });
  }

  try {
    const { generateAiText, isMimoConfigured, isGoogleConfigured } = await import(
      "@/lib/ai-provider"
    );
    if (isMimoConfigured() || isGoogleConfigured()) {
      const prompt = `You are a strength coach. Suggest ONE alternative to "${currentExercise.name}" for ${currentExercise.group} day.
Return JSON only: {"name":"...","targetSets":3,"targetReps":"8-12","tip":"one line","steps":["step1","step2"]}`;
      const { text } = await generateAiText(prompt, { jsonMode: true });
      if (text) {
        const parsed = JSON.parse(text);
        suggestion = {
          ...suggestion,
          name: parsed.name || suggestion.name,
          targetSets: parsed.targetSets ?? suggestion.targetSets,
          targetReps: parsed.targetReps ?? suggestion.targetReps,
          tip: parsed.tip || suggestion.tip,
          steps: Array.isArray(parsed.steps) ? parsed.steps : suggestion.steps,
          group: currentExercise.group,
        };
      }
    }
  } catch {
    // keep library pick
  }

  const aiPlan = await saveAiPlan(userId, "workout", {
    type: "exercise_swap_suggestion",
    day: dayName,
    from: currentExercise,
    to: suggestion,
  });

  const updatedPlan = planData.map((day) => {
    if (day.day !== dayName) return day;
    return {
      ...day,
      exercises: day.exercises.map((ex, i) =>
        i === exerciseIndex ? suggestion! : ex
      ),
    };
  });

  await logExerciseSwap(userId, {
    weeklyPlanId,
    dayName,
    exerciseIndex,
    fromExercise: currentExercise,
    toExercise: suggestion,
    swapType: "ai_suggestion",
  });

  const saved = await saveWeeklyPlan(userId, schedule, updatedPlan, {
    source: "ai",
    aiPlanId: aiPlan?.id,
  });

  return NextResponse.json({
    suggestion,
    weeklyPlanId: saved?.id ?? weeklyPlanId,
    aiPlanId: aiPlan?.id ?? null,
    planData: updatedPlan,
  });
}
