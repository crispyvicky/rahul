import "server-only";

import { getSupabaseAdmin, hasSupabaseAdmin } from "./supabase-admin";
import type { PrizeTier } from "./prize-sheet";
import { hasWebPushConfig, sendWebPush } from "./web-push";

/** Web push when user crosses a prize tier (server-only). */
export async function notifyUserPrizeUnlock(userId: string, tiers: PrizeTier[]) {
  if (!hasSupabaseAdmin() || tiers.length === 0) return;

  const db = getSupabaseAdmin();
  const { data: profile } = await db
    .from("user_profiles")
    .select("name")
    .eq("id", userId)
    .maybeSingle();
  const firstName = profile?.name?.split(/\s+/)[0] || "Athlete";

  const top = tiers[tiers.length - 1];
  const title =
    tiers.length === 1
      ? `🎁 ${top.emoji} ${top.prize} unlocked!`
      : `🎁 ${tiers.length} prizes unlocked!`;
  const body =
    tiers.length === 1
      ? `Hey ${firstName}, you hit ${top.points.toLocaleString()} pts. Open the app to request your prize.`
      : `Hey ${firstName}, you unlocked ${tiers.map((t) => t.prize).join(", ")}. Tap to claim on the prize sheet.`;

  if (!hasWebPushConfig()) return;

  const { data: subs } = await db
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("user_id", userId)
    .eq("is_active", true);

  for (const sub of subs || []) {
    const result = await sendWebPush(
      {
        endpoint: sub.endpoint as string,
        keys: {
          p256dh: sub.p256dh as string,
          auth: sub.auth as string,
        },
      },
      {
        title,
        body,
        tag: `rf-prize-${top.id}`,
        url: "/dashboard",
        userId,
      }
    );

    if (result.ok) {
      await db
        .from("push_subscriptions")
        .update({
          last_success_at: new Date().toISOString(),
          last_error: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", sub.id);
    } else if (
      "statusCode" in result &&
      (result.statusCode === 404 || result.statusCode === 410)
    ) {
      await db
        .from("push_subscriptions")
        .update({
          is_active: false,
          last_error: result.error,
          updated_at: new Date().toISOString(),
        })
        .eq("id", sub.id);
    }
  }
}
