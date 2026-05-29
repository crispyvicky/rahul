import { getSupabaseAdmin, hasSupabaseAdmin } from "./supabase-admin";
import type { EngagementNotificationKind } from "./engagement-notifications";
import { hasWebPushConfig, sendWebPush, type WebPushSubscription } from "./web-push";

export type CampaignAudience =
  | "all"
  | "active_7d"
  | "top_20"
  | "streak_users"
  | "zero_points";

export type CampaignStatus = "active" | "paused" | "ended";

export type NotificationCampaign = {
  id: string;
  kind: EngagementNotificationKind | "custom";
  title: string;
  body: string;
  audience: CampaignAudience;
  status: CampaignStatus;
  created_by: string | null;
  created_at: string;
  expires_at: string | null;
};

type UserAudienceRow = {
  id: string;
  name: string | null;
  giveaway_points: number;
  current_streak: number;
  last_login: string | null;
};

const AUDIENCE_LABELS: Record<CampaignAudience, string> = {
  all: "All users",
  active_7d: "Active in last 7 days",
  top_20: "Top 20 leaderboard",
  streak_users: "Users with active streak",
  zero_points: "Users with 0 giveaway points",
};

export function getAudienceLabel(audience: CampaignAudience) {
  return AUDIENCE_LABELS[audience];
}

function matchesAudience(user: UserAudienceRow, audience: CampaignAudience, top20Ids: Set<string>) {
  switch (audience) {
    case "all":
      return true;
    case "active_7d": {
      if (!user.last_login) return false;
      const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
      return new Date(user.last_login).getTime() >= cutoff;
    }
    case "top_20":
      return top20Ids.has(user.id);
    case "streak_users":
      return (user.current_streak ?? 0) > 0;
    case "zero_points":
      return (user.giveaway_points ?? 0) === 0;
    default:
      return false;
  }
}

export async function createCampaign(params: {
  kind: EngagementNotificationKind | "custom";
  title: string;
  body: string;
  audience: CampaignAudience;
  createdBy?: string;
  expiresInHours?: number;
}) {
  if (!hasSupabaseAdmin()) return { ok: false as const, error: "Admin DB unavailable" };

  const title = params.title.trim();
  const body = params.body.trim();
  if (!title || !body) {
    return { ok: false as const, error: "Title and body are required." };
  }

  const expiresAt =
    params.expiresInHours && params.expiresInHours > 0
      ? new Date(Date.now() + params.expiresInHours * 60 * 60 * 1000).toISOString()
      : null;

  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("notification_campaigns")
    .insert({
      kind: params.kind,
      title,
      body,
      audience: params.audience,
      status: "active",
      created_by: params.createdBy ?? null,
      expires_at: expiresAt,
    })
    .select("*")
    .single();

  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const, campaign: data as NotificationCampaign };
}

export async function listCampaigns(limit = 50) {
  if (!hasSupabaseAdmin()) return [];
  const db = getSupabaseAdmin();
  const { data } = await db
    .from("notification_campaigns")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data || []) as NotificationCampaign[];
}

export async function updateCampaignStatus(campaignId: string, status: CampaignStatus) {
  if (!hasSupabaseAdmin()) return { ok: false as const, error: "Admin DB unavailable" };
  const db = getSupabaseAdmin();
  const { error } = await db
    .from("notification_campaigns")
    .update({ status })
    .eq("id", campaignId);
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
}

export async function getPendingCampaignsForUser(userId: string) {
  if (!hasSupabaseAdmin()) return [];

  const db = getSupabaseAdmin();
  const now = new Date().toISOString();

  const [{ data: profile }, { data: topRows }, { data: campaigns }, { data: seen }] =
    await Promise.all([
      db
        .from("user_profiles")
        .select("id, name, giveaway_points, current_streak, last_login, notifications_enabled_at")
        .eq("id", userId)
        .maybeSingle(),
      db
        .from("user_profiles")
        .select("id")
        .order("giveaway_points", { ascending: false })
        .limit(20),
      db
        .from("notification_campaigns")
        .select("id, kind, title, body, audience, status, created_at, expires_at")
        .eq("status", "active")
        .or(`expires_at.is.null,expires_at.gt.${now}`)
        .order("created_at", { ascending: false })
        .limit(20),
      db
        .from("notification_campaign_seen")
        .select("campaign_id")
        .eq("user_id", userId),
    ]);

  if (!profile) return [];

  const enabledAt = (profile as { notifications_enabled_at?: string | null })
    .notifications_enabled_at;
  if (!enabledAt) return [];

  const enabledMs = new Date(enabledAt).getTime();
  const seenIds = new Set((seen || []).map((s) => s.campaign_id));
  const top20Ids = new Set((topRows || []).map((r) => r.id));

  return (campaigns || [])
    .filter((c) => !seenIds.has(c.id))
    .filter((c) => new Date(c.created_at as string).getTime() > enabledMs)
    .filter((c) => matchesAudience(profile as UserAudienceRow, c.audience as CampaignAudience, top20Ids))
    .map((c) => ({
      id: c.id as string,
      kind: c.kind as string,
      title: c.title as string,
      body: c.body as string,
    }));
}

export async function markCampaignSeen(userId: string, campaignId: string) {
  if (!hasSupabaseAdmin()) return { ok: false as const };
  const db = getSupabaseAdmin();
  const { error } = await db.from("notification_campaign_seen").upsert(
    { campaign_id: campaignId, user_id: userId },
    { onConflict: "campaign_id,user_id" }
  );
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
}

function fillTemplate(template: string, params: { firstName?: string; points?: number }) {
  return template
    .replaceAll("{firstName}", params.firstName || "Athlete")
    .replaceAll("{points}", String(params.points ?? 0));
}

async function getAudienceUsers(audience: CampaignAudience): Promise<UserAudienceRow[]> {
  const db = getSupabaseAdmin();
  const { data: users } = await db
    .from("user_profiles")
    .select("id, name, giveaway_points, current_streak, last_login")
    .limit(5000);

  const allUsers = (users || []) as UserAudienceRow[];
  if (audience === "all") return allUsers;

  let top20Ids = new Set<string>();
  if (audience === "top_20") {
    const { data: topRows } = await db
      .from("user_profiles")
      .select("id")
      .order("giveaway_points", { ascending: false })
      .limit(20);
    top20Ids = new Set((topRows || []).map((r) => r.id));
  }

  return allUsers.filter((u) => matchesAudience(u, audience, top20Ids));
}

export type PushReadinessStats = {
  vapidConfigured: boolean;
  totalUsers: number;
  activeSubscriptions: number;
  usersWithPush: number;
  inactiveSubscriptions: number;
  pushReachPercent: number;
  audience: CampaignAudience;
  audienceUsers: number;
  audienceUsersWithPush: number;
  audienceSubscriptions: number;
  audienceReachPercent: number;
};

export async function getPushReadinessStats(
  audience: CampaignAudience = "all"
): Promise<PushReadinessStats> {
  const empty: PushReadinessStats = {
    vapidConfigured: hasWebPushConfig(),
    totalUsers: 0,
    activeSubscriptions: 0,
    usersWithPush: 0,
    inactiveSubscriptions: 0,
    pushReachPercent: 0,
    audience,
    audienceUsers: 0,
    audienceUsersWithPush: 0,
    audienceSubscriptions: 0,
    audienceReachPercent: 0,
  };

  if (!hasSupabaseAdmin()) return empty;

  const db = getSupabaseAdmin();
  const [{ count: totalUsers }, { data: activeSubs }, { count: inactiveCount }] =
    await Promise.all([
      db.from("user_profiles").select("id", { count: "exact", head: true }),
      db.from("push_subscriptions").select("user_id").eq("is_active", true),
      db.from("push_subscriptions").select("id", { count: "exact", head: true }).eq("is_active", false),
    ]);

  const activeRows = activeSubs || [];
  const usersWithPush = new Set(activeRows.map((r) => r.user_id as string)).size;
  const total = totalUsers ?? 0;

  const audienceUsers = await getAudienceUsers(audience);
  const audienceIds = new Set(audienceUsers.map((u) => u.id));
  const audienceSubs = activeRows.filter((r) => audienceIds.has(r.user_id as string));
  const audienceUsersWithPush = new Set(audienceSubs.map((r) => r.user_id as string)).size;
  const audienceUserCount = audienceUsers.length;

  return {
    vapidConfigured: hasWebPushConfig(),
    totalUsers: total,
    activeSubscriptions: activeRows.length,
    usersWithPush,
    inactiveSubscriptions: inactiveCount ?? 0,
    pushReachPercent: total > 0 ? Math.round((usersWithPush / total) * 100) : 0,
    audience,
    audienceUsers: audienceUserCount,
    audienceUsersWithPush,
    audienceSubscriptions: audienceSubs.length,
    audienceReachPercent:
      audienceUserCount > 0
        ? Math.round((audienceUsersWithPush / audienceUserCount) * 100)
        : 0,
  };
}

export async function sendCampaignPushBlast(campaign: NotificationCampaign) {
  if (!hasSupabaseAdmin()) {
    return { ok: false as const, error: "Admin DB unavailable" };
  }
  if (!hasWebPushConfig()) {
    return { ok: false as const, error: "VAPID keys are not configured" };
  }
  if (campaign.status !== "active") {
    return { ok: false as const, error: "Campaign is not active" };
  }

  const db = getSupabaseAdmin();
  const users = await getAudienceUsers(campaign.audience);
  if (users.length === 0) {
    return { ok: true as const, delivered: 0, failed: 0, totalSubscriptions: 0 };
  }

  const userIds = users.map((u) => u.id);
  const { data: subscriptions } = await db
    .from("push_subscriptions")
    .select("id, user_id, endpoint, p256dh, auth")
    .in("user_id", userIds)
    .eq("is_active", true);

  const subRows = subscriptions || [];
  if (subRows.length === 0) {
    return { ok: true as const, delivered: 0, failed: 0, totalSubscriptions: 0 };
  }

  const userById = new Map(users.map((u) => [u.id, u]));
  let delivered = 0;
  let failed = 0;

  for (const sub of subRows) {
    const profile = userById.get(sub.user_id as string);
    if (!profile) continue;

    const firstName = profile.name?.split(/\s+/)[0] || "Athlete";
    const title = fillTemplate(campaign.title, {
      firstName,
      points: profile.giveaway_points ?? 0,
    });
    const body = fillTemplate(campaign.body, {
      firstName,
      points: profile.giveaway_points ?? 0,
    });

    const result = await sendWebPush(
      {
        endpoint: sub.endpoint as string,
        keys: {
          p256dh: sub.p256dh as string,
          auth: sub.auth as string,
        },
      } satisfies WebPushSubscription,
      {
        title,
        body,
        tag: `rf-campaign-${campaign.id}`,
        url: "/dashboard",
        campaignId: campaign.id,
        userId: sub.user_id as string,
      }
    );

    if (result.ok) {
      delivered += 1;
      // Do not mark seen here — FCM accept ≠ user saw it. Client/SW marks seen after display.
      await db
        .from("push_subscriptions")
        .update({
          last_success_at: new Date().toISOString(),
          last_error: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", sub.id);
      continue;
    }

    if (!result.ok) {
      failed += 1;
      const status = "statusCode" in result ? result.statusCode || 0 : 0;
      const errorMessage = "error" in result ? result.error : "Push send failed";
      if (status === 404 || status === 410) {
        await db
          .from("push_subscriptions")
          .update({
            is_active: false,
            last_error: errorMessage,
            updated_at: new Date().toISOString(),
          })
          .eq("id", sub.id);
      } else {
        await db
          .from("push_subscriptions")
          .update({
            last_error: errorMessage,
            updated_at: new Date().toISOString(),
          })
          .eq("id", sub.id);
      }
    }
  }

  return {
    ok: true as const,
    delivered,
    failed,
    totalSubscriptions: subRows.length,
  };
}
