"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useUserStore } from "@/store/use-user-store";
import { isUuidUserId } from "@/lib/api-guards";
import {
  loadNotificationPreferences,
  NOTIFICATION_PERMISSION_EVENT,
} from "@/lib/engagement-notifications";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
const STORED_VAPID_KEY = "rahulfitzz_vapid_public_v1";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PushSubscriptionHost() {
  const { data: session } = useSession();
  const { user } = useUserStore();
  const [syncTick, setSyncTick] = useState(0);
  const userId = user?.id && isUuidUserId(user.id) ? user.id : null;

  useEffect(() => {
    const handler = () => setSyncTick((v) => v + 1);
    window.addEventListener(NOTIFICATION_PERMISSION_EVENT, handler);
    return () => {
      window.removeEventListener(NOTIFICATION_PERMISSION_EVENT, handler);
    };
  }, []);

  useEffect(() => {
    if (!userId || !session?.user) return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    if (!VAPID_PUBLIC_KEY) return;

    let cancelled = false;

    (async () => {
      try {
        const prefs = loadNotificationPreferences();
        let registration = await navigator.serviceWorker.getRegistration();
        if (!registration) {
          registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
        }
        await navigator.serviceWorker.ready;
        const appServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource;
        let existingSubscription = await registration.pushManager.getSubscription();

        if (!prefs.enabled || Notification.permission === "denied") {
          if (existingSubscription) {
            const endpoint = existingSubscription.endpoint;
            await existingSubscription.unsubscribe();
            await fetch("/api/notifications/push-subscriptions", {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId, endpoint }),
            });
          }
          return;
        }

        if (Notification.permission !== "granted") return;

        // Re-subscribe if VAPID public key changed in .env
        const storedVapid = localStorage.getItem(STORED_VAPID_KEY);
        if (storedVapid && storedVapid !== VAPID_PUBLIC_KEY && existingSubscription) {
          await existingSubscription.unsubscribe();
          existingSubscription = null;
        }
        localStorage.setItem(STORED_VAPID_KEY, VAPID_PUBLIC_KEY);

        const subscription =
          existingSubscription ||
          (await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: appServerKey,
          }));

        if (cancelled || !subscription) return;
        const res = await fetch("/api/notifications/push-subscriptions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            subscription: subscription.toJSON(),
            userAgent: navigator.userAgent,
          }),
        });
        if (!res.ok) {
          console.warn("[push] failed to save subscription", await res.text());
        } else {
          console.info("[push] subscription saved for", userId);
        }
      } catch (e) {
        console.warn("[push] subscribe error", e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [session?.user, userId, syncTick]);

  return null;
}
