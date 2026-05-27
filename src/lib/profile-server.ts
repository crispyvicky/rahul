import { getSupabaseAdmin } from "./supabase-admin";
import { awardPointsSecure, hasPointAwardToday, utcDayDiff } from "./points-service";

/**
 * Updates streak from the previous last_login, then last_login = now.
 * Uses UTC calendar days (same as daily streak points), not hours since last open.
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
  const dayDiff = utcDayDiff(previousLogin, now);

  let newStreak = profile.current_streak ?? 0;

  if (dayDiff === 0) {
    // Same UTC day — keep streak; ensure at least day 1
    if (newStreak === 0) newStreak = 1;
  } else if (dayDiff === 1) {
    // Consecutive calendar day
    newStreak = Math.max(newStreak, 1) + 1;
  } else {
    // Missed one or more days
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
