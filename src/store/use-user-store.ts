import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  instagramHandle: string;
  isPremium: boolean;
  premiumTier: "free" | "warrior" | "elite" | "custom";
  xpPoints: number;
  giveawayPoints: number;
  referralCode: string;
  currentStreak: number;
  longestStreak: number;
  onboardingData: {
    age: number;
    weight: number;
    height: number;
    goal: "fat_loss" | "muscle_gain" | "maintain" | "endurance";
    fitnessLevel: "beginner" | "intermediate" | "advanced";
    workoutDays: number;
  } | null;
  onboardingCompleted: boolean;
}

interface UserState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: UserProfile) => void;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  syncFromServer: (data: Partial<UserProfile>) => void;
  addXP: (amount: number) => void;
  addGiveawayPoints: (amount: number) => void;
  incrementStreak: () => void;
  completeOnboarding: (data: UserProfile["onboardingData"]) => void;
}

/** Empty guest — no fake XP/streak; used only when UI needs a shape before login. */
export const GUEST_USER: UserProfile = {
  id: "",
  name: "Athlete",
  email: "",
  avatarUrl: "",
  instagramHandle: "",
  isPremium: false,
  premiumTier: "free",
  xpPoints: 0,
  giveawayPoints: 0,
  referralCode: "",
  currentStreak: 0,
  longestStreak: 0,
  onboardingData: null,
  onboardingCompleted: false,
};

/** @deprecated Use GUEST_USER */
export const DEMO_USER = GUEST_USER;

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: (user) => set({ user, isAuthenticated: true }),

      logout: () => {
        set({ user: null, isAuthenticated: false });
        if (typeof window !== "undefined") {
          localStorage.removeItem("rahulfitzz-user");
        }
      },

      updateProfile: (data) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        })),

      syncFromServer: (data) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        })),

      addXP: (amount) =>
        set((state) => ({
          user: state.user
            ? { ...state.user, xpPoints: state.user.xpPoints + amount }
            : null,
        })),

      addGiveawayPoints: (amount) =>
        set((state) => ({
          user: state.user
            ? { ...state.user, giveawayPoints: state.user.giveawayPoints + amount }
            : null,
        })),

      incrementStreak: () =>
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                currentStreak: state.user.currentStreak + 1,
                longestStreak: Math.max(
                  state.user.longestStreak,
                  state.user.currentStreak + 1
                ),
              }
            : null,
        })),

      completeOnboarding: (data) =>
        set((state) => ({
          user: state.user
            ? { ...state.user, onboardingData: data, onboardingCompleted: true }
            : null,
        })),
    }),
    {
      name: "rahulfitzz-user",
    }
  )
);
