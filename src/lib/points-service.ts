import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSupabaseAdmin, hasSupabaseAdmin } from "./supabase-admin";
import { isUuidUserId } from "./api-guards";

/** How often each action may earn points */
export type PointPolicy = "day" | "lifetime" | "none";

export const POINT_ACTIONS = {
  follow: { points: 200, policy: "lifetime" as PointPolicy },
  share_story: { points: 100, policy: "lifetime" as PointPolicy },
  refer: { points: 150, policy: "none" as PointPolicy },
  streak: { points: 10, policy: "day" as PointPolicy },
  workout: { points: 25, policy: "day" as PointPolicy },
  checkin: { points: 15, policy: "day" as PointPolicy },
  share_post: { points: 75, policy: "day" as PointPolicy },
} as const;

export type PointActionKey = keyof typeof POINT_ACTIONS;

/** Cannot be claimed via /api/giveaway/claim — server-only */
export const AUTO_ONLY_ACTIONS = new Set<PointActionKey>(["streak", "refer"]);

export function startOfTodayUtc(): string {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  return start.toISOString();
}

export function startOfUtcDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/** Whole UTC calendar days between two timestamps (matches daily point awards). */
export function utcDayDiff(from: Date, to: Date): number {
  const fromStart = startOfUtcDay(from).getTime();
  const toStart = startOfUtcDay(to).getTime();
  return Math.round((toStart - fromStart) / (24 * 60 * 60 * 1000));
}

export async function hasPointAwardToday(
  userId: string,
  action: string
): Promise<boolean> {
  if (!hasSupabaseAdmin() || !isUuidUserId(userId)) return false;
  const db = getSupabaseAdmin();
  const { data } = await db
    .from("point_logs")
    .select("id")
    .eq("user_id", userId)
    .eq("action", action)
    .gte("created_at", startOfTodayUtc())
    .limit(1);
  return Boolean(data?.length);
}

export async function hasPointAwardEver(
  userId: string,
  action: string
): Promise<boolean> {
  if (!hasSupabaseAdmin() || !isUuidUserId(userId)) return false;
  const db = getSupabaseAdmin();
  const { data } = await db
    .from("point_logs")
    .select("id")
    .eq("user_id", userId)
    .eq("action", action)
    .limit(1);
  return Boolean(data?.length);
}

export async function canAwardPoints(
  userId: string,
  action: PointActionKey,
  opts?: { bypassPolicy?: boolean }
): Promise<{ allowed: boolean; reason?: string }> {
  if (!isUuidUserId(userId)) {
    return { allowed: false, reason: "Invalid user" };
  }
  if (opts?.bypassPolicy) return { allowed: true };

  const rule = POINT_ACTIONS[action];
  if (!rule) return { allowed: false, reason: "Unknown action" };

  if (rule.policy === "day") {
    if (await hasPointAwardToday(userId, action)) {
      return { allowed: false, reason: "Already earned today" };
    }
  }
  if (rule.policy === "lifetime") {
    if (await hasPointAwardEver(userId, action)) {
      return { allowed: false, reason: "Already claimed" };
    }
  }
  return { allowed: true };
}

/** Server-side award with duplicate checks (service role). */
export async function awardPointsSecure(
  userId: string,
  action: PointActionKey,
  description: string,
  opts?: { bypassPolicy?: boolean }
): Promise<{ ok: boolean; duplicate?: boolean; error?: string }> {
  if (!hasSupabaseAdmin()) {
    return { ok: false, error: "Server not configured" };
  }

  const check = await canAwardPoints(userId, action, opts);
  if (!check.allowed) {
    return { ok: false, duplicate: true, error: check.reason };
  }

  const { points } = POINT_ACTIONS[action];
  const db = getSupabaseAdmin();

  const { data: beforeProfile } = await db
    .from("user_profiles")
    .select("giveaway_points")
    .eq("id", userId)
    .maybeSingle();
  const pointsBefore = beforeProfile?.giveaway_points ?? 0;

  const { error: logError } = await db.from("point_logs").insert({
    user_id: userId,
    action,
    points,
    description,
    giveaway_id: null,
  });

  if (logError) {
    return { ok: false, error: logError.message };
  }

  const { error: rpcError } = await db.rpc("increment_points", {
    p_user_id: userId,
    p_giveaway_points: points,
    p_xp_points: Math.round(points * 0.5),
  });

  if (rpcError) {
    const { data: profile } = await db
      .from("user_profiles")
      .select("giveaway_points, xp_points")
      .eq("id", userId)
      .maybeSingle();
    if (profile) {
      await db
        .from("user_profiles")
        .update({
          giveaway_points: (profile.giveaway_points ?? 0) + points,
          xp_points: (profile.xp_points ?? 0) + Math.round(points * 0.5),
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);
    }
  }

  const { recordPrizeTierUnlocks } = await import("./prize-redemption-alerts");
  await recordPrizeTierUnlocks(userId, pointsBefore, pointsBefore + points);

  return { ok: true };
}

export async function getSessionProfileId(): Promise<
  { userId: string; email: string } | { error: NextResponse }
> {
  const session = await auth();
  const email = session?.user?.email?.trim().toLowerCase();
  if (!email) {
    return {
      error: NextResponse.json({ error: "Sign in required" }, { status: 401 }),
    };
  }
  if (!hasSupabaseAdmin()) {
    return {
      error: NextResponse.json(
        { error: "Server not configured" },
        { status: 503 }
      ),
    };
  }
  const db = getSupabaseAdmin();
  const { data } = await db
    .from("user_profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (!data?.id || !isUuidUserId(data.id)) {
    return {
      error: NextResponse.json(
        { error: "Profile not found. Sign in with Google first." },
        { status: 403 }
      ),
    };
  }
  return { userId: data.id, email };
}

/** Reject body userId if it does not match the signed-in profile */
export async function assertBodyUserMatchesSession(
  bodyUserId: string
): Promise<{ userId: string } | { error: NextResponse }> {
  const session = await getSessionProfileId();
  if ("error" in session) return session;
  if (bodyUserId !== session.userId) {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }
  return { userId: session.userId };
}
