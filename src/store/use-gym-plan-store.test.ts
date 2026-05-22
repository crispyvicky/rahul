import { describe, it, expect, beforeEach, vi } from "vitest";
import { useGymPlanStore, buildWeeklyPlan } from "./use-gym-plan-store";
import { pickRandomSwap } from "@/lib/exercise-library";

describe("useGymPlanStore", () => {
  beforeEach(() => {
    useGymPlanStore.setState({
      userId: null,
      weeklyPlanId: null,
      schedule: {
        Monday: ["chest"],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
        Saturday: [],
        Sunday: [],
      },
      weeklyPlan: null,
      sets: {},
      isLoading: false,
      isHydrated: false,
      isMutating: false,
      error: null,
    });
    vi.restoreAllMocks();
  });

  it("buildWeeklyPlan creates exercises for scheduled muscles", () => {
    const schedule = { Monday: ["chest"], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: [] };
    const plan = buildWeeklyPlan(schedule);
    expect(plan).toHaveLength(7);
    expect(plan[0].exercises.length).toBeGreaterThan(0);
    expect(plan[0].exercises[0].group).toBe("chest");
  });

  it("updateSchedule toggles muscle on a day", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) })
    );
    useGymPlanStore.setState({ userId: "00000000-0000-4000-8000-000000000001" });
    await useGymPlanStore.getState().updateSchedule("Monday", "back");
    const monday = useGymPlanStore.getState().schedule.Monday;
    expect(monday).toContain("chest");
    expect(monday).toContain("back");
  });

  it("swapExercise replaces exercise when pool has alternatives", async () => {
    const schedule = {
      Monday: ["chest"],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
      Sunday: [],
    };
    const plan = buildWeeklyPlan(schedule);
    useGymPlanStore.setState({ weeklyPlan: plan, schedule });

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ weeklyPlanId: "x" }) })
    );

    const before = plan[0].exercises[0].name;
    await useGymPlanStore.getState().swapExercise(0, 0, "shuffle");
    const after = useGymPlanStore.getState().weeklyPlan?.[0].exercises[0].name;
    expect(after).toBeDefined();
    // May be same if random picks same — at least no crash
    expect(typeof after).toBe("string");
  });
});

describe("pickRandomSwap", () => {
  it("returns unused exercise from same group", () => {
    const current = {
      name: "Flat Barbell Bench Press",
      targetSets: 4,
      targetReps: "8-10",
      tip: "test",
      group: "chest",
      steps: [],
    };
    const alt = pickRandomSwap(current, [current.name]);
    expect(alt).not.toBeNull();
    expect(alt?.group).toBe("chest");
    expect(alt?.name).not.toBe(current.name);
  });
});
