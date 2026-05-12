import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database tables
export interface DbUserProfile {
  id: string;
  google_id: string;
  name: string;
  email: string;
  avatar_url: string;
  instagram_handle: string;
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
