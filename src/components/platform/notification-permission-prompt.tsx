"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Bell, Gift, X } from "lucide-react";
import { useUserStore } from "@/store/use-user-store";
import { isUuidUserId } from "@/lib/api-guards";
import { isTourCompleted, TOUR_COMPLETED_EVENT } from "@/lib/app-tour";
import {
  dispatchNotificationPermissionUpdated,
  hasSeenNotificationPrompt,
  loadNotificationPreferences,
  markNotificationPromptSeen,
  requestNotificationPermission,
  saveNotificationPreferences,
} from "@/lib/engagement-notifications";

export default function NotificationPermissionPrompt() {
  const { data: session, status } = useSession();
  const { user } = useUserStore();
  const [open, setOpen] = useState(false);
  const [enabling, setEnabling] = useState(false);

  const userId = user?.id && isUuidUserId(user.id) ? user.id : null;
  const firstName =
    user?.name?.split(/\s+/)[0] ||
    session?.user?.name?.split(/\s+/)[0] ||
    "Athlete";

  const tryOpenPrompt = useCallback(() => {
    if (!userId || status !== "authenticated") return;
    if (typeof Notification === "undefined") return;
    if (Notification.permission !== "default") return;
    if (!loadNotificationPreferences().enabled) return;
    if (hasSeenNotificationPrompt(userId)) return;
    setOpen(true);
  }, [status, userId]);

  useEffect(() => {
    if (!userId || status !== "authenticated") return;

    const userKey = userId;
    let timer: number | undefined;

    const schedule = () => {
      timer = window.setTimeout(tryOpenPrompt, 1200);
    };

    if (isTourCompleted(userKey)) {
      schedule();
    } else {
      window.addEventListener(TOUR_COMPLETED_EVENT, schedule, { once: true });
      timer = window.setTimeout(tryOpenPrompt, 120000);
    }

    return () => {
      if (timer) window.clearTimeout(timer);
      window.removeEventListener(TOUR_COMPLETED_EVENT, schedule);
    };
  }, [status, tryOpenPrompt, userId]);

  const closePrompt = () => {
    if (userId) markNotificationPromptSeen(userId);
    setOpen(false);
  };

  const handleEnable = async () => {
    if (!userId) return;
    setEnabling(true);
    try {
      saveNotificationPreferences({ enabled: true });
      const permission = await requestNotificationPermission();
      markNotificationPromptSeen(userId);
      dispatchNotificationPermissionUpdated();
      setOpen(false);
      if (permission === "granted") {
        /* push host will subscribe on permission event */
      }
    } finally {
      setEnabling(false);
    }
  };

  const handleDismiss = () => {
    closePrompt();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[96] flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rf-notification-prompt-title"
    >
      <div className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 relative shadow-2xl">
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-text-muted hover:text-white"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-brand/15 border border-brand/30 flex items-center justify-center">
            <Bell className="w-6 h-6 text-brand" />
          </div>
          <div>
            <p
              id="rf-notification-prompt-title"
              className="text-white font-black text-lg uppercase tracking-tight font-heading"
            >
              Enable notifications?
            </p>
            <p className="text-text-muted text-xs mt-0.5">Stay in the giveaway race</p>
          </div>
        </div>

        <p className="text-text-secondary text-sm leading-relaxed">
          Hey {firstName}, get instant alerts for giveaway drops, point boosts, gym nudges, and
          leaderboard moves — even when the app is closed.
        </p>

        <div className="mt-4 flex items-center gap-2 text-xs text-yellow-400/90">
          <Gift className="w-4 h-4 shrink-0" />
          <span>Don&apos;t miss last-hour giveaway reminders.</span>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleEnable}
            disabled={enabling}
            className="flex-1 py-3 bg-brand text-white font-bold text-xs uppercase tracking-widest rounded-xl disabled:opacity-50"
          >
            {enabling ? "Enabling…" : "Yes, notify me"}
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            disabled={enabling}
            className="flex-1 py-3 bg-white/5 border border-white/10 text-text-secondary font-bold text-xs uppercase tracking-widest rounded-xl hover:text-white disabled:opacity-50"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
