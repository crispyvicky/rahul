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

/** Credit referrer when a new user signs up with ?ref=CODE */
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

  const { data: existing } = await db
    .from("point_logs")
    .select("id")
    .eq("user_id", referrer.id)
    .eq("action", "refer")
    .ilike("description", `%${newUserId}%`)
    .limit(1);

  if (!existing?.length) {
    await awardPointsSecure(
      referrer.id,
      "refer",
      `Referral signup: ${newUserId}`
    );
  }

  return { ok: true };
}
