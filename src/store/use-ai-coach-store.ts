import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/**
 * AI Coach state — persisted to sessionStorage so plans survive
 * tab reloads and phone-call interruptions.
 */

interface AiCoachState {
  isGenerating: boolean;
  generatingTab: "workout" | "diet" | "analyze" | null;
  generationPromise: Promise<unknown> | null;

  lastWorkoutPlan: unknown | null;
  lastDietPlan: unknown | null;
  lastPhysiqueAnalysis: unknown | null;
  lastError: string | null;

  setGenerating: (val: boolean, tab?: "workout" | "diet" | "analyze" | null) => void;
  setGenerationPromise: (p: Promise<unknown> | null) => void;
  setWorkoutPlan: (plan: unknown) => void;
  setDietPlan: (plan: unknown) => void;
  setPhysiqueAnalysis: (analysis: unknown) => void;
  setError: (err: string | null) => void;
  clearResults: () => void;
}

export const useAiCoachStore = create<AiCoachState>()(
  persist(
    (set) => ({
      isGenerating: false,
      generatingTab: null,
      generationPromise: null,

      lastWorkoutPlan: null,
      lastDietPlan: null,
      lastPhysiqueAnalysis: null,
      lastError: null,

      setGenerating: (val, tab = null) =>
        set({ isGenerating: val, generatingTab: tab }),
      setGenerationPromise: (p) => set({ generationPromise: p }),
      setWorkoutPlan: (plan) => set({ lastWorkoutPlan: plan, lastError: null }),
      setDietPlan: (plan) => set({ lastDietPlan: plan, lastError: null }),
      setPhysiqueAnalysis: (analysis) =>
        set({ lastPhysiqueAnalysis: analysis, lastError: null }),
      setError: (err) => set({ lastError: err }),
      clearResults: () =>
        set({
          lastWorkoutPlan: null,
          lastDietPlan: null,
          lastPhysiqueAnalysis: null,
          lastError: null,
        }),
    }),
    {
      name: "rahulfitzz-ai-coach-session",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        lastWorkoutPlan: state.lastWorkoutPlan,
        lastDietPlan: state.lastDietPlan,
        lastPhysiqueAnalysis: state.lastPhysiqueAnalysis,
        lastError: state.lastError,
      }),
    }
  )
);
