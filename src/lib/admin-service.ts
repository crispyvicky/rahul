import { getSupabaseAdmin } from "./supabase-admin";
import { sendClaimApprovedEmail } from "./email-service";
import { scheduleNotificationDrain } from "./background";
import {
  awardPointsSecure,
  canAwardPoints,
  POINT_ACTIONS,
  type PointActionKey,
} from "./points-service";

const ACTION_POINTS: Record<string, number> = {
  follow: 200,
  share_story: 100,
};

export async function getAdminStats() {
  const db = getSupabaseAdmin();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    { count: userCount },
    { count: pendingClaims },
    { count: communityPosts },
    { data: pointsToday },
    { data: giveaway },
  ] = await Promise.all([
    db.from("user_profiles").select("id", { count: "exact", head: true }),
    db
      .from("point_claim_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    db.from("community_posts").select("id", { count: "exact", head: true }),
    db
      .from("point_logs")
      .select("points")
      .gte("created_at", today.toISOString()),
    db
      .from("giveaways")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const pointsIssuedToday = (pointsToday || []).reduce((s, r) => s + (r.points || 0), 0);

  return {
    userCount: userCount ?? 0,
    pendingClaims: pendingClaims ?? 0,
    communityPosts: communityPosts ?? 0,
    pointsIssuedToday,
    activeGiveaway: giveaway,
  };
}

export async function getAdminLeaderboard(limit = 50) {
  const db = getSupabaseAdmin();
  const { data } = await db
    .from("user_profiles")
    .select("id, name, email, avatar_url, giveaway_points, xp_points, current_streak, instagram_handle, created_at")
    .order("giveaway_points", { ascending: false })
    .limit(limit);
  return data || [];
}

export async function getAllUsers(search?: string, limit = 100) {
  const db = getSupabaseAdmin();
  let q = db
    .from("user_profiles")
    .select("id, name, email, avatar_url, giveaway_points, xp_points, current_streak, instagram_handle, referral_code, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (search?.trim()) {
    const s = `%${search.trim()}%`;
    q = q.or(`name.ilike.${s},email.ilike.${s}`);
  }

  const { data } = await q;
  return data || [];
}

export async function getUserDetail(userId: string) {
  const db = getSupabaseAdmin();
  const [profileRes, logs, workouts, claims] = await Promise.all([
    db.from("user_profiles").select("*").eq("id", userId).single(),
    db
      .from("point_logs")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(100),
    db
      .from("workout_logs")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(30),
    db
      .from("point_claim_requests")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
  ]);

  return {
    profile: profileRes.data,
    pointLogs: logs.data || [],
    workouts: workouts.data || [],
    claims: claims.data || [],
  };
}

export async function getPointLogs(filters: {
  action?: string;
  limit?: number;
}) {
  const db = getSupabaseAdmin();
  let q = db
    .from("point_logs")
    .select("*, user_profiles(name, email)")
    .order("created_at", { ascending: false })
    .limit(filters.limit ?? 100);

  if (filters.action) q = q.eq("action", filters.action);

  const { data } = await q;
  return data || [];
}

export async function getPendingClaims() {
  const db = getSupabaseAdmin();
  const { data } = await db
    .from("point_claim_requests")
    .select("*, user_profiles(name, email, instagram_handle, avatar_url)")
    .eq("status", "pending")
    .order("created_at", { ascending: true });
  return data || [];
}

export async function getAllClaims(limit = 200) {
  const db = getSupabaseAdmin();
  const { data } = await db
    .from("point_claim_requests")
    .select("*, user_profiles(name, email, instagram_handle, avatar_url)")
    .order("created_at", { ascending: false })
    .limit(limit);
  return data || [];
}

export async function awardPointsAdmin(
  userId: string,
  action: string,
  points: number,
  description: string
) {
  const db = getSupabaseAdmin();
  await db.from("point_logs").insert({
    user_id: userId,
    action,
    points,
    description,
  });
  const xp = Math.round(points * 0.5);
  const { error } = await db.rpc("increment_points", {
    p_user_id: userId,
    p_giveaway_points: points,
    p_xp_points: xp,
  });
  if (error) {
    const { data: profile } = await db
      .from("user_profiles")
      .select("giveaway_points, xp_points")
      .eq("id", userId)
      .single();
    if (profile) {
      await db
        .from("user_profiles")
        .update({
          giveaway_points: (profile.giveaway_points || 0) + points,
          xp_points: (profile.xp_points || 0) + xp,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);
    }
  }
}

export async function approveClaim(claimId: string, reviewedBy: string) {
  const db = getSupabaseAdmin();
  const reviewedAt = new Date().toISOString();

  const { data: claim, error: lockError } = await db
    .from("point_claim_requests")
    .update({
      status: "approved",
      reviewed_by: reviewedBy,
      reviewed_at: reviewedAt,
    })
    .eq("id", claimId)
    .eq("status", "pending")
    .select("*")
    .maybeSingle();

  if (lockError) {
    return { ok: false, error: lockError.message };
  }

  if (!claim) {
    const { data: existing } = await db
      .from("point_claim_requests")
      .select("status")
      .eq("id", claimId)
      .maybeSingle();

    if (existing?.status === "approved") {
      return { ok: true, alreadyReviewed: true };
    }
    if (existing?.status === "denied") {
      return { ok: false, error: "This claim was already denied." };
    }
    return { ok: false, error: "Claim not found." };
  }

  const action = claim.action as PointActionKey;
  const points = claim.points || POINT_ACTIONS[action]?.points || 0;

  const eligible = await canAwardPoints(claim.user_id, action);
  if (eligible.allowed) {
    await awardPointsSecure(claim.user_id, action, `Approved: ${claim.action}`);
  }

  const { data: profile } = await db
    .from("user_profiles")
    .select("email, name")
    .eq("id", claim.user_id)
    .maybeSingle();

  if (profile?.email) {
    try {
      await sendClaimApprovedEmail({
        to: profile.email,
        name: profile.name || "Athlete",
        action: claim.action,
        points,
        userId: claim.user_id,
      });
      scheduleNotificationDrain();
    } catch (e) {
      console.warn("[approveClaim] email enqueue failed", e);
    }
  }

  return { ok: true };
}

export async function denyClaim(claimId: string, reviewedBy: string) {
  const db = getSupabaseAdmin();
  const { data: claim, error } = await db
    .from("point_claim_requests")
    .update({
      status: "denied",
      reviewed_by: reviewedBy,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", claimId)
    .eq("status", "pending")
    .select("id")
    .maybeSingle();

  if (error) {
    return { ok: false, error: error.message };
  }

  if (!claim) {
    const { data: existing } = await db
      .from("point_claim_requests")
      .select("status")
      .eq("id", claimId)
      .maybeSingle();

    if (existing?.status === "denied") {
      return { ok: true, alreadyReviewed: true };
    }
    if (existing?.status === "approved") {
      return { ok: false, error: "This claim was already approved." };
    }
    return { ok: false, error: "Claim not found." };
  }

  return { ok: true };
}

export async function adjustUserPoints(
  userId: string,
  delta: number,
  reason: string
) {
  if (delta === 0) return { ok: false, error: "Delta cannot be 0" };
  const action = delta > 0 ? "admin_bonus" : "admin_revoke";
  await awardPointsAdmin(userId, action, Math.abs(delta), reason);
  return { ok: true };
}

export async function getCommunityPostsAdmin(limit = 50) {
  const db = getSupabaseAdmin();
  const { data } = await db
    .from("community_posts")
    .select("*, user_profiles(name, email, avatar_url)")
    .order("created_at", { ascending: false })
    .limit(limit);
  return data || [];
}

export async function deleteCommunityPost(postId: string) {
  const db = getSupabaseAdmin();
  const { error: likesError } = await db.from("post_likes").delete().eq("post_id", postId);
  if (likesError) {
    return { ok: false, error: likesError.message };
  }
  const { error } = await db.from("community_posts").delete().eq("id", postId);
  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function setCommunityPostFeatured(postId: string, featured: boolean) {
  const db = getSupabaseAdmin();
  const { error } = await db
    .from("community_posts")
    .update({ is_featured: featured })
    .eq("id", postId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function getPrebookings(limit = 100) {
  const db = getSupabaseAdmin();
  const { data } = await db
    .from("gym_prebookings")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return data || [];
}

export async function getGiveawaysAdmin() {
  const db = getSupabaseAdmin();
  const { data } = await db
    .from("giveaways")
    .select("*")
    .order("created_at", { ascending: false });
  return data || [];
}

export async function endGiveaway(giveawayId: string) {
  const db = getSupabaseAdmin();
  await db.from("giveaways").update({ is_active: false }).eq("id", giveawayId);
  return { ok: true };
}

export async function markWinner(
  giveawayId: string,
  userId: string,
  prize: string,
  notes?: string,
  rank = 1
) {
  const db = getSupabaseAdmin();
  const { error } = await db.from("giveaway_winners").upsert(
    {
      giveaway_id: giveawayId,
      user_id: userId,
      rank,
      prize,
      notes: notes || null,
    },
    { onConflict: "giveaway_id,user_id" }
  );
  return { ok: !error };
}

export async function getWinners(giveawayId?: string) {
  const db = getSupabaseAdmin();
  let q = db
    .from("giveaway_winners")
    .select("*, user_profiles(name, email), giveaways(title)")
    .order("announced_at", { ascending: false });
  if (giveawayId) q = q.eq("giveaway_id", giveawayId);
  const { data } = await q;
  return data || [];
}

export async function createPendingClaim(
  userId: string,
  action: string,
  proofUrl?: string | null
) {
  const db = getSupabaseAdmin();
  const points = ACTION_POINTS[action] ?? 0;

  const { data: existing } = await db
    .from("point_claim_requests")
    .select("id, status")
    .eq("user_id", userId)
    .eq("action", action)
    .eq("status", "pending")
    .maybeSingle();

  if (existing) {
    return { ok: true, pending: true, message: "Already pending review" };
  }

  const { data: approved } = await db
    .from("point_claim_requests")
    .select("id")
    .eq("user_id", userId)
    .eq("action", action)
    .eq("status", "approved")
    .limit(1);

  if (approved?.length) {
    return { ok: false, error: "You already claimed points for this action." };
  }

  const { error } = await db.from("point_claim_requests").insert({
    user_id: userId,
    action,
    points,
    status: "pending",
    proof_url: proofUrl || null,
  });

  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true, pending: true };
}

export async function getUserClaimStatuses(userId: string) {
  const db = getSupabaseAdmin();
  const { data } = await db
    .from("point_claim_requests")
    .select("action, status")
    .eq("user_id", userId)
    .in("action", ["follow", "share_story"]);
  const map: Record<string, string> = {};
  for (const row of data || []) {
    map[row.action] = row.status;
  }
  return map;
}
