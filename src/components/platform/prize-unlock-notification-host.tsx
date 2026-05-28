"use client";

import { useCallback, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useUserStore } from "@/store/use-user-store";
import { isUuidUserId } from "@/lib/api-guards";
import {
  loadNotificationPreferences,
  sendCustomNotification,
} from "@/lib/engagement-notifications";

type PrizeUnlockPayload = {
  id: string;
  prize_name: string;
  points_required: number;
};

export default function PrizeUnlockNotificationHost() {
  const { data: session } = useSession();
  const { user } = useUserStore();
  const deliveredRef = useRef<Set<string>>(new Set());

  const userId = user?.id && isUuidUserId(user.id) ? user.id : null;

  const deliverPrizeUnlocks = useCallback(async () => {
    if (!userId || !session?.user) return;
    const prefs = loadNotificationPreferences();
    if (!prefs.enabled) return;
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;

    try {
      const res = await fetch(
        `/api/notifications/prize-unlocks?userId=${encodeURIComponent(userId)}`
      );
      if (!res.ok) return;
      const json = (await res.json()) as { unlocks?: PrizeUnlockPayload[] };
      const unlocks = json.unlocks || [];
      if (unlocks.length === 0) return;

      const firstName = user?.name?.split(/\s+/)[0] || "Athlete";
      const seenIds: string[] = [];

      for (const unlock of unlocks) {
        if (deliveredRef.current.has(unlock.id)) continue;

        const title = `🎁 ${unlock.prize_name} unlocked!`;
        const body = `Hey ${firstName}, you reached ${unlock.points_required.toLocaleString()} pts. Open the prize sheet to request delivery.`;

        const shown = await sendCustomNotification(title, body, `rf-prize-${unlock.id}`);
        if (!shown) continue;

        deliveredRef.current.add(unlock.id);
        seenIds.push(unlock.id);
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
    }
  }, [session?.user, user?.name, userId]);

  useEffect(() => {
    void deliverPrizeUnlocks();

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void deliverPrizeUnlocks();
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    const interval = window.setInterval(() => {
      void deliverPrizeUnlocks();
    }, 45000);

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.clearInterval(interval);
    };
  }, [deliverPrizeUnlocks]);

  return null;
}
