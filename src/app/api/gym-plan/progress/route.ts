import { NextRequest, NextResponse } from "next/server";
import { upsertDailyProgress, computeDashboardFromPlan } from "@/lib/gym-plan-service";
import type { DayPlan, SetLog } from "@/lib/gym-plan-types";
import { hasCompletedActionToday, logWorkout } from "@/lib/supabase-service";
import { assertBodyUserMatchesSession } from "@/lib/points-service";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    userId,
    setLogs,
    weeklyPlan,
  }: {
    userId: string;
    setLogs: Record<string, SetLog[]>;
    weeklyPlan: DayPlan[] | null;
  } = body;

  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  const sessionCheck = await assertBodyUserMatchesSession(userId);
  if ("error" in sessionCheck) return sessionCheck.error;

  const today = new Date().toISOString().slice(0, 10);
  const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const computed = computeDashboardFromPlan(weeklyPlan, setLogs ?? {});

  await upsertDailyProgress(sessionCheck.userId, today, {
    dayName: todayName,
    completionPct:
      computed.workoutsTotal > 0
        ? Math.round((computed.workoutsCompleted / computed.workoutsTotal) * 100)
        : 0,
    exercisesCompleted: computed.workoutsCompleted,
    exercisesTotal: computed.workoutsTotal,
    setLogs: setLogs ?? {},
  });

  const dayComplete =
    computed.workoutsTotal > 0 &&
    computed.workoutsCompleted >= computed.workoutsTotal;

  if (dayComplete) {
    const already = await hasCompletedActionToday(sessionCheck.userId, "workout");
    if (!already) {
      const dayPlan = weeklyPlan?.find((d) => d.day === todayName);
      const muscle = dayPlan?.muscleGroups?.[0] || "Full body";
      await logWorkout(sessionCheck.userId, muscle, setLogs ?? {}, 0);
    }
  }

  return NextResponse.json({ ok: true, dayComplete });
}
