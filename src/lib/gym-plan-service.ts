import { supabase } from "./supabase";
import type {
  DayPlan,
  WeeklySchedule,
  SetLog,
  DbGymWeeklyPlan,
  DbDailyProgress,
  DashboardGymData,
} from "./gym-plan-types";
import type { ExercisePoolItem } from "./exercise-library";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const DAY_ABBREVS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function isUuidUserId(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

function weekStartDate(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().slice(0, 10);
}

export async function getActiveWeeklyPlan(
  userId: string
): Promise<DbGymWeeklyPlan | null> {
  if (!isUuidUserId(userId)) return null;

  const { data, error } = await supabase
    .from("gym_weekly_plans")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.warn("[getActiveWeeklyPlan]", error.message);
    return null;
  }
  return data as DbGymWeeklyPlan | null;
}

export async function saveWeeklyPlan(
  userId: string,
  schedule: WeeklySchedule,
  planData: DayPlan[],
  options?: { source?: "manual" | "ai"; aiPlanId?: string }
): Promise<DbGymWeeklyPlan | null> {
  if (!isUuidUserId(userId)) return null;

  const existing = await getActiveWeeklyPlan(userId);
  const payload = {
    user_id: userId,
    week_start_date: weekStartDate(),
    schedule,
    plan_data: planData,
    is_active: true,
    source: options?.source ?? "manual",
    ai_plan_id: options?.aiPlanId ?? null,
    updated_at: new Date().toISOString(),
  };

  if (existing) {
    const { data, error } = await supabase
      .from("gym_weekly_plans")
      .update(payload)
      .eq("id", existing.id)
      .select()
      .single();
    if (error) {
      console.warn("[saveWeeklyPlan update]", error.message);
      return null;
    }
    return data as DbGymWeeklyPlan;
  }

  const { data, error } = await supabase
    .from("gym_weekly_plans")
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.warn("[saveWeeklyPlan insert]", error.message);
    return null;
  }
  return data as DbGymWeeklyPlan;
}

export async function createAiWeeklyPlan(
  userId: string,
  schedule: WeeklySchedule,
  planData: DayPlan[],
  aiPlanId: string
): Promise<DbGymWeeklyPlan | null> {
  if (!isUuidUserId(userId)) return null;

  await supabase
    .from("gym_weekly_plans")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("is_active", true);

  return saveWeeklyPlan(userId, schedule, planData, {
    source: "ai",
    aiPlanId,
  });
}

export async function logExerciseSwap(
  userId: string,
  params: {
    weeklyPlanId?: string;
    dayName: string;
    exerciseIndex: number;
    section?: string;
    fromExercise: ExercisePoolItem;
    toExercise: ExercisePoolItem;
    swapType: "shuffle" | "manual" | "ai_suggestion" | "reorder";
  }
): Promise<boolean> {
  if (!isUuidUserId(userId)) return false;

  const { error } = await supabase.from("exercise_swaps").insert({
    user_id: userId,
    weekly_plan_id: params.weeklyPlanId ?? null,
    day_name: params.dayName,
    exercise_index: params.exerciseIndex,
    section: params.section ?? "workout",
    from_exercise: params.fromExercise,
    to_exercise: params.toExercise,
    swap_type: params.swapType,
  });

  if (error) {
    console.warn("[logExerciseSwap]", error.message);
    return false;
  }
  return true;
}

export async function upsertDailyProgress(
  userId: string,
  progressDate: string,
  payload: {
    dayName?: string;
    completionPct: number;
    exercisesCompleted: number;
    exercisesTotal: number;
    setLogs: Record<string, SetLog[]>;
  }
): Promise<DbDailyProgress | null> {
  if (!isUuidUserId(userId)) return null;

  const row = {
    user_id: userId,
    progress_date: progressDate,
    day_name: payload.dayName ?? null,
    completion_pct: payload.completionPct,
    exercises_completed: payload.exercisesCompleted,
    exercises_total: payload.exercisesTotal,
    set_logs: payload.setLogs,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("daily_progress")
    .upsert(row, { onConflict: "user_id,progress_date" })
    .select()
    .single();

  if (error) {
    console.warn("[upsertDailyProgress]", error.message);
    return null;
  }
  return data as DbDailyProgress;
}

export async function getDailyProgressRange(
  userId: string,
  fromDate: string,
  toDate: string
): Promise<DbDailyProgress[]> {
  if (!isUuidUserId(userId)) return [];

  const { data, error } = await supabase
    .from("daily_progress")
    .select("*")
    .eq("user_id", userId)
    .gte("progress_date", fromDate)
    .lte("progress_date", toDate)
    .order("progress_date", { ascending: true });

  if (error) return [];
  return (data as DbDailyProgress[]) || [];
}

export function computeDashboardFromPlan(
  weeklyPlan: DayPlan[] | null,
  setLogs: Record<string, SetLog[]>
): Omit<DashboardGymData, "weeklyPlan" | "schedule" | "setLogs"> {
  const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const todayPlan = weeklyPlan?.find((dp) => dp.day === todayName);

  const todayExercises =
    todayPlan?.exercises?.length
      ? todayPlan.exercises.map((ex) => ({
          name: ex.name,
          sets: `${ex.targetSets} sets`,
          muscle: ex.group ? ex.group.toUpperCase() : "WORKOUT",
        }))
      : [];

  let workoutsCompleted = 0;
  const workoutsTotal = todayPlan?.exercises?.length ?? 0;

  if (todayPlan?.exercises) {
    todayPlan.exercises.forEach((_, idx) => {
      const key = `workout-${todayName}-${idx}`;
      const logged = setLogs[key] || [];
      if (logged.length > 0 && logged.every((s) => s.completed)) {
        workoutsCompleted++;
      }
    });
  }

  const weeklyCompletion = DAYS_OF_WEEK.map((dayName, idx) => {
    const dayPlan = weeklyPlan?.find((dp) => dp.day === dayName);
    if (!dayPlan?.exercises?.length) {
      return { day: DAY_ABBREVS[idx], value: 0 };
    }
    let completed = 0;
    dayPlan.exercises.forEach((_, exIdx) => {
      const key = `workout-${dayName}-${exIdx}`;
      const logged = setLogs[key] || [];
      if (logged.length > 0 && logged.every((s) => s.completed)) {
        completed++;
      }
    });
    const pct = Math.round((completed / dayPlan.exercises.length) * 100);
    return { day: DAY_ABBREVS[idx], value: pct };
  });

  return {
    weeklyCompletion,
    todayExercises,
    workoutsCompleted,
    workoutsTotal,
  };
}

export async function fetchDashboardGymData(
  userId: string
): Promise<DashboardGymData | null> {
  if (!isUuidUserId(userId)) return null;

  const plan = await getActiveWeeklyPlan(userId);
  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  const progressRows = await getDailyProgressRange(userId, weekAgo, today);

  const setLogs: Record<string, SetLog[]> = {};
  progressRows.forEach((row) => {
    if (row.set_logs && typeof row.set_logs === "object") {
      Object.assign(setLogs, row.set_logs);
    }
  });

  const todayProgress = progressRows.find((r) => r.progress_date === today);
  if (todayProgress?.set_logs) {
    Object.assign(setLogs, todayProgress.set_logs);
  }

  const weeklyPlan = plan?.plan_data ?? null;
  const schedule = (plan?.schedule as WeeklySchedule) ?? {};
  const computed = computeDashboardFromPlan(weeklyPlan, setLogs);

  return {
    weeklyPlan,
    schedule,
    setLogs,
    ...computed,
  };
}
