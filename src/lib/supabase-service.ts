import { supabase } from "./supabase";
import type { DbUserProfile } from "./supabase";

// ─── USER PROFILE ────────────────────────────────────────

export async function upsertUserProfile(userData: {
  google_id: string;
  name: string;
  email: string;
  avatar_url: string;
}) {
  // Generate a unique referral code
  const referralCode = `RF-${userData.name.toUpperCase().replace(/\s+/g, "").slice(0, 4)}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  const { data, error } = await supabase
    .from("user_profiles")
    .upsert(
      {
        google_id: userData.google_id,
        name: userData.name,
        email: userData.email,
        avatar_url: userData.avatar_url,
        referral_code: referralCode,
        last_login: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "email" }
    )
    .select()
    .single();

  if (error) {
    console.error("Upsert user error:", error);
    return null;
  }
  return data as DbUserProfile;
}

export async function getUserProfile(email: string) {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("email", email)
    .single();

  if (error) return null;
  return data as DbUserProfile;
}

export async function updateUserProfile(userId: string, updates: Partial<DbUserProfile>) {
  const { data, error } = await supabase
    .from("user_profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    console.error("Update profile error:", error);
    return null;
  }
  return data as DbUserProfile;
}

// ─── GIVEAWAY POINTS ─────────────────────────────────────

export async function addGiveawayPoints(
  userId: string,
  action: string,
  points: number,
  description: string,
  giveawayId?: string
) {
  // Log the point action
  const { error: logError } = await supabase.from("point_logs").insert({
    user_id: userId,
    action,
    points,
    description,
    giveaway_id: giveawayId || null,
  });

  if (logError) {
    console.error("Point log error:", logError);
    return false;
  }

  // Update user's total giveaway points and XP
  const { error: updateError } = await supabase.rpc("increment_points", {
    p_user_id: userId,
    p_giveaway_points: points,
    p_xp_points: Math.round(points * 0.5),
  });

  // Fallback if RPC doesn't exist yet — manual update
  if (updateError) {
    const profile = await getUserProfileById(userId);
    if (profile) {
      await supabase
        .from("user_profiles")
        .update({
          giveaway_points: profile.giveaway_points + points,
          xp_points: profile.xp_points + Math.round(points * 0.5),
        })
        .eq("id", userId);
    }
  }

  return true;
}

export async function getUserProfileById(userId: string) {
  const { data } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", visibilityId(userId))
    .single();
  return data as DbUserProfile | null;
}

function visibilityId(id: string) {
  return id;
}

export async function getGiveawayLeaderboard(limit = 20) {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("id, name, avatar_url, giveaway_points, current_streak")
    .order("giveaway_points", { ascending: false })
    .limit(limit);

  if (error) return [];
  return data;
}

export async function getActiveGiveaway() {
  const { data, error } = await supabase
    .from("giveaways")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error) return null;
  return data;
}

export async function getUserPointLogs(userId: string) {
  const { data } = await supabase
    .from("point_logs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  return data || [];
}

// Check if user already performed a one-time action
export async function hasCompletedAction(userId: string, action: string) {
  const { data } = await supabase
    .from("point_logs")
    .select("id")
    .eq("user_id", userId)
    .eq("action", action)
    .limit(1);

  return (data && data.length > 0) || false;
}

// ─── WORKOUT LOGS ────────────────────────────────────────

export async function logWorkout(
  userId: string,
  muscleGroup: string,
  exercises: any,
  durationMins: number
) {
  const { data, error } = await supabase
    .from("workout_logs")
    .insert({
      user_id: userId,
      muscle_group: muscleGroup,
      exercises,
      duration_mins: durationMins,
      xp_earned: 25,
    })
    .select()
    .single();

  if (error) {
    console.error("Log workout error:", error);
    return null;
  }

  // Award XP + giveaway points for the workout
  await addGiveawayPoints(userId, "workout", 25, `Completed ${muscleGroup} workout`);

  return data;
}

export async function getUserWorkouts(userId: string, limit = 30) {
  const { data } = await supabase
    .from("workout_logs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  return data || [];
}

// ─── COMMUNITY ───────────────────────────────────────────

export async function getCommunityPosts(limit = 20) {
  const { data } = await supabase
    .from("community_posts")
    .select("*, user_profiles(name, avatar_url, xp_points)")
    .order("created_at", { ascending: false })
    .limit(limit);

  return data || [];
}

export async function createCommunityPost(
  userId: string,
  content: string,
  postType: "transformation" | "progress" | "tip",
  beforeImage?: string,
  afterImage?: string
) {
  const { data, error } = await supabase
    .from("community_posts")
    .insert({
      user_id: userId,
      content,
      post_type: postType,
      before_image: beforeImage || null,
      after_image: afterImage || null,
    })
    .select()
    .single();

  if (error) return null;

  // Award points for posting
  if (postType === "transformation") {
    await addGiveawayPoints(userId, "share_post", 75, "Shared transformation post");
  }

  return data;
}

export async function togglePostLike(userId: string, postId: string) {
  // Check if already liked
  const { data: existing } = await supabase
    .from("post_likes")
    .select("id")
    .eq("user_id", userId)
    .eq("post_id", postId)
    .single();

  if (existing) {
    // Unlike
    await supabase.from("post_likes").delete().eq("id", existing.id);
    await supabase.rpc("decrement_likes", { p_post_id: postId });
    return false; // unliked
  } else {
    // Like
    await supabase.from("post_likes").insert({ user_id: userId, post_id: postId });
    // Fallback increment
    const { data: post } = await supabase
      .from("community_posts")
      .select("likes_count")
      .eq("id", postId)
      .single();
    if (post) {
      await supabase
        .from("community_posts")
        .update({ likes_count: post.likes_count + 1 })
        .eq("id", postId);
    }
    return true; // liked
  }
}

// ─── STREAKS ─────────────────────────────────────────────

export async function updateStreak(userId: string) {
  const profile = await getUserProfileById(userId);
  if (!profile) return;

  const lastLogin = new Date(profile.last_login);
  const now = new Date();
  const diffHours = (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60);

  let newStreak = profile.current_streak;

  if (diffHours >= 20 && diffHours <= 48) {
    // Logged in next day — increment streak
    newStreak += 1;
  } else if (diffHours > 48) {
    // Missed a day — reset streak
    newStreak = 1;
  }
  // If < 20 hours, same day login — keep current streak

  const longestStreak = Math.max(profile.longest_streak, newStreak);

  await updateUserProfile(userId, {
    current_streak: newStreak,
    longest_streak: longestStreak,
    last_login: now.toISOString(),
  } as any);

  // Award streak points
  if (newStreak > profile.current_streak) {
    await addGiveawayPoints(userId, "streak", 10, `Day ${newStreak} streak bonus`);
  }
}
