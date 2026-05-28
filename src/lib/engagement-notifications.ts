export type EngagementNotificationKind =
  | "gym_nudge"
  | "points_earned"
  | "points_pending"
  | "prize_unlocked"
  | "giveaway_live"
  | "giveaway_ending"
  | "leaderboard_push";

export const ENGAGEMENT_KIND_OPTIONS: {
  value: EngagementNotificationKind | "custom";
  label: string;
  sampleTitle: string;
  sampleBody: string;
}[] = [
  {
    value: "gym_nudge",
    label: "Gym nudge",
    sampleTitle: "Gym called. You coming?",
    sampleBody: "Hey {firstName}, today we train. No excuses, only progress.",
  },
  {
    value: "giveaway_live",
    label: "Giveaway live",
    sampleTitle: "Giveaway is live 🎁",
    sampleBody: "Your next reward could be one action away. Go claim now.",
  },
  {
    value: "giveaway_ending",
    label: "Giveaway ending soon",
    sampleTitle: "Last hours for giveaway",
    sampleBody: "Final push {firstName}. Don’t let this prize slip.",
  },
  {
    value: "leaderboard_push",
    label: "Leaderboard push",
    sampleTitle: "Someone is catching up 👀",
    sampleBody: "Defend your rank. Hit gym + claim points now.",
  },
  {
    value: "points_earned",
    label: "Points earned",
    sampleTitle: "+{points} points unlocked",
    sampleBody: "Nice move {firstName}. Keep stacking points and climb the leaderboard.",
  },
  {
    value: "points_pending",
    label: "Points pending review",
    sampleTitle: "Claim submitted",
    sampleBody: "Your proof is under review. Approval = instant points boost.",
  },
  {
    value: "prize_unlocked",
    label: "Prize tier unlocked",
    sampleTitle: "🎁 {prizeName} unlocked!",
    sampleBody: "Hey {firstName}, you hit {points} pts. Open the prize sheet to claim.",
  },
  {
    value: "custom",
    label: "Custom message",
    sampleTitle: "RahulFitzz update",
    sampleBody: "Write your own catchy line here.",
  },
];

type NotificationTemplate = {
  title: string;
  body: string;
};

type TemplateParams = {
  firstName?: string;
  points?: number;
  prizeName?: string;
};

export type NotificationPreferences = {
  enabled: boolean;
};

export const NOTIFICATION_PREFS_KEY = "rahulfitzz_notification_prefs_v1";
export const NOTIFICATION_PROMPT_KEY = "rahulfitzz_notification_prompt_v1";
export const NOTIFICATION_PERMISSION_EVENT = "rf-notification-permission-updated";
export const DEFAULT_NOTIFICATION_PREFS: NotificationPreferences = {
  // Requested default: everyone subscribed unless they turn it off.
  enabled: true,
};

const TEMPLATES: Record<EngagementNotificationKind, NotificationTemplate[]> = {
  gym_nudge: [
    { title: "Gym called. You coming?", body: "Hey {firstName}, today we train. No excuses, only progress." },
    { title: "Your dumbbells miss you", body: "One session today = better mood, better body, better you." },
    { title: "No overthinking. Just one set.", body: "Start small and finish strong. Your future self is watching." },
    { title: "Energy low? Lift anyway.", body: "Workout first. Motivation catches up later." },
  ],
  points_earned: [
    { title: "+{points} points unlocked", body: "Nice move {firstName}. Keep stacking points and climb the leaderboard." },
    { title: "Points in. Rank up next.", body: "You earned +{points}. One more action and you could jump places." },
    { title: "RahulFitzz rewards you", body: "+{points} points credited. Discipline is paying off." },
  ],
  points_pending: [
    { title: "Claim submitted", body: "Your proof is under review. Approval = instant points boost." },
    { title: "Pending review", body: "We got your claim. Sit tight — points should hit soon." },
  ],
  prize_unlocked: [
    {
      title: "🎁 {prizeName} unlocked!",
      body: "Hey {firstName}, you hit {points} pts. Open the prize sheet to request your gear.",
    },
    {
      title: "New prize tier 🏆",
      body: "{prizeName} is yours at {points} points. Tap the dashboard to claim.",
    },
    {
      title: "You earned a real reward",
      body: "{firstName}, {prizeName} unlocked. Request delivery before stock runs out.",
    },
  ],
  giveaway_live: [
    { title: "Giveaway is live 🎁", body: "Your next reward could be one action away. Go claim now." },
    { title: "Leaderboard battle ON", body: "Points race is active. Enter now and push top spots." },
  ],
  giveaway_ending: [
    { title: "Last hours for giveaway", body: "Final push {firstName}. Don’t let this prize slip." },
    { title: "Giveaway closing soon", body: "Quick actions now can change your final rank." },
  ],
  leaderboard_push: [
    { title: "Someone is catching up 👀", body: "Defend your rank. Hit gym + claim points now." },
    { title: "Top ranks moving fast", body: "Stay in the race. One push today can flip the board." },
  ],
};

function fillTemplate(template: string, params: TemplateParams) {
  return template
    .replaceAll("{firstName}", params.firstName || "Athlete")
    .replaceAll("{points}", String(params.points ?? 0))
    .replaceAll("{prizeName}", params.prizeName || "a prize");
}

export function loadNotificationPreferences(): NotificationPreferences {
  if (typeof window === "undefined") return DEFAULT_NOTIFICATION_PREFS;
  try {
    const raw = localStorage.getItem(NOTIFICATION_PREFS_KEY);
    if (!raw) return DEFAULT_NOTIFICATION_PREFS;
    const parsed = JSON.parse(raw) as Partial<NotificationPreferences>;
    return {
      enabled:
        typeof parsed.enabled === "boolean"
          ? parsed.enabled
          : DEFAULT_NOTIFICATION_PREFS.enabled,
    };
  } catch {
    return DEFAULT_NOTIFICATION_PREFS;
  }
}

export function saveNotificationPreferences(prefs: NotificationPreferences) {
  if (typeof window === "undefined") return;
  localStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(prefs));
}

export function notificationPromptStorageKey(userId: string) {
  return `${NOTIFICATION_PROMPT_KEY}:${userId}`;
}

export function hasSeenNotificationPrompt(userId: string) {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(notificationPromptStorageKey(userId)) === "1";
}

export function markNotificationPromptSeen(userId: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(notificationPromptStorageKey(userId), "1");
}

export function dispatchNotificationPermissionUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(NOTIFICATION_PERMISSION_EVENT));
}

export async function requestNotificationPermission(): Promise<NotificationPermission | null> {
  if (typeof window === "undefined" || !("Notification" in window)) return null;
  if (Notification.permission === "default") {
    return Notification.requestPermission();
  }
  return Notification.permission;
}

export async function sendCustomNotification(
  title: string,
  body: string,
  tag = "rf-campaign"
) {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  const prefs = loadNotificationPreferences();
  if (!prefs.enabled || Notification.permission !== "granted") return false;

  try {
    if ("serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        await reg.showNotification(title, {
          body,
          icon: "/icon.png",
          badge: "/icon.png",
          tag,
        });
        return true;
      }
    }
    new Notification(title, { body, icon: "/icon.png" });
    return true;
  } catch {
    return false;
  }
}

export async function sendEngagementNotification(
  kind: EngagementNotificationKind,
  params: TemplateParams = {}
) {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  const prefs = loadNotificationPreferences();
  if (!prefs.enabled || Notification.permission !== "granted") return false;

  const pool = TEMPLATES[kind];
  const chosen = pool[Math.floor(Math.random() * pool.length)];
  const title = fillTemplate(chosen.title, params);
  const body = fillTemplate(chosen.body, params);

  try {
    if ("serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        await reg.showNotification(title, {
          body,
          icon: "/icon.png",
          badge: "/icon.png",
          tag: `rf-${kind}`,
        });
        return true;
      }
    }
    new Notification(title, { body, icon: "/icon.png" });
    return true;
  } catch {
    return false;
  }
}
