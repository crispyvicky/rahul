import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function hasSupabase(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  );
}

/** Lazy client — safe to import during `next build` when env is not loaded yet. */
export function getSupabase(): SupabaseClient {
  if (client) return client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Add them in Vercel → Settings → Environment Variables."
    );
  }

  client = createClient(supabaseUrl, supabaseAnonKey);
  return client;
}

/** Back-compat: defers createClient until first use (not at module load). */
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    return Reflect.get(getSupabase(), prop, receiver);
  },
});

// Types for our database tables
export interface DbUserProfile {
  id: string;
  google_id: string;
  name: string;
  email: string;
  avatar_url: string;
  instagram_handle: string;
  phone?: string | null;
  is_premium: boolean;
  premium_tier: "free" | "warrior" | "elite" | "custom";
  xp_points: number;
  giveaway_points: number;
  current_streak: number;
  longest_streak: number;
  last_login: string;
  referral_code: string;
  referred_by: string | null;
  is_following_ig: boolean;
  onboarding_completed: boolean;
  onboarding_data: any;
  created_at: string;
  updated_at: string;
}

export interface DbGiveaway {
  id: string;
  title: string;
  description: string;
  prize: string;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  created_at: string;
}

export interface DbPointLog {
  id: string;
  user_id: string;
  action: string;
  points: number;
  description: string;
  giveaway_id: string | null;
  created_at: string;
}

export interface DbWorkoutLog {
  id: string;
  user_id: string;
  muscle_group: string;
  exercises: any;
  duration_mins: number;
  xp_earned: number;
  created_at: string;
}

export interface DbCommunityPost {
  id: string;
  user_id: string;
  content: string;
  post_type: "transformation" | "progress" | "tip";
  before_image: string | null;
  after_image: string | null;
  likes_count: number;
  comments_count: number;
  is_featured: boolean;
  created_at: string;
}

export interface DbPostComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user_profiles?:
    | { name: string; avatar_url: string | null }
    | { name: string; avatar_url: string | null }[];
}

export interface DbGymWeeklyPlan {
  id: string;
  user_id: string;
  week_start_date: string;
  schedule: Record<string, string[]>;
  plan_data: unknown[];
  is_active: boolean;
  source: "manual" | "ai";
  ai_plan_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbExerciseLibrary {
  id: string;
  name: string;
  muscle_group: string;
  category: "workout" | "warmup" | "cooldown";
  target_sets: number;
  target_reps: string;
  tip: string;
  steps: string[];
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface DbExerciseSwap {
  id: string;
  user_id: string;
  weekly_plan_id: string | null;
  day_name: string;
  exercise_index: number;
  section: string;
  from_exercise: unknown;
  to_exercise: unknown;
  swap_type: string;
  created_at: string;
}

export interface DbDailyProgress {
  id: string;
  user_id: string;
  progress_date: string;
  day_name: string | null;
  completion_pct: number;
  exercises_completed: number;
  exercises_total: number;
  set_logs: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface DbNotificationQueue {
  id: string;
  user_id: string;
  notification_type: string;
  title: string;
  body: string | null;
  payload: Record<string, unknown>;
  status: "pending" | "sent" | "failed" | "cancelled";
  scheduled_for: string;
  sent_at: string | null;
  created_at: string;
}
