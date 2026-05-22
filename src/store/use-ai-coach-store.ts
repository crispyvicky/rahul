import { create } from "zustand";

/**
 * Zustand store for AI Coach generation state.
 * Persists across page navigations so in-flight requests
 * don't get lost when the user switches tabs/pages.
 */

interface AiCoachState {
  // In-flight generation tracking
  isGenerating: boolean;
  generatingTab: "workout" | "diet" | "analyze" | null;
  generationPromise: Promise<any> | null;

  // Cached results (survive navigation)
  lastWorkoutPlan: any | null;
  lastDietPlan: any | null;
  lastPhysiqueAnalysis: any | null;
  lastError: string | null;

  // Actions
  setGenerating: (val: boolean, tab?: "workout" | "diet" | "analyze" | null) => void;
  setGenerationPromise: (p: Promise<any> | null) => void;
  setWorkoutPlan: (plan: any) => void;
  setDietPlan: (plan: any) => void;
  setPhysiqueAnalysis: (analysis: any) => void;
  setError: (err: string | null) => void;
  clearResults: () => void;
}

export const useAiCoachStore = create<AiCoachState>((set) => ({
  isGenerating: false,
  generatingTab: null,
  generationPromise: null,

  lastWorkoutPlan: null,
  lastDietPlan: null,
  lastPhysiqueAnalysis: null,
  lastError: null,

  setGenerating: (val, tab = null) => set({ isGenerating: val, generatingTab: tab }),
  setGenerationPromise: (p) => set({ generationPromise: p }),
  setWorkoutPlan: (plan) => set({ lastWorkoutPlan: plan, lastError: null }),
  setDietPlan: (plan) => set({ lastDietPlan: plan, lastError: null }),
  setPhysiqueAnalysis: (analysis) => set({ lastPhysiqueAnalysis: analysis, lastError: null }),
  setError: (err) => set({ lastError: err }),
  clearResults: () => set({
    lastWorkoutPlan: null,
    lastDietPlan: null,
    lastPhysiqueAnalysis: null,
    lastError: null,
  }),
}));
