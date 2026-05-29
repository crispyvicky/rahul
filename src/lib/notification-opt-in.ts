import "server-only";

import { getSupabaseAdmin, hasSupabaseAdmin } from "./supabase-admin";

export async function recordNotificationOptIn(userId: string) {
  if (!hasSupabaseAdmin()) {
    return { ok: false as const, error: "Server not configured" };
  }

  const db = getSupabaseAdmin();
  const { data: profile } = await db
    .from("user_profiles")
    .select("notifications_enabled_at")
    .eq("id", userId)
    .maybeSingle();

  const now = new Date().toISOString();

  if (profile?.notifications_enabled_at) {
    return {
      ok: true as const,
      alreadyOptedIn: true as const,
      enabledAt: profile.notifications_enabled_at,
    };
  }

  await db
    .from("user_profiles")
    .update({ notifications_enabled_at: now, updated_at: now })
    .eq("id", userId);

  const { data: campaigns } = await db
    .from("notification_campaigns")
    .select("id")
    .eq("status", "active");

  if (campaigns?.length) {
    await db.from("notification_campaign_seen").upsert(
      campaigns.map((c) => ({
        user_id: userId,
        campaign_id: c.id,
      })),
      { onConflict: "campaign_id,user_id", ignoreDuplicates: true }
    );
  }

  await db
    .from("prize_redemption_alerts")
    .update({ in_app_notified_at: now, updated_at: now })
    .eq("user_id", userId)
    .is("in_app_notified_at", null);

  return { ok: true as const, alreadyOptedIn: false as const, enabledAt: now };
}
