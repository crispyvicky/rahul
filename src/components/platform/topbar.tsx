"use client";

import { useSession } from "next-auth/react";
import { useUserStore, GUEST_USER } from "@/store/use-user-store";
import { calculateLevel, getStreakEmoji } from "@/lib/utils";
import Link from "next/link";
import { Flame, Bell, Zap, Shield } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { mapDbProfileToStore } from "@/lib/user-profile-mapper";
import {
  loadNotificationPreferences,
  NOTIFICATION_PERMISSION_EVENT,
  requestNotificationPermission,
  saveNotificationPreferences,
  sendCustomNotification,
  dispatchNotificationPermissionUpdated,
} from "@/lib/engagement-notifications";

export default function Topbar() {
  const { data: session } = useSession();
  const { user, login } = useUserStore();
  const syncedRef = useRef(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [browserPermission, setBrowserPermission] = useState<
    "default" | "granted" | "denied" | "unsupported"
  >("unsupported");

  const refreshPermission = () => {
    if (typeof Notification === "undefined") {
      setBrowserPermission("unsupported");
      return;
    }
    setBrowserPermission(Notification.permission);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref?.trim()) {
      sessionStorage.setItem("rahulfitzz_ref", ref.trim().toUpperCase());
    }
  }, []);

  useEffect(() => {
    async function syncUser() {
      if (session?.user && !syncedRef.current) {
        syncedRef.current = true;

        const syncRes = await fetch("/api/auth/sync-profile", { method: "POST" });
        const syncJson = await syncRes.json();
        const dbProfile = syncRes.ok ? syncJson.profile : null;

        if (!syncRes.ok) {
          console.warn("[topbar] profile sync failed", syncJson.error);
          syncedRef.current = false;
        }

        if (dbProfile) {
          const refCode = sessionStorage.getItem("rahulfitzz_ref");
          if (refCode) {
            try {
              await fetch("/api/referral/apply", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: dbProfile.id, referralCode: refCode }),
              });
            } catch {
              /* non-blocking */
            }
            sessionStorage.removeItem("rahulfitzz_ref");
          }
          login(mapDbProfileToStore(dbProfile));
        } else {
          login({
            ...GUEST_USER,
            name: session.user.name || "Athlete",
            email: session.user.email || "",
            avatarUrl: session.user.image || "",
          });
        }
      }
    }
    syncUser();
  }, [session, login]);

  useEffect(() => {
    const prefs = loadNotificationPreferences();
    setNotificationsEnabled(prefs.enabled);
    refreshPermission();
    const onPermissionChange = () => refreshPermission();
    window.addEventListener(NOTIFICATION_PERMISSION_EVENT, onPermissionChange);
    return () => {
      window.removeEventListener(NOTIFICATION_PERMISSION_EVENT, onPermissionChange);
    };
  }, []);

  const displayName = session?.user?.name || user?.name || "Athlete";
  const avatarUrl = session?.user?.image || user?.avatarUrl || "";
  const currentUser = user ?? GUEST_USER;
  const levelInfo = calculateLevel(currentUser.xpPoints);

  return (
    <header className="min-h-[4.5rem] sm:min-h-16 border-b border-white/5 bg-surface-card/80 backdrop-blur-xl flex items-center justify-between gap-2 px-4 lg:px-8 shrink-0 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2 lg:pb-0">
      <div className="pl-14 sm:pl-12 lg:pl-0 min-w-0 flex-1 pt-1 lg:pt-0">
        <p className="text-text-secondary text-xs font-medium uppercase tracking-widest">
          Welcome back
        </p>
        <p className="text-white text-sm font-bold -mt-0.5 truncate">{displayName}</p>
        <div className="flex sm:hidden items-center gap-2 mt-1.5 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand/10 border border-brand/20 rounded-full text-brand text-[11px] font-bold">
            <Flame className="w-3 h-3 shrink-0" />
            {currentUser.currentStreak}d
            <span aria-hidden>{getStreakEmoji(currentUser.currentStreak)}</span>
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-yellow-400 text-[11px] font-bold">
            <Zap className="w-3 h-3 shrink-0" />
            Lv.{levelInfo.level}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-brand/10 border border-brand/20 rounded-full">
          <Flame className="w-3.5 h-3.5 text-brand" />
          <span className="text-brand text-xs font-bold">
            {currentUser.currentStreak} Day Streak
          </span>
          <span>{getStreakEmoji(currentUser.currentStreak)}</span>
        </div>

        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
          <Zap className="w-3.5 h-3.5 text-yellow-400" />
          <span className="text-yellow-400 text-xs font-bold">Lv.{levelInfo.level}</span>
        </div>

        {session?.user?.isAdmin && (
          <Link
            href="/admin"
            title="Command Center"
            className="min-h-11 min-w-11 h-11 w-11 bg-yellow-500/10 border border-yellow-500/30 rounded-xl flex items-center justify-center text-yellow-400 hover:bg-yellow-500/20 hover:text-yellow-300 transition-all no-underline"
          >
            <Shield className="w-4 h-4" />
          </Link>
        )}

        <button
          type="button"
          onClick={async () => {
            if (typeof Notification === "undefined") {
              toast.error("Notifications are not supported in this browser.");
              return;
            }

            saveNotificationPreferences({ enabled: true });
            setNotificationsEnabled(true);

            const permission = await requestNotificationPermission();
            refreshPermission();
            dispatchNotificationPermissionUpdated();

            const firstName = displayName.split(" ")[0] || "Athlete";

            if (permission === "denied") {
              toast.error(
                "Notifications are blocked. Turn them on in your browser or phone settings.",
                { duration: 5000 }
              );
              return;
            }

            if (permission !== "granted") {
              toast("Tap Allow in the popup to get gym & giveaway alerts.", { icon: "🔔" });
              return;
            }

            const shown = await sendCustomNotification(
              "Notifications are on 🔔",
              `Hey ${firstName}, you'll get giveaway drops, points, and gym nudges right here.`,
              `rf-bell-preview-${Date.now()}`
            );

            if (shown) {
              toast.success("Preview sent — you'll get alerts like this!");
            } else {
              toast.success("Notifications enabled. Check your notification center.");
            }
          }}
          className={`relative min-h-11 min-w-11 h-11 w-11 rounded-xl flex items-center justify-center transition-all touch-manipulation ${
            browserPermission === "granted"
              ? "bg-white/5 border border-white/10 text-text-secondary hover:text-white hover:bg-white/10"
              : "bg-brand/15 border border-brand/40 text-brand hover:bg-brand/25 animate-pulse"
          }`}
          aria-label={
            browserPermission === "granted"
              ? "Notifications on"
              : "Tap to allow notifications"
          }
          title={
            browserPermission === "granted"
              ? "Notifications on — gym & giveaway alerts"
              : browserPermission === "denied"
                ? "Notifications blocked — enable in browser settings"
                : "Tap to allow notifications"
          }
        >
          <Bell className="w-4 h-4" />
          {browserPermission === "granted" && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-400" />
          )}
          {browserPermission === "default" && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-yellow-400" />
          )}
        </button>

        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="h-11 w-11 min-h-11 min-w-11 rounded-xl border-2 border-brand/30 hover:border-brand transition-colors object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="h-11 w-11 min-h-11 min-w-11 rounded-xl bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center text-white text-xs font-bold border-2 border-brand/30">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    </header>
  );
}