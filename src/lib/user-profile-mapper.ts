import type { DbUserProfile } from "./supabase";
import type { UserProfile } from "@/store/use-user-store";

export function mapDbProfileToStore(p: DbUserProfile): UserProfile {
  return {
    id: p.id,
    name: p.name,
    email: p.email,
    avatarUrl: p.avatar_url || "",
    instagramHandle: p.instagram_handle || "",
    isPremium: p.is_premium,
    premiumTier: p.premium_tier as UserProfile["premiumTier"],
    xpPoints: p.xp_points ?? 0,
    giveawayPoints: p.giveaway_points ?? 0,
    referralCode: p.referral_code || "",
    currentStreak: p.current_streak ?? 0,
    longestStreak: p.longest_streak ?? 0,
    onboardingCompleted: p.onboarding_completed ?? false,
    onboardingData: p.onboarding_data ?? null,
  };
}
