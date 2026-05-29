/** Client-side notification timing & welcome copy. */

export const NOTIFICATION_WELCOME_DELAY_MS = 3000;
export const NOTIFICATION_BACKLOG_DELAY_MS = 45000;
export const NOTIFICATION_STAGGER_MS = 14000;

const DELIVER_AFTER_KEY = "rf_notif_deliver_after_v1";

function deliverAfterStorageKey(userId: string) {
  return `${DELIVER_AFTER_KEY}:${userId}`;
}

export function setNotificationDeliveryGate(userId: string, delayMs: number) {
  if (typeof window === "undefined") return;
  const until = Date.now() + delayMs;
  localStorage.setItem(deliverAfterStorageKey(userId), String(until));
}

export function isNotificationDeliveryGated(userId: string) {
  if (typeof window === "undefined") return true;
  const raw = localStorage.getItem(deliverAfterStorageKey(userId));
  if (!raw) return false;
  return Date.now() < Number(raw);
}

export function clearNotificationDeliveryGate(userId: string) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(deliverAfterStorageKey(userId));
}

export function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

const WELCOME_MESSAGES = [
  {
    title: "Welcome to RahulFitzz 💪",
    body: (name: string) =>
      `Hey ${name}, thanks for joining the squad. You showed up — now let's build the best version of you, one day at a time.`,
  },
  {
    title: "You're in. Let's go 🔥",
    body: (name: string) =>
      `${name}, glad you're here. Stay consistent, stack points, and prove what you're capable of.`,
  },
  {
    title: "Thanks for joining us 🙌",
    body: (name: string) =>
      `Welcome ${name}! RahulFitzz is your gym + giveaway home. We'll nudge you with wins — never spam, only what matters.`,
  },
];

export function pickWelcomeNotification(firstName: string) {
  const pick = WELCOME_MESSAGES[Math.floor(Math.random() * WELCOME_MESSAGES.length)];
  return {
    title: pick.title,
    body: pick.body(firstName || "Athlete"),
  };
}
