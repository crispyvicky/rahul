"use client";

import { useSession } from "next-auth/react";
import { useUserStore, DEMO_USER } from "@/store/use-user-store";
import { calculateLevel, getStreakEmoji } from "@/lib/utils";
import { Flame, Bell, Zap } from "lucide-react";
import { useEffect, useRef } from "react";
import { upsertUserProfile, updateStreak } from "@/lib/supabase-service";

export default function Topbar() {
  const { data: session } = useSession();
  const { user, login, isAuthenticated } = useUserStore();
  const syncedRef = useRef(false);

  // Sync Google session → Supabase + Zustand on first load
  useEffect(() => {
    async function syncUser() {
      if (session?.user && !syncedRef.current) {
        syncedRef.current = true;

        // Upsert to Supabase (creates profile if first time)
        const dbProfile = await upsertUserProfile({
          google_id: (session.user as any).id || "",
          name: session.user.name || "Athlete",
          email: session.user.email || "",
          avatar_url: session.user.image || "",
        });

        if (dbProfile) {
          // Update streak
          await updateStreak(dbProfile.id);

          // Sync to Zustand store
          login({
            id: dbProfile.id,
            name: dbProfile.name,
            email: dbProfile.email,
            avatarUrl: dbProfile.avatar_url,
            instagramHandle: dbProfile.instagram_handle || "",
            isPremium: dbProfile.is_premium,
            premiumTier: dbProfile.premium_tier as any,
            xpPoints: dbProfile.xp_points,
            currentStreak: dbProfile.current_streak,
            longestStreak: dbProfile.longest_streak,
            onboardingCompleted: dbProfile.onboarding_completed,
            onboardingData: dbProfile.onboarding_data,
          });
        } else {
          // Fallback: just use Google session data
          login({
            ...DEMO_USER,
            name: session.user.name || "Athlete",
            email: session.user.email || "",
            avatarUrl: session.user.image || "",
          });
        }
      }
    }
    syncUser();
  }, [session, login]);

  const displayName = session?.user?.name || user?.name || "Athlete";
  const avatarUrl = session?.user?.image || user?.avatarUrl || "";
  const currentUser = user || DEMO_USER;
  const levelInfo = calculateLevel(currentUser.xpPoints);

  return (
    <header className="min-h-16 border-b border-white/5 bg-surface-card/80 backdrop-blur-xl flex items-center justify-between gap-2 px-4 lg:px-8 shrink-0 pt-[max(0px,env(safe-area-inset-top))]">
      {/* Left */}
      <div className="pl-12 lg:pl-0 min-w-0 flex-1">
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

      {/* Right */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Streak */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-brand/10 border border-brand/20 rounded-full">
          <Flame className="w-3.5 h-3.5 text-brand" />
          <span className="text-brand text-xs font-bold">
            {currentUser.currentStreak} Day Streak
          </span>
          <span>{getStreakEmoji(currentUser.currentStreak)}</span>
        </div>

        {/* Level */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
          <Zap className="w-3.5 h-3.5 text-yellow-400" />
          <span className="text-yellow-400 text-xs font-bold">Lv.{levelInfo.level}</span>
        </div>

        {/* Notifications */}
        <button
          type="button"
          className="relative min-h-11 min-w-11 h-11 w-11 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-text-secondary hover:text-white hover:bg-white/10 transition-all touch-manipulation"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand rounded-full text-[9px] text-white font-bold flex items-center justify-center">
            3
          </span>
        </button>

        {/* Avatar */}
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
