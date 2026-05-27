import webpush from "web-push";

export type WebPushSubscription = {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
};

type PushPayload = {
  title: string;
  body: string;
  tag?: string;
  url?: string;
  campaignId?: string;
  userId?: string;
};

let vapidConfigured = false;

function getVapidConfig() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:admin@rahulfitzz.com";
  return { publicKey, privateKey, subject };
}

export function hasWebPushConfig() {
  const { publicKey, privateKey } = getVapidConfig();
  return Boolean(publicKey && privateKey);
}

function ensureWebPushConfigured() {
  if (vapidConfigured) return;
  const { publicKey, privateKey, subject } = getVapidConfig();
  if (!publicKey || !privateKey) {
    throw new Error("Missing VAPID keys");
  }
  webpush.setVapidDetails(subject, publicKey, privateKey);
  vapidConfigured = true;
}

export async function sendWebPush(
  subscription: WebPushSubscription,
  payload: PushPayload
): Promise<{ ok: true } | { ok: false; statusCode?: number; error: string }> {
  try {
    ensureWebPushConfigured();
    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: payload.title,
        body: payload.body,
        tag: payload.tag || "rf-campaign",
        url: payload.url || "/dashboard",
        icon: "/icon.png",
        badge: "/icon.png",
        campaignId: payload.campaignId,
        userId: payload.userId,
      })
    );
    return { ok: true };
  } catch (error: any) {
    return {
      ok: false,
      statusCode: typeof error?.statusCode === "number" ? error.statusCode : undefined,
      error: error?.message || "Push send failed",
    };
  }
}
