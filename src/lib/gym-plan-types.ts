import type { ExercisePoolItem } from "./exercise-library";

export type { ExercisePoolItem };

export interface SetLog {
  weight: number;
  reps: number;
  completed: boolean;
}

export interface DayPlan {
  day: string;
  muscleGroups: string[];
  warmups: ExercisePoolItem[];
  exercises: ExercisePoolItem[];
  cooldowns: ExercisePoolItem[];
}

export type WeeklySchedule = Record<string, string[]>;

export interface DbGymWeeklyPlan {
  id: string;
  user_id: string;
  week_start_date: string;
  schedule: WeeklySchedule;
  plan_data: DayPlan[];
  is_active: boolean;
  source: "manual" | "ai";
  ai_plan_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbDailyProgress {
  id: string;
  user_id: string;
  progress_date: string;
  day_name: string | null;
  completion_pct: number;
  exercises_completed: number;
  exercises_total: number;
  set_logs: Record<string, SetLog[]>;
  created_at: string;
  updated_at: string;
}

export interface DashboardGymData {
  weeklyPlan: DayPlan[] | null;
  schedule: WeeklySchedule;
  setLogs: Record<string, SetLog[]>;
  weeklyCompletion: { day: string; value: number }[];
  todayExercises: { name: string; sets: string; muscle: string }[];
  workoutsCompleted: number;
  workoutsTotal: number;
}
