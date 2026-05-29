import { create } from "zustand";
import type { ExercisePoolItem } from "@/lib/exercise-library";
import {
  exercisePool,
  warmupPool,
  cooldownPool,
  pickRandomSwap,
} from "@/lib/exercise-library";
import type { DayPlan, SetLog, WeeklySchedule } from "@/lib/gym-plan-types";
import {
  migrateGymSchedule,
  migrateWeeklyPlan,
  UPPER_BODY_MUSCLE_IDS,
} from "@/lib/gym-muscle-groups";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const LS_PLAN = "rahulfitzz_gym_mode_weekly_plan";
const LS_LOGS = "rahulfitzz_gym_mode_logs";
const LS_SCHEDULE = "rahulfitzz_gym_mode_schedule";

function isUuidUserId(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

function getDynamicWarmups(muscles: string[]): ExercisePoolItem[] {
  if (muscles.length === 0) return [];
  const isLower = muscles.includes("legs");
  const isUpper = muscles.some((m) =>
    (UPPER_BODY_MUSCLE_IDS as readonly string[]).includes(m)
  );
  let warmups: ExercisePoolItem[] = [...warmupPool.general];
  if (isUpper) warmups = [...warmups, ...warmupPool.upper];
  if (isLower) warmups = [...warmups, ...warmupPool.lower];
  const maxWarmups = isUpper && isLower ? 4 : 3;
  return warmups.slice(0, maxWarmups);
}

function getDynamicCooldowns(muscles: string[]): ExercisePoolItem[] {
  if (muscles.length === 0) return [];
  const isLower = muscles.includes("legs");
  const isUpper = muscles.some((m) =>
    (UPPER_BODY_MUSCLE_IDS as readonly string[]).includes(m)
  );
  let cooldowns: ExercisePoolItem[] = [];
  if (isUpper) cooldowns = [...cooldowns, ...cooldownPool.upper];
  if (isLower) cooldowns = [...cooldowns, ...cooldownPool.lower];
  cooldowns = [...cooldowns, ...cooldownPool.general];
  const maxCooldowns = isUpper && isLower ? 4 : 3;
  return cooldowns.slice(0, maxCooldowns);
}

function generateExercises(muscles: string[]): ExercisePoolItem[] {
  let result: ExercisePoolItem[] = [];
  muscles.forEach((m) => {
    const pool = exercisePool[m] || [];
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    result = [...result, ...shuffled.slice(0, Math.min(3, pool.length))];
  });
  return result;
}

function buildWeeklyPlan(schedule: WeeklySchedule): DayPlan[] {
  return DAYS_OF_WEEK.map((day) => {
    const muscles = schedule[day] || [];
    return {
      day,
      muscleGroups: muscles,
      warmups: getDynamicWarmups(muscles),
      exercises: generateExercises(muscles),
      cooldowns: getDynamicCooldowns(muscles),
    };
  });
}

function cacheLocally(
  schedule: WeeklySchedule,
  plan: DayPlan[] | null,
  sets: Record<string, SetLog[]>
) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_SCHEDULE, JSON.stringify(schedule));
  if (plan) localStorage.setItem(LS_PLAN, JSON.stringify(plan));
  localStorage.setItem(LS_LOGS, JSON.stringify(sets));
}

function loadLocalFallback(): {
  schedule: WeeklySchedule;
  weeklyPlan: DayPlan[] | null;
  sets: Record<string, SetLog[]>;
} {
  const defaultSchedule: WeeklySchedule = {
    Monday: ["chest", "biceps"],
    Tuesday: ["back", "core"],
    Wednesday: ["legs"],
    Thursday: [],
    Friday: ["shoulders", "triceps"],
    Saturday: ["chest", "back"],
    Sunday: [],
  };
  if (typeof window === "undefined") {
    return { schedule: defaultSchedule, weeklyPlan: null, sets: {} };
  }
  try {
    const schedule = localStorage.getItem(LS_SCHEDULE);
    const plan = localStorage.getItem(LS_PLAN);
    const logs = localStorage.getItem(LS_LOGS);
    const parsedSchedule = migrateGymSchedule(
      schedule ? JSON.parse(schedule) : defaultSchedule
    );
    const parsedPlan = migrateWeeklyPlan(plan ? JSON.parse(plan) : null);
    return {
      schedule: parsedSchedule,
      weeklyPlan: parsedPlan,
      sets: logs ? JSON.parse(logs) : {},
    };
  } catch {
    return { schedule: defaultSchedule, weeklyPlan: null, sets: {} };
  }
}

interface GymPlanState {
  userId: string | null;
  weeklyPlanId: string | null;
  schedule: WeeklySchedule;
  weeklyPlan: DayPlan[] | null;
  sets: Record<string, SetLog[]>;
  isLoading: boolean;
  isHydrated: boolean;
  isMutating: boolean;
  error: string | null;

  setUserId: (userId: string | null) => void;
  hydrate: (userId: string) => Promise<void>;
  updateSchedule: (day: string, muscleId: string) => Promise<void>;
  generatePlan: () => Promise<void>;
  swapExercise: (
    dayIndex: number,
    exerciseIndex: number,
    swapType?: "shuffle" | "manual" | "ai_suggestion"
  ) => Promise<ExercisePoolItem | null>;
  applyAiSuggestion: (
    dayIndex: number,
    exerciseIndex: number
  ) => Promise<{ ok: true; name: string } | { ok: false; error: string }>;
  reorderExercises: (
    dayIndex: number,
    fromIndex: number,
    toIndex: number
  ) => Promise<void>;
  applyAiWeeklyPlan: (
    planData: DayPlan[],
    aiPlanId: string
  ) => Promise<void>;
  saveSets: (sets: Record<string, SetLog[]>) => Promise<void>;
  updateSetLogs: (sets: Record<string, SetLog[]>) => void;
  resetPlan: () => Promise<void>;
  persistPlan: () => Promise<void>;
}

async function apiPost<T>(
  path: string,
  body: unknown
): Promise<{ ok: true; data: T } | { ok: false }> {
  try {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return { ok: false };
    return { ok: true, data: (await res.json()) as T };
  } catch {
    return { ok: false };
  }
}

async function apiGet<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(path);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** Ignore stale hydrate responses when userId changes quickly. */
let hydrateGeneration = 0;
/** Cancel in-flight AI swap if user triggers another. */
let aiSuggestionAbort: AbortController | null = null;

function bootFromLocalCache(): Pick<
  GymPlanState,
  "schedule" | "weeklyPlan" | "sets" | "isHydrated"
> {
  const local = loadLocalFallback();
  return {
    schedule: local.schedule,
    weeklyPlan: local.weeklyPlan,
    sets: local.sets,
    isHydrated: typeof window !== "undefined",
  };
}

const localBoot = bootFromLocalCache();

export const useGymPlanStore = create<GymPlanState>((set, get) => ({
  userId: null,
  weeklyPlanId: null,
  schedule: localBoot.schedule,
  weeklyPlan: localBoot.weeklyPlan,
  sets: localBoot.sets,
  isLoading: false,
  isHydrated: localBoot.isHydrated,
  isMutating: false,
  error: null,

  setUserId: (userId) => set({ userId }),

  hydrate: async (userId) => {
    const generation = ++hydrateGeneration;
    const local = loadLocalFallback();
    const hasLocal =
      !!local.weeklyPlan || Object.keys(local.sets).length > 0;

    set({
      userId,
      error: null,
      schedule: local.schedule,
      weeklyPlan: local.weeklyPlan ?? get().weeklyPlan,
      sets: Object.keys(local.sets).length > 0 ? local.sets : get().sets,
      isHydrated: true,
      isLoading: !hasLocal,
    });

    if (isUuidUserId(userId)) {
      const data = await apiGet<{
        plan: DayPlan[] | null;
        schedule: WeeklySchedule;
        sets: Record<string, SetLog[]>;
        weeklyPlanId: string | null;
      }>(`/api/gym-plan?userId=${encodeURIComponent(userId)}`);

      if (generation !== hydrateGeneration) return;

      if (data) {
        const schedule = migrateGymSchedule(data.schedule ?? local.schedule);
        const weeklyPlan = migrateWeeklyPlan(data.plan);
        set({
          weeklyPlan,
          schedule,
          sets: data.sets ?? {},
          weeklyPlanId: data.weeklyPlanId,
          isHydrated: true,
          isLoading: false,
        });
        cacheLocally(schedule, weeklyPlan, data.sets ?? {});
        return;
      }
    }

    if (generation !== hydrateGeneration) return;
    set({ isLoading: false });
  },

  updateSchedule: async (day, muscleId) => {
    const { schedule, userId } = get();
    const current = schedule[day] || [];
    const updated = current.includes(muscleId)
      ? current.filter((m) => m !== muscleId)
      : [...current, muscleId];
    const newSchedule = { ...schedule, [day]: updated };
    set({ schedule: newSchedule });
    cacheLocally(newSchedule, get().weeklyPlan, get().sets);

    if (userId && isUuidUserId(userId)) {
      const result = await apiPost("/api/gym-plan", {
        userId,
        schedule: newSchedule,
        planData: get().weeklyPlan,
      });
      if (!result.ok) {
        set({ schedule, error: "Could not save schedule. Try again." });
        cacheLocally(schedule, get().weeklyPlan, get().sets);
      }
    }
  },

  generatePlan: async () => {
    const { schedule, userId } = get();
    const plan = buildWeeklyPlan(schedule);
    set({ weeklyPlan: plan });
    cacheLocally(schedule, plan, get().sets);

    if (userId && isUuidUserId(userId)) {
      const result = await apiPost<{ weeklyPlanId: string }>("/api/gym-plan", {
        userId,
        schedule,
        planData: plan,
        source: "manual",
      });
      if (result.ok && result.data.weeklyPlanId) {
        set({ weeklyPlanId: result.data.weeklyPlanId });
      }
    }
  },

  swapExercise: async (dayIndex, exerciseIndex, swapType = "shuffle") => {
    const { weeklyPlan, userId, weeklyPlanId, isMutating } = get();
    if (!weeklyPlan || isMutating) return null;

    const snapshot = {
      weeklyPlan: get().weeklyPlan,
      sets: get().sets,
    };
    set({ isMutating: true, error: null });

    const planCopy = [...weeklyPlan];
    const day = planCopy[dayIndex];
    const currentEx = day.exercises[exerciseIndex];
    const usedNames = day.exercises.map((ex) => ex.name);
    const replacement = pickRandomSwap(currentEx, usedNames);
    if (!replacement) {
      set({ isMutating: false });
      return null;
    }

    planCopy[dayIndex] = {
      ...day,
      exercises: day.exercises.map((ex, i) =>
        i === exerciseIndex ? replacement : ex
      ),
    };

    const key = `workout-${day.day}-${exerciseIndex}`;
    const setsCopy = { ...get().sets };
    delete setsCopy[key];

    set({ weeklyPlan: planCopy, sets: setsCopy });
    cacheLocally(get().schedule, planCopy, setsCopy);

    if (userId && isUuidUserId(userId)) {
      const result = await apiPost<{ weeklyPlanId: string }>("/api/gym-plan/swap", {
        userId,
        weeklyPlanId,
        dayName: day.day,
        exerciseIndex,
        fromExercise: currentEx,
        toExercise: replacement,
        swapType,
        planData: planCopy,
        schedule: get().schedule,
      });
      if (!result.ok) {
        set({
          weeklyPlan: snapshot.weeklyPlan,
          sets: snapshot.sets,
          isMutating: false,
          error: "Swap failed to save. Reverted.",
        });
        cacheLocally(get().schedule, snapshot.weeklyPlan, snapshot.sets);
        return null;
      }
      if (result.data.weeklyPlanId) {
        set({ weeklyPlanId: result.data.weeklyPlanId });
      }
    }

    set({ isMutating: false });
    return replacement;
  },

  applyAiSuggestion: async (dayIndex, exerciseIndex) => {
    const { weeklyPlan, userId, weeklyPlanId, schedule, isMutating } = get();
    if (!weeklyPlan || !userId || isMutating) {
      return { ok: false as const, error: "No plan loaded" };
    }

    const day = weeklyPlan[dayIndex];
    const currentEx = day.exercises[exerciseIndex];
    const usedNames = day.exercises.map((ex) => ex.name);
    const snapshot = { weeklyPlan: get().weeklyPlan, weeklyPlanId: get().weeklyPlanId };
    aiSuggestionAbort?.abort();
    const controller = new AbortController();
    aiSuggestionAbort = controller;
    set({ isMutating: true, error: null });

    try {
      const res = await fetch("/api/gym-plan/ai-suggestion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          userId,
          currentExercise: currentEx,
          usedNames,
          dayName: day.day,
          exerciseIndex,
          planData: weeklyPlan,
          schedule,
          weeklyPlanId,
        }),
      });
      if (controller.signal.aborted) {
        return { ok: false as const, error: "Request cancelled" };
      }
      const data = await res.json();
      if (!res.ok) {
        const retry =
          res.status === 429 && typeof data?.retryAfterSec === "number"
            ? ` Try again in ${data.retryAfterSec}s.`
            : "";
        throw new Error(
          (typeof data?.error === "string" ? data.error : "AI suggestion failed") + retry
        );
      }
      set({
        weeklyPlan: data.planData,
        weeklyPlanId: data.weeklyPlanId ?? weeklyPlanId,
        isMutating: false,
      });
      cacheLocally(schedule, data.planData, get().sets);
      return { ok: true as const, name: data.suggestion?.name ?? "new exercise" };
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") {
        set({
          weeklyPlan: snapshot.weeklyPlan,
          weeklyPlanId: snapshot.weeklyPlanId,
          isMutating: false,
        });
        if (snapshot.weeklyPlan) {
          cacheLocally(schedule, snapshot.weeklyPlan, get().sets);
        }
        return { ok: false as const, error: "Request cancelled" };
      }
      set({
        weeklyPlan: snapshot.weeklyPlan,
        weeklyPlanId: snapshot.weeklyPlanId,
        isMutating: false,
        error: e instanceof Error ? e.message : "AI suggestion failed",
      });
      if (snapshot.weeklyPlan) {
        cacheLocally(schedule, snapshot.weeklyPlan, get().sets);
      }
      return {
        ok: false as const,
        error: e instanceof Error ? e.message : "AI suggestion failed",
      };
    }
  },

  reorderExercises: async (dayIndex, fromIndex, toIndex) => {
    const { weeklyPlan, userId, weeklyPlanId, isMutating } = get();
    if (!weeklyPlan || fromIndex === toIndex || isMutating) return;

    const snapshot = { weeklyPlan: get().weeklyPlan };
    set({ isMutating: true, error: null });

    const planCopy = [...weeklyPlan];
    const day = { ...planCopy[dayIndex] };
    const exercises = [...day.exercises];
    const [moved] = exercises.splice(fromIndex, 1);
    exercises.splice(toIndex, 0, moved);
    day.exercises = exercises;
    planCopy[dayIndex] = day;

    set({ weeklyPlan: planCopy });
    cacheLocally(get().schedule, planCopy, get().sets);

    if (userId && isUuidUserId(userId)) {
      const result = await apiPost<{ weeklyPlanId: string }>("/api/gym-plan/swap", {
        userId,
        weeklyPlanId,
        dayName: day.day,
        exerciseIndex: fromIndex,
        fromExercise: moved,
        toExercise: exercises[toIndex],
        swapType: "reorder",
        planData: planCopy,
        schedule: get().schedule,
      });
      if (!result.ok) {
        set({
          weeklyPlan: snapshot.weeklyPlan,
          isMutating: false,
          error: "Reorder failed to save. Reverted.",
        });
        cacheLocally(get().schedule, snapshot.weeklyPlan, get().sets);
        return;
      }
      if (result.data.weeklyPlanId) {
        set({ weeklyPlanId: result.data.weeklyPlanId });
      }
    }

    set({ isMutating: false });
  },

  applyAiWeeklyPlan: async (planData, aiPlanId) => {
    const { schedule, userId } = get();
    set({ weeklyPlan: planData });
    cacheLocally(schedule, planData, get().sets);

    if (userId && isUuidUserId(userId)) {
      const result = await apiPost<{ weeklyPlanId: string }>(
        "/api/gym-plan/ai",
        {
          userId,
          schedule,
          planData,
          aiPlanId,
        }
      );
      if (result.ok && result.data.weeklyPlanId) {
        set({ weeklyPlanId: result.data.weeklyPlanId });
      }
    }
  },

  saveSets: async (sets) => {
    const { userId, weeklyPlan, schedule } = get();
    set({ sets });
    cacheLocally(schedule, weeklyPlan, sets);

    if (userId && isUuidUserId(userId)) {
      await apiPost("/api/gym-plan/progress", {
        userId,
        setLogs: sets,
        weeklyPlan,
      });
    }
  },

  updateSetLogs: (sets) => {
    set({ sets });
    const { schedule, weeklyPlan, userId } = get();
    cacheLocally(schedule, weeklyPlan, sets);
    if (userId && isUuidUserId(userId)) {
      void get().saveSets(sets);
    }
  },

  resetPlan: async () => {
    const { schedule, userId } = get();
    set({ weeklyPlan: null, sets: {} });
    if (typeof window !== "undefined") {
      localStorage.removeItem(LS_PLAN);
      localStorage.removeItem(LS_LOGS);
    }

    if (userId && isUuidUserId(userId)) {
      await apiPost("/api/gym-plan", {
        userId,
        schedule,
        planData: null,
        reset: true,
      });
    }
  },

  persistPlan: async () => {
    const { userId, schedule, weeklyPlan } = get();
    cacheLocally(schedule, weeklyPlan, get().sets);
    if (userId && isUuidUserId(userId) && weeklyPlan) {
      await apiPost("/api/gym-plan", {
        userId,
        schedule,
        planData: weeklyPlan,
        source: "manual",
      });
    }
  },
}));

export {
  DAYS_OF_WEEK,
  buildWeeklyPlan,
  getDynamicWarmups,
  getDynamicCooldowns,
  generateExercises,
};
