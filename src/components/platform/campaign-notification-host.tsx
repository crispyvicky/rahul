"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useUserStore } from "@/store/use-user-store";
import { isUuidUserId } from "@/lib/api-guards";
import {
  loadNotificationPreferences,
  sendCustomNotification,
} from "@/lib/engagement-notifications";

type CampaignPayload = {
  id: string;
  title: string;
  body: string;
};

export default function CampaignNotificationHost() {
  const { data: session } = useSession();
  const { user } = useUserStore();
  const deliveredRef = useRef<Set<string>>(new Set());

  const userId = user?.id && isUuidUserId(user.id) ? user.id : null;

  useEffect(() => {
    if (!userId || !session?.user) return;
    const prefs = loadNotificationPreferences();
    if (!prefs.enabled) return;
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(
          `/api/notifications/campaigns?userId=${encodeURIComponent(userId)}`
        );
        if (!res.ok || cancelled) return;
        const json = (await res.json()) as { campaigns?: CampaignPayload[] };
        const campaigns = json.campaigns || [];

        for (const campaign of campaigns) {
          if (cancelled || deliveredRef.current.has(campaign.id)) continue;
          const firstName = user?.name?.split(/\s+/)[0] || "Athlete";
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
          if (!shown) continue;

          deliveredRef.current.add(campaign.id);
          await fetch("/api/notifications/campaigns/seen", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, campaignId: campaign.id }),
          });
        }
      } catch {
        /* non-blocking */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, session?.user]);

  return null;
}
