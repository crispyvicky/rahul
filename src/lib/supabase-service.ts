import { supabase } from "./supabase";
import type { DbUserProfile } from "./supabase";
import { isUuidUserId } from "./api-guards";
import { startOfTodayUtc } from "./points-service";

function formatSupabaseError(err: unknown): string {
  if (err == null) return "unknown";
  if (typeof err !== "object") return String(err);
  const e = err as {
    message?: string;
    code?: string;
    details?: string;
    hint?: string;
  };
  return [e.message, e.code && `code=${e.code}`, e.details, e.hint].filter(Boolean).join(" | ");
}

// ─── USER PROFILE ────────────────────────────────────────

export async function upsertUserProfile(userData: {
  google_id: string;
  name: string;
  email: string;
  avatar_url: string;
}) {
  const now = new Date().toISOString();
  const baseRow = {
    google_id: userData.google_id,
    name: userData.name,
    email: userData.email,
    avatar_url: userData.avatar_url,
    last_login: now,
    updated_at: now,
  };

  const existing = await getUserProfile(userData.email);

  if (existing) {
    const { data, error } = await supabase
      .from("user_profiles")
      .update(baseRow)
      .eq("email", userData.email)
      .select()
      .single();

    if (error) {
      console.warn(
        "[upsertUserProfile update]",
        formatSupabaseError(error),
        "— if this mentions RLS or policy, run supabase/fix_user_profiles_rls.sql in the SQL editor."
      );
      return null;
    }
    return data as DbUserProfile;
  }

  const referralCode = `RF-${userData.name.toUpperCase().replace(/\s+/g, "").slice(0, 4)}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  const { data, error } = await supabase
    .from("user_profiles")
    .insert({
      ...baseRow,
      referral_code: referralCode,
    })
    .select()
    .single();

  if (error) {
    console.warn("[upsertUserProfile insert]", formatSupabaseError(error));
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

const CLIENT_POINT_POLICIES: Record<string, "day" | "lifetime"> = {
  streak: "day",
  workout: "day",
  checkin: "day",
  share_post: "day",
  follow: "lifetime",
  share_story: "lifetime",
};

export async function addGiveawayPoints(
  userId: string,
  action: string,
  points: number,
  description: string,
  giveawayId?: string,
  opts?: { skipDuplicateCheck?: boolean }
) {
  if (!isUuidUserId(userId)) return false;

  const policy = CLIENT_POINT_POLICIES[action];
  if (!opts?.skipDuplicateCheck && policy) {
    if (policy === "day" && (await hasCompletedActionToday(userId, action))) {
      return false;
    }
    if (policy === "lifetime" && (await hasCompletedAction(userId, action))) {
      return false;
    }
  }

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
  if (!isUuidUserId(userId)) return false;

  const { data } = await supabase
    .from("point_logs")
    .select("id")
    .eq("user_id", userId)
    .eq("action", action)
    .limit(1);

  return (data && data.length > 0) || false;
}

export async function hasCompletedActionToday(userId: string, action: string) {
  if (!isUuidUserId(userId)) return false;

  const dayStart = startOfTodayUtc();

  const { data } = await supabase
    .from("point_logs")
    .select("id")
    .eq("user_id", userId)
    .eq("action", action)
    .gte("created_at", dayStart)
    .limit(1);

  return (data && data.length > 0) || false;
}

export async function getParticipantCount() {
  const { count, error } = await supabase
    .from("user_profiles")
    .select("id", { count: "exact", head: true })
    .gt("giveaway_points", 0);

  if (error) return 0;
  return count ?? 0;
}

export async function getPastGiveaways() {
  const { data } = await supabase
    .from("giveaways")
    .select("*")
    .eq("is_active", false)
    .order("ends_at", { ascending: false })
    .limit(10);

  return data || [];
}

export async function getUserRank(userId: string) {
  if (!isUuidUserId(userId)) return null;

  const profile = await getUserProfileById(userId);
  if (!profile) return null;

  const { count } = await supabase
    .from("user_profiles")
    .select("id", { count: "exact", head: true })
    .gt("giveaway_points", profile.giveaway_points);

  return (count ?? 0) + 1;
}

export async function getGiveawayPageData(userId?: string) {
  const [giveaway, leaderboard, participantCount, pastGiveaways] = await Promise.all([
    getActiveGiveaway(),
    getGiveawayLeaderboard(25),
    getParticipantCount(),
    getPastGiveaways(),
  ]);

  let completedActions: string[] = [];
  let myPoints = 0;
  let myRank: number | null = null;
  let referralCode = "";
  let xpPoints = 0;

  if (userId && isUuidUserId(userId)) {
    const [logs, profile, rank] = await Promise.all([
      getUserPointLogs(userId),
      getUserProfileById(userId),
      getUserRank(userId),
    ]);

    completedActions = [...new Set((logs || []).map((l) => l.action))];
    myPoints = profile?.giveaway_points ?? 0;
    xpPoints = profile?.xp_points ?? 0;
    referralCode = profile?.referral_code ?? "";
    myRank = rank;
  }

  const topPoints = leaderboard[0]?.giveaway_points ?? 0;
  const pointsToFirst =
    userId && isUuidUserId(userId) ? Math.max(topPoints - myPoints, 0) : topPoints;

  return {
    giveaway,
    leaderboard,
    participantCount,
    pastGiveaways,
    completedActions,
    myPoints,
    myRank,
    referralCode,
    xpPoints,
    pointsToFirst,
  };
}

// ─── WORKOUT LOGS ────────────────────────────────────────

export async function logWorkout(
  userId: string,
  muscleGroup: string,
  exercises: any,
  durationMins: number
) {
  if (!isUuidUserId(userId)) return null;

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

  const already = await hasCompletedActionToday(userId, "workout");
  if (!already) {
    await addGiveawayPoints(userId, "workout", 25, `Completed ${muscleGroup} workout`);
  }

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

// ─── AI PLANS ────────────────────────────────────────────

export async function saveAiPlan(
  userId: string,
  planType: "workout" | "diet" | "physique",
  planData: any
) {
  if (!isUuidUserId(userId)) return null;

  const { data, error } = await supabase
    .from("ai_plans")
    .insert({
      user_id: userId,
      plan_type: planType,
      plan_data: planData,
    })
    .select()
    .single();

  if (error) {
    console.warn(
      "[saveAiPlan]",
      error.message,
      error.code ?? "",
      "— if RLS/JWT: run supabase/fix_ai_plans_rls.sql in Supabase SQL Editor. If FK: ensure user_profiles has this user id (Google login from app)."
    );
    return null;
  }
  return data;
}

export async function getUserAiPlans(userId: string, limit = 20) {
  if (!isUuidUserId(userId)) return [];

  const { data, error } = await supabase
    .from("ai_plans")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.warn("[getUserAiPlans]", error.message, error.code ?? "", "— run supabase/fix_ai_plans_rls.sql if using anon key without Supabase Auth.");
    return [];
  }
  return data || [];
}

// ─── COMMUNITY ───────────────────────────────────────────

export async function getCommunityPosts(limit = 20) {
  if (!supabase) return [];

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
  if (!isUuidUserId(userId)) return null;

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

  if (postType === "transformation") {
    const already = await hasCompletedActionToday(userId, "share_post");
    if (!already) {
      await addGiveawayPoints(userId, "share_post", 75, "Shared transformation post");
    }
  }

  return data;
}

const MAX_COMMENT_LENGTH = 2000;

async function bumpCommentCount(postId: string, delta: 1 | -1) {
  const rpc = delta === 1 ? "increment_comments" : "decrement_comments";
  const { error: rpcError } = await supabase.rpc(rpc, { p_post_id: postId });
  if (!rpcError) return;

  const { data: post } = await supabase
    .from("community_posts")
    .select("comments_count")
    .eq("id", postId)
    .single();
  if (!post) return;
  const next = Math.max(0, (post.comments_count ?? 0) + delta);
  await supabase.from("community_posts").update({ comments_count: next }).eq("id", postId);
}

export async function getPostComments(postId: string, limit = 50) {
  if (!supabase || !postId) return [];

  const { data, error } = await supabase
    .from("post_comments")
    .select("id, post_id, user_id, content, created_at, user_profiles(name, avatar_url)")
    .eq("post_id", postId)
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) {
    console.warn("[getPostComments]", formatSupabaseError(error));
    return [];
  }
  return data || [];
}

export async function createPostComment(
  userId: string,
  postId: string,
  content: string
) {
  if (!isUuidUserId(userId) || !postId) return null;

  const trimmed = content.trim().slice(0, MAX_COMMENT_LENGTH);
  if (!trimmed) return null;

  const { data, error } = await supabase
    .from("post_comments")
    .insert({
      user_id: userId,
      post_id: postId,
      content: trimmed,
    })
    .select("id, post_id, user_id, content, created_at, user_profiles(name, avatar_url)")
    .single();

  if (error) {
    console.warn("[createPostComment]", formatSupabaseError(error));
    return null;
  }

  await bumpCommentCount(postId, 1);
  return data;
}

export async function deletePostComment(
  userId: string,
  commentId: string,
  opts?: { isAdmin?: boolean }
) {
  if (!commentId) return { ok: false, error: "Invalid comment" };

  const { data: comment } = await supabase
    .from("post_comments")
    .select("id, post_id, user_id")
    .eq("id", commentId)
    .maybeSingle();

  if (!comment) return { ok: false, error: "Comment not found" };

  if (!opts?.isAdmin && (!isUuidUserId(userId) || comment.user_id !== userId)) {
    return { ok: false, error: "Not allowed" };
  }

  const { error } = await supabase.from("post_comments").delete().eq("id", commentId);
  if (error) {
    console.warn("[deletePostComment]", formatSupabaseError(error));
    return { ok: false, error: error.message };
  }

  await bumpCommentCount(comment.post_id, -1);
  return { ok: true, postId: comment.post_id };
}

export async function togglePostLike(userId: string, postId: string) {
  if (!isUuidUserId(userId)) return null;

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

/** @deprecated Login streak runs server-side in sync-profile (updateStreakServer). */
export async function updateStreak(userId: string) {
  if (!isUuidUserId(userId)) return null;
  return getUserProfileById(userId);
}
