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
  addXP: (amount: number) => void;
  incrementStreak: () => void;
  completeOnboarding: (data: UserProfile["onboardingData"]) => void;
}

// Demo user for development
export const DEMO_USER: UserProfile = {
  id: "demo-001",
  name: "Rahul",
  email: "demo@rahulfitzz.com",
  avatarUrl: "",
  instagramHandle: "@rahulfitzz",
  isPremium: false,
  premiumTier: "free",
  xpPoints: 2450,
  currentStreak: 12,
  longestStreak: 28,
  onboardingData: {
    age: 24,
    weight: 75,
    height: 178,
    goal: "muscle_gain",
    fitnessLevel: "intermediate",
    workoutDays: 5,
  },
  onboardingCompleted: true,
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: (user) => set({ user, isAuthenticated: true }),

      logout: () => {
        set({ user: null, isAuthenticated: false });
        // Clear persisted storage so stale profile doesn't re-appear on reload
        if (typeof window !== "undefined") {
          localStorage.removeItem("rahulfitzz-user");
        }
      },

      updateProfile: (data) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        })),

      addXP: (amount) =>
        set((state) => ({
          user: state.user
            ? { ...state.user, xpPoints: state.user.xpPoints + amount }
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
