import { getSupabaseAdmin } from "./supabase-admin";
import { awardPointsSecure } from "./points-service";

export async function findReferrerByCode(code: string) {
  if (!code?.trim()) return null;
  const db = getSupabaseAdmin();
  const normalized = code.trim().toUpperCase();
  const { data } = await db
    .from("user_profiles")
    .select("id, name, email, referral_code")
    .eq("referral_code", normalized)
    .maybeSingle();
  return data;
}

/** Link a new user to their referrer (?ref=CODE). Points are awarded after follow is approved. */
export async function processReferralSignup(
  newUserId: string,
  referralCode: string
): Promise<{ ok: boolean; message?: string }> {
  if (!referralCode?.trim()) return { ok: false };

  const db = getSupabaseAdmin();
  const referrer = await findReferrerByCode(referralCode);
  if (!referrer) return { ok: false, message: "Invalid referral code" };
  if (referrer.id === newUserId) return { ok: false, message: "Cannot refer yourself" };

  const { data: newProfile } = await db
    .from("user_profiles")
    .select("referred_by")
    .eq("id", newUserId)
    .single();

  if (newProfile?.referred_by) return { ok: false, message: "Referral already applied" };

  await db
    .from("user_profiles")
    .update({ referred_by: referrer.referral_code })
    .eq("id", newUserId);

  return { ok: true };
}

/** Credit referrer once when a referred friend's IG follow claim is approved. */
export async function awardReferrerOnFollowApproved(
  referredUserId: string
): Promise<{ ok: boolean; awarded?: boolean; message?: string }> {
  const db = getSupabaseAdmin();

  const { data: referred } = await db
    .from("user_profiles")
    .select("referred_by")
    .eq("id", referredUserId)
    .maybeSingle();

  if (!referred?.referred_by) return { ok: true, awarded: false };

  const referrer = await findReferrerByCode(referred.referred_by);
  if (!referrer) return { ok: true, awarded: false };
  if (referrer.id === referredUserId) {
    return { ok: false, message: "Cannot refer yourself" };
  }

  const { data: existing } = await db
    .from("point_logs")
    .select("id")
    .eq("user_id", referrer.id)
    .eq("action", "refer")
    .ilike("description", `%${referredUserId}%`)
    .limit(1);

  if (existing?.length) {
    return { ok: true, awarded: false, message: "Referral already rewarded" };
  }

  await awardPointsSecure(
    referrer.id,
    "refer",
    `Referral follow verified: ${referredUserId}`
  );

  return { ok: true, awarded: true };
}
