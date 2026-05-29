"use client";

import { useCallback, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useUserStore } from "@/store/use-user-store";
import { isUuidUserId } from "@/lib/api-guards";
import {
  loadNotificationPreferences,
  sendCustomNotification,
} from "@/lib/engagement-notifications";
import {
  isNotificationDeliveryGated,
  NOTIFICATION_STAGGER_MS,
  sleep,
} from "@/lib/notification-client";

type PrizeUnlockPayload = {
  id: string;
  prize_name: string;
  points_required: number;
};

export default function PrizeUnlockNotificationHost() {
  const { data: session } = useSession();
  const { user } = useUserStore();
  const deliveredRef = useRef<Set<string>>(new Set());
  const deliveringRef = useRef(false);

  const userId = user?.id && isUuidUserId(user.id) ? user.id : null;

  const deliverPrizeUnlocks = useCallback(async () => {
    if (!userId || !session?.user) return;
    if (isNotificationDeliveryGated(userId)) return;
    if (deliveringRef.current) return;

    const prefs = loadNotificationPreferences();
    if (!prefs.enabled) return;
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;

    deliveringRef.current = true;
    try {
      const res = await fetch(
        `/api/notifications/prize-unlocks?userId=${encodeURIComponent(userId)}`
      );
      if (!res.ok) return;
      const json = (await res.json()) as { unlocks?: PrizeUnlockPayload[] };
      const unlocks = (json.unlocks || []).filter(
        (u) => !deliveredRef.current.has(u.id)
      );
      if (unlocks.length === 0) return;

      const firstName = user?.name?.split(/\s+/)[0] || "Athlete";
      const seenIds: string[] = [];

      for (let i = 0; i < unlocks.length; i++) {
        const unlock = unlocks[i];
        if (deliveredRef.current.has(unlock.id)) continue;
        if (isNotificationDeliveryGated(userId)) break;

        const title = `🎁 ${unlock.prize_name} unlocked!`;
        const body = `Hey ${firstName}, you reached ${unlock.points_required.toLocaleString()} pts. Open the prize sheet to request delivery.`;

        const shown = await sendCustomNotification(title, body, `rf-prize-${unlock.id}`);
        if (!shown) break;

        deliveredRef.current.add(unlock.id);
        seenIds.push(unlock.id);

        if (i < unlocks.length - 1) {
          await sleep(NOTIFICATION_STAGGER_MS);
        }
      }

      if (seenIds.length > 0) {
        await fetch("/api/notifications/prize-unlocks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, alertIds: seenIds }),
        });
      }
    } catch {
      /* non-blocking */
    } finally {
      deliveringRef.current = false;
    }
  }, [session?.user, user?.name, userId]);

  useEffect(() => {
    const tick = () => {
      if (!userId || isNotificationDeliveryGated(userId)) return;
      void deliverPrizeUnlocks();
    };

    const initial = window.setTimeout(tick, 8000);
    const interval = window.setInterval(tick, 60000);

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        tick();
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.clearTimeout(initial);
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [deliverPrizeUnlocks, userId]);

  return null;
}
