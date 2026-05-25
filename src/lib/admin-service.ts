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

const CLAIM_PROOFS_BUCKET = "claim-proofs";

/** Storage object path inside claim-proofs, or null if external URL. */
export function parseClaimProofStoragePath(
  proofUrl: string | null | undefined
): string | null {
  if (!proofUrl?.trim()) return null;
  const url = proofUrl.trim();
  if (!url.includes(CLAIM_PROOFS_BUCKET)) return null;
  try {
    const u = new URL(url);
    const marker = `/${CLAIM_PROOFS_BUCKET}/`;
    const idx = u.pathname.indexOf(marker);
    if (idx >= 0) {
      return decodeURIComponent(u.pathname.slice(idx + marker.length));
    }
  } catch {
    const m = url.match(/claim-proofs\/(.+)$/);
    if (m?.[1]) return decodeURIComponent(m[1]);
  }
  return null;
}

/** Remove screenshot from Storage and clear proof_url after admin review. */
async function deleteClaimProofAfterReview(
  claimId: string,
  proofUrl: string | null | undefined
): Promise<void> {
  const db = getSupabaseAdmin();
  const path = parseClaimProofStoragePath(proofUrl);
  if (path) {
    const { error } = await db.storage.from(CLAIM_PROOFS_BUCKET).remove([path]);
    if (error) {
      console.warn("[deleteClaimProofAfterReview] storage remove failed", error);
    }
  }
  await db
    .from("point_claim_requests")
    .update({ proof_url: null })
    .eq("id", claimId);
}

/** Resolve proof_url to a URL the admin UI can load (public or short-lived signed). */
export async function resolveClaimProofUrl(
  proofUrl: string | null | undefined
): Promise<string | null> {
  if (!proofUrl?.trim()) return null;
  const url = proofUrl.trim();
  const path = parseClaimProofStoragePath(url);
  if (!path) return url.includes(CLAIM_PROOFS_BUCKET) ? null : url;

  const db = getSupabaseAdmin();
  const { data: pub } = db.storage.from(CLAIM_PROOFS_BUCKET).getPublicUrl(path);
  if (pub?.publicUrl) return pub.publicUrl;

  const { data: signed, error } = await db.storage
    .from(CLAIM_PROOFS_BUCKET)
    .createSignedUrl(path, 3600);
  if (!error && signed?.signedUrl) return signed.signedUrl;
  return url;
}

async function enrichClaimsWithProofUrls<T extends { proof_url?: string | null }>(
  rows: T[]
): Promise<(T & { proof_display_url: string | null })[]> {
  return Promise.all(
    rows.map(async (row) => ({
      ...row,
      proof_display_url: await resolveClaimProofUrl(row.proof_url),
    }))
  );
}

export async function getPendingClaims() {
  const db = getSupabaseAdmin();
  const { data } = await db
    .from("point_claim_requests")
    .select("*, user_profiles(name, email, instagram_handle, avatar_url)")
    .eq("status", "pending")
    .order("created_at", { ascending: true });
  return enrichClaimsWithProofUrls(data || []);
}

export async function getAllClaims(limit = 200) {
  const db = getSupabaseAdmin();
  const { data } = await db
    .from("point_claim_requests")
    .select("*, user_profiles(name, email, instagram_handle, avatar_url)")
    .order("created_at", { ascending: false })
    .limit(limit);
  return enrichClaimsWithProofUrls(data || []);
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

  const { data: pending } = await db
    .from("point_claim_requests")
    .select("id, action, proof_url, status")
    .eq("id", claimId)
    .maybeSingle();

  if (!pending) {
    return { ok: false, error: "Claim not found." };
  }
  if (pending.status !== "pending") {
    if (pending.status === "approved") return { ok: true, alreadyReviewed: true };
    return { ok: false, error: "This claim was already denied." };
  }

  const proofRequired =
    pending.action === "follow" || pending.action === "share_story";
  if (proofRequired && !pending.proof_url?.trim()) {
    return {
      ok: false,
      error:
        "Screenshot required for Instagram claims. Deny this claim and ask the user to resubmit with proof.",
    };
  }

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

  await deleteClaimProofAfterReview(claim.id, claim.proof_url);

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
    .select("id, proof_url")
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

  await deleteClaimProofAfterReview(claimId, claim.proof_url);

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
