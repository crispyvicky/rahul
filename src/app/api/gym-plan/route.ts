import { NextRequest, NextResponse } from "next/server";
import {
  getActiveWeeklyPlan,
  saveWeeklyPlan,
} from "@/lib/gym-plan-service";
import type { DayPlan, WeeklySchedule } from "@/lib/gym-plan-types";
import { invalidUserIdResponse, isUuidUserId } from "@/lib/api-guards";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  if (!isUuidUserId(userId)) {
    return invalidUserIdResponse();
  }

  const plan = await getActiveWeeklyPlan(userId);
  const today = new Date().toISOString().slice(0, 10);

  let sets: Record<string, unknown> = {};
  if (plan) {
    const { data } = await import("@/lib/supabase").then(({ supabase }) =>
      supabase
        .from("daily_progress")
        .select("set_logs")
        .eq("user_id", userId)
        .eq("progress_date", today)
        .maybeSingle()
    );
    if (data?.set_logs) sets = data.set_logs as Record<string, unknown>;
  }

  return NextResponse.json({
    plan: plan?.plan_data ?? null,
    schedule: (plan?.schedule as WeeklySchedule) ?? {},
    sets,
    weeklyPlanId: plan?.id ?? null,
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    userId,
    schedule,
    planData,
    source,
    reset,
  }: {
    userId: string;
    schedule?: WeeklySchedule;
    planData?: DayPlan[] | null;
    source?: "manual" | "ai";
    reset?: boolean;
  } = body;

  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  if (!isUuidUserId(userId)) {
    return invalidUserIdResponse();
  }

  if (reset) {
    const { supabase } = await import("@/lib/supabase");
    await supabase
      .from("gym_weekly_plans")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("is_active", true);
    return NextResponse.json({ ok: true });
  }

  if (!schedule) {
    return NextResponse.json({ error: "schedule required" }, { status: 400 });
  }

  const existing = await getActiveWeeklyPlan(userId);
  const planToSave = planData ?? (existing?.plan_data as DayPlan[]) ?? [];

  const saved = await saveWeeklyPlan(userId, schedule, planToSave, { source });
  return NextResponse.json({ weeklyPlanId: saved?.id ?? null });
}
