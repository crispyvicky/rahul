import { NextRequest, NextResponse } from "next/server";
import { createAiWeeklyPlan } from "@/lib/gym-plan-service";
import type { DayPlan, WeeklySchedule } from "@/lib/gym-plan-types";
import { invalidUserIdResponse, isUuidUserId } from "@/lib/api-guards";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    userId,
    schedule,
    planData,
    aiPlanId,
  }: {
    userId: string;
    schedule: WeeklySchedule;
    planData: DayPlan[];
    aiPlanId: string;
  } = body;

  if (!userId || !planData || !aiPlanId) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (!isUuidUserId(userId)) {
    return invalidUserIdResponse();
  }

  const saved = await createAiWeeklyPlan(userId, schedule, planData, aiPlanId);
  return NextResponse.json({ weeklyPlanId: saved?.id ?? null });
}
