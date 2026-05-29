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

type CampaignPayload = {
  id: string;
  title: string;
  body: string;
};

export default function CampaignNotificationHost() {
  const { data: session } = useSession();
  const { user } = useUserStore();
  const deliveredRef = useRef<Set<string>>(new Set());
  const deliveringRef = useRef(false);

  const userId = user?.id && isUuidUserId(user.id) ? user.id : null;

  const deliverPendingCampaigns = useCallback(async () => {
    if (!userId || !session?.user) return;
    if (isNotificationDeliveryGated(userId)) return;
    if (deliveringRef.current) return;

    const prefs = loadNotificationPreferences();
    if (!prefs.enabled) return;
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;

    deliveringRef.current = true;
    try {
      const res = await fetch(
        `/api/notifications/campaigns?userId=${encodeURIComponent(userId)}`
      );
      if (!res.ok) return;
      const json = (await res.json()) as { campaigns?: CampaignPayload[] };
      const campaigns = (json.campaigns || []).filter(
        (c) => !deliveredRef.current.has(c.id)
      );
      if (campaigns.length === 0) return;

      const firstName = user?.name?.split(/\s+/)[0] || "Athlete";

      for (let i = 0; i < campaigns.length; i++) {
        const campaign = campaigns[i];
        if (deliveredRef.current.has(campaign.id)) continue;
        if (isNotificationDeliveryGated(userId)) break;

        const title = campaign.title
          .replaceAll("{firstName}", firstName)
          .replaceAll("{points}", String(user?.giveawayPoints ?? 0));
        const body = campaign.body
          .replaceAll("{firstName}", firstName)
          .replaceAll("{points}", String(user?.giveawayPoints ?? 0));

        const shown = await sendCustomNotification(
          title,
          body,
          `rf-campaign-${campaign.id}`
        );
        if (!shown) break;

        deliveredRef.current.add(campaign.id);
        await fetch("/api/notifications/campaigns/seen", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, campaignId: campaign.id }),
        });

        if (i < campaigns.length - 1) {
          await sleep(NOTIFICATION_STAGGER_MS);
        }
      }
    } catch {
      /* non-blocking */
    } finally {
      deliveringRef.current = false;
    }
  }, [session?.user, user?.giveawayPoints, user?.name, userId]);

  useEffect(() => {
    const tick = () => {
      if (!isNotificationDeliveryGated(userId || "")) {
        void deliverPendingCampaigns();
      }
    };

    const initial = window.setTimeout(tick, 5000);
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
  }, [deliverPendingCampaigns, userId]);

  return null;
}
