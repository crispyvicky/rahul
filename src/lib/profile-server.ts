import { getSupabaseAdmin } from "./supabase-admin";
import { awardPointsSecure, hasPointAwardToday } from "./points-service";

/**
 * Updates streak from the previous last_login, then last_login = now.
 * Daily login points: at most once per calendar day (UTC), action "streak".
 */
export async function updateStreakServer(userId: string) {
  const db = getSupabaseAdmin();
  const { data: profile } = await db
    .from("user_profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (!profile) return null;

  const previousLogin = new Date(profile.last_login || profile.created_at);
  const now = new Date();
  const diffHours =
    (now.getTime() - previousLogin.getTime()) / (1000 * 60 * 60);

  let newStreak = profile.current_streak ?? 0;

  if (diffHours >= 20 && diffHours <= 48) {
    newStreak += 1;
  } else if (diffHours > 48) {
    newStreak = 1;
  } else if (newStreak === 0) {
    newStreak = 1;
  }

  const longestStreak = Math.max(profile.longest_streak ?? 0, newStreak);

  const { data: updated, error } = await db
    .from("user_profiles")
    .update({
      current_streak: newStreak,
      longest_streak: longestStreak,
      last_login: now.toISOString(),
      updated_at: now.toISOString(),
    })
    .eq("id", userId)
    .select()
    .maybeSingle();

  if (error || !updated) return profile;

  const alreadyToday = await hasPointAwardToday(userId, "streak");
  if (!alreadyToday) {
    await awardPointsSecure(
      userId,
      "streak",
      `Daily login · Day ${newStreak} streak`
    );
    const { data: refreshed } = await db
      .from("user_profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    return refreshed || updated;
  }

  return updated;
}
