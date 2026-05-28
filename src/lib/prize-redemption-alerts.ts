import "server-only";

import { getSupabaseAdmin, hasSupabaseAdmin } from "./supabase-admin";
import { PRIZE_SHEET } from "./prize-sheet";

export type PrizeRedemptionStatus = "pending" | "fulfilled" | "dismissed";

export type UserContact = {
  phone: string;
  instagram: string;
};

export type PrizeRedemptionAlert = {
  id: string;
  user_id: string;
  tier_id: string;
  prize_name: string;
  points_required: number;
  user_points_at_unlock: number;
  status: PrizeRedemptionStatus;
  user_note: string | null;
  admin_note: string | null;
  fulfilled_by: string | null;
  contact_phone: string | null;
  contact_instagram: string | null;
  created_at: string;
  updated_at: string;
  fulfilled_at: string | null;
  user_profiles?: {
    name: string;
    email: string;
    giveaway_points: number;
    instagram_handle: string | null;
    phone: string | null;
  };
};

function normalizeInstagram(raw: string) {
  return raw.trim().replace(/^@+/, "");
}

function normalizePhone(raw: string) {
  return raw.trim();
}

function isValidPhone(phone: string) {
  return phone.replace(/\D/g, "").length >= 10;
}

/** Profile phone/IG, then latest Instagram-follow claim as fallback. */
export async function resolveUserContact(userId: string): Promise<UserContact> {
  if (!hasSupabaseAdmin()) return { phone: "", instagram: "" };
  const db = getSupabaseAdmin();

  const { data: profile } = await db
    .from("user_profiles")
    .select("instagram_handle, phone")
    .eq("id", userId)
    .maybeSingle();

  let instagram = normalizeInstagram(profile?.instagram_handle || "");
  let phone = normalizePhone(profile?.phone || "");

  if (!phone || !instagram) {
    const { data: claims } = await db
      .from("point_claim_requests")
      .select("instagram_username, phone")
      .eq("user_id", userId)
      .eq("action", "follow")
      .order("created_at", { ascending: false })
      .limit(1);

    const claim = claims?.[0];
    if (!instagram && claim?.instagram_username) {
      instagram = normalizeInstagram(claim.instagram_username);
    }
    if (!phone && claim?.phone) {
      phone = normalizePhone(claim.phone);
    }
  }

  return { phone, instagram };
}

export async function saveUserContact(userId: string, contact: UserContact) {
  if (!hasSupabaseAdmin()) return;
  const db = getSupabaseAdmin();
  await db
    .from("user_profiles")
    .update({
      phone: contact.phone || null,
      instagram_handle: contact.instagram || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);
}

/** Create admin alerts for tiers newly crossed (previousPoints < tier <= newPoints). */
export async function recordPrizeTierUnlocks(
  userId: string,
  previousPoints: number,
  newPoints: number
) {
  if (!hasSupabaseAdmin() || newPoints <= previousPoints) return;

  const newlyUnlocked = PRIZE_SHEET.filter(
    (t) => previousPoints < t.points && newPoints >= t.points
  );
  if (newlyUnlocked.length === 0) return;

  const contact = await resolveUserContact(userId);
  const db = getSupabaseAdmin();
  for (const tier of newlyUnlocked) {
    await db.from("prize_redemption_alerts").upsert(
      {
        user_id: userId,
        tier_id: tier.id,
        prize_name: tier.prize,
        points_required: tier.points,
        user_points_at_unlock: newPoints,
        status: "pending",
        contact_phone: contact.phone || null,
        contact_instagram: contact.instagram || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,tier_id", ignoreDuplicates: true }
    );
  }

  void import("./prize-unlock-push").then((m) =>
    m.notifyUserPrizeUnlock(userId, newlyUnlocked)
  );
}

export type UnseenPrizeUnlock = {
  id: string;
  tier_id: string;
  prize_name: string;
  points_required: number;
};

export async function listUnseenInAppPrizeUnlocks(userId: string) {
  if (!hasSupabaseAdmin()) return [] as UnseenPrizeUnlock[];
  const db = getSupabaseAdmin();
  const { data } = await db
    .from("prize_redemption_alerts")
    .select("id, tier_id, prize_name, points_required")
    .eq("user_id", userId)
    .is("in_app_notified_at", null)
    .order("created_at", { ascending: true })
    .limit(10);
  return (data || []) as UnseenPrizeUnlock[];
}

export async function markInAppPrizeUnlocksSeen(alertIds: string[]) {
  if (!hasSupabaseAdmin() || alertIds.length === 0) return;
  const db = getSupabaseAdmin();
  const now = new Date().toISOString();
  await db
    .from("prize_redemption_alerts")
    .update({ in_app_notified_at: now, updated_at: now })
    .in("id", alertIds);
}

/** User taps "Request redeem" on an unlocked tier. */
export async function requestPrizeRedemption(
  userId: string,
  tierId: string,
  opts?: { userNote?: string; phone?: string; instagram?: string }
) {
  if (!hasSupabaseAdmin()) return { ok: false as const, error: "Server not configured" };

  const tier = PRIZE_SHEET.find((t) => t.id === tierId);
  if (!tier) return { ok: false as const, error: "Unknown prize tier" };

  const db = getSupabaseAdmin();
  const { data: profile } = await db
    .from("user_profiles")
    .select("giveaway_points")
    .eq("id", userId)
    .maybeSingle();

  const points = profile?.giveaway_points ?? 0;
  if (points < tier.points) {
    return { ok: false as const, error: "Not enough points for this prize yet" };
  }

  const resolved = await resolveUserContact(userId);
  const phone = normalizePhone(opts?.phone || resolved.phone);
  const instagram = normalizeInstagram(opts?.instagram || resolved.instagram);

  if (!instagram) {
    return {
      ok: false as const,
      error: "Add your Instagram username so Rahul can reach you.",
    };
  }
  if (!isValidPhone(phone)) {
    return {
      ok: false as const,
      error: "Add a valid phone number (at least 10 digits) so Rahul can reach you.",
    };
  }

  const contact: UserContact = { phone, instagram };
  await saveUserContact(userId, contact);

  const { data: existing } = await db
    .from("prize_redemption_alerts")
    .select("id, status")
    .eq("user_id", userId)
    .eq("tier_id", tier.id)
    .maybeSingle();

  if (existing?.status === "fulfilled") {
    return { ok: false as const, error: "This prize was already fulfilled" };
  }
  if (existing?.status === "pending") {
    await db
      .from("prize_redemption_alerts")
      .update({
        contact_phone: contact.phone,
        contact_instagram: contact.instagram,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
    return { ok: true as const, alert: existing, alreadyRequested: true as const };
  }

  const row = {
    user_id: userId,
    tier_id: tier.id,
    prize_name: tier.prize,
    points_required: tier.points,
    user_points_at_unlock: points,
    status: "pending" as const,
    user_note: opts?.userNote?.trim() || null,
    contact_phone: contact.phone,
    contact_instagram: contact.instagram,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = existing
    ? await db
        .from("prize_redemption_alerts")
        .update(row)
        .eq("id", existing.id)
        .select("id, status")
        .single()
    : await db.from("prize_redemption_alerts").insert(row).select("id, status").single();

  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const, alert: data };
}

export async function getUserRedemptionStatuses(userId: string) {
  if (!hasSupabaseAdmin()) return {} as Record<string, PrizeRedemptionStatus>;
  const db = getSupabaseAdmin();
  const { data } = await db
    .from("prize_redemption_alerts")
    .select("tier_id, status")
    .eq("user_id", userId);
  const map: Record<string, PrizeRedemptionStatus> = {};
  for (const row of data || []) {
    map[row.tier_id] = row.status as PrizeRedemptionStatus;
  }
  return map;
}

export async function getPendingRedemptionCount() {
  if (!hasSupabaseAdmin()) return 0;
  const db = getSupabaseAdmin();
  const { count } = await db
    .from("prize_redemption_alerts")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");
  return count ?? 0;
}

export async function listRedemptionAlerts(status?: PrizeRedemptionStatus | "all") {
  if (!hasSupabaseAdmin()) return [];
  const db = getSupabaseAdmin();
  let q = db
    .from("prize_redemption_alerts")
    .select(
      "*, user_profiles(name, email, giveaway_points, instagram_handle, phone)"
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (status && status !== "all") {
    q = q.eq("status", status);
  }

  const { data } = await q;
  return (data || []) as PrizeRedemptionAlert[];
}

export async function updateRedemptionAlert(
  alertId: string,
  params: {
    status: PrizeRedemptionStatus;
    adminNote?: string;
    fulfilledBy?: string;
  }
) {
  if (!hasSupabaseAdmin()) return { ok: false as const, error: "Server not configured" };
  const db = getSupabaseAdmin();
  const now = new Date().toISOString();
  const patch: Record<string, unknown> = {
    status: params.status,
    admin_note: params.adminNote?.trim() || null,
    updated_at: now,
  };
  if (params.status === "fulfilled") {
    patch.fulfilled_at = now;
    patch.fulfilled_by = params.fulfilledBy ?? null;
  }

  const { error } = await db
    .from("prize_redemption_alerts")
    .update(patch)
    .eq("id", alertId);

  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
}
