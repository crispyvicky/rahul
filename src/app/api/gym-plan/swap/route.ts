import { NextRequest, NextResponse } from "next/server";
import { logExerciseSwap, saveWeeklyPlan } from "@/lib/gym-plan-service";
import type { DayPlan, WeeklySchedule } from "@/lib/gym-plan-types";
import type { ExercisePoolItem } from "@/lib/exercise-library";
import { invalidUserIdResponse, isUuidUserId } from "@/lib/api-guards";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    userId,
    weeklyPlanId,
    dayName,
    exerciseIndex,
    fromExercise,
    toExercise,
    swapType,
    planData,
    schedule,
    section,
  }: {
    userId: string;
    weeklyPlanId?: string;
    dayName: string;
    exerciseIndex: number;
    fromExercise: ExercisePoolItem;
    toExercise: ExercisePoolItem;
    swapType: "shuffle" | "manual" | "ai_suggestion" | "reorder";
    planData: DayPlan[];
    schedule: WeeklySchedule;
    section?: string;
  } = body;

  if (!userId || !planData || !schedule) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (!isUuidUserId(userId)) {
    return invalidUserIdResponse();
  }

  await logExerciseSwap(userId, {
    weeklyPlanId,
    dayName,
    exerciseIndex,
    section,
    fromExercise,
    toExercise,
    swapType: swapType ?? "shuffle",
  });

  const saved = await saveWeeklyPlan(userId, schedule, planData);
  return NextResponse.json({ weeklyPlanId: saved?.id ?? weeklyPlanId ?? null });
}
