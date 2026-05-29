"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useUserStore } from "@/store/use-user-store";
import { isUuidUserId } from "@/lib/api-guards";
import {
  loadNotificationPreferences,
  NOTIFICATION_PERMISSION_EVENT,
  sendCustomNotification,
} from "@/lib/engagement-notifications";
import {
  clearNotificationDeliveryGate,
  NOTIFICATION_BACKLOG_DELAY_MS,
  NOTIFICATION_WELCOME_DELAY_MS,
  pickWelcomeNotification,
  setNotificationDeliveryGate,
  sleep,
} from "@/lib/notification-client";

/**
 * On first notification opt-in: register with server (skip old campaigns),
 * show a delayed welcome toast, then gate backlog delivery.
 */
export default function NotificationOptInHost() {
  const { data: session } = useSession();
  const { user } = useUserStore();
  const runningRef = useRef(false);

  const userId = user?.id && isUuidUserId(user.id) ? user.id : null;

  useEffect(() => {
    if (!userId || !session?.user) return;

    const runOptIn = async () => {
      if (typeof Notification === "undefined") return;
      if (Notification.permission !== "granted") return;
      if (!loadNotificationPreferences().enabled) return;
      if (runningRef.current) return;

      runningRef.current = true;
      try {
        const res = await fetch("/api/notifications/opt-in", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });
        const json = await res.json();
        if (!res.ok) return;

        if (json.alreadyOptedIn) {
          clearNotificationDeliveryGate(userId);
          return;
        }

        setNotificationDeliveryGate(
          userId,
          NOTIFICATION_WELCOME_DELAY_MS + NOTIFICATION_BACKLOG_DELAY_MS
        );

        await sleep(NOTIFICATION_WELCOME_DELAY_MS);

          const firstName =
            user?.name?.split(/\s+/)[0] ||
            session.user?.name?.split(/\s+/)[0] ||
            "Athlete";
          const welcome = pickWelcomeNotification(firstName);
        await sendCustomNotification(
          welcome.title,
          welcome.body,
          `rf-welcome-${userId}`
        );
      } catch {
        /* non-blocking */
      } finally {
        runningRef.current = false;
      }
    };

    void runOptIn();

    const onPermission = () => {
      void runOptIn();
    };
    window.addEventListener(NOTIFICATION_PERMISSION_EVENT, onPermission);

    return () => {
      window.removeEventListener(NOTIFICATION_PERMISSION_EVENT, onPermission);
    };
  }, [session?.user, user?.name, userId]);

  return null;
}
