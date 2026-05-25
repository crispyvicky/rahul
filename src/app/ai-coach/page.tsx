"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Dumbbell,
  Salad,
  Camera,
  Sparkles,
  Loader2,
  ChevronRight,
  Check,
  RotateCcw,
  Download,
  Share2,
  History,
  X,
  User,
  Play,
} from "lucide-react";
import Link from "next/link";
import { useUserStore, DEMO_USER } from "@/store/use-user-store";
import { useAiCoachStore } from "@/store/use-ai-coach-store";
import { cn } from "@/lib/utils";
import { saveAiPlan, getUserAiPlans } from "@/lib/supabase-service";
import {
  DEFAULT_DIET_TELUGU_TIPS,
  DEFAULT_WORKOUT_TELUGU_TIPS,
} from "@/lib/ai-coach-prompts";
import { getExerciseYoutubeUrl } from "@/lib/exercise-youtube";
import { useAppSessionResume } from "@/hooks/use-app-session-resume";

function planTeluguTips(plan: { teluguTips?: unknown } | null, fallback: string[]): string[] {
  if (plan && Array.isArray(plan.teluguTips) && plan.teluguTips.length > 0) {
    return plan.teluguTips.map((t) => String(t)).slice(0, 8);
  }
  return fallback;
}

const GOAL_LABELS: Record<string, string> = {
  muscle_gain: "Muscle gain",
  fat_loss: "Fat loss",
  maintain: "Maintenance",
  endurance: "Endurance & core",
};

function escapeHtml(s: unknown): string {
  if (s === undefined || s === null) return "—";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function goalLabel(key: string | undefined) {
  if (!key) return "—";
  return GOAL_LABELS[key] || escapeHtml(key.replace(/_/g, " "));
}

type PrintDocOptions = {
  docTitle: string;
  variant: "diet" | "workout";
  contentHtml: string;
  userDisplayName: string;
  coachMessage?: string;
  planFocus?: string;
  profileRows: { label: string; value: string }[];
  hydration?: string;
  supplements?: string[];
  tipLines: string[];
  region?: string;
};

const tabs = [
  { id: "workout", label: "Workout Plan", icon: Dumbbell },
  { id: "diet", label: "Diet Plan", icon: Salad },
  { id: "analyze", label: "Physique Scan", icon: Camera },
] as const;

/** Client-side guard: reject huge camera photos before upload (server also caps). */
const MAX_PHYSIQUE_FILE_BYTES = 4 * 1024 * 1024;

// Mock generated workout plan
const mockWorkoutPlan = {
  title: "Hypertrophy Push/Pull/Legs — Week 1",
  days: [
    {
      day: "Monday",
      focus: "Push (Chest, Shoulders, Triceps)",
      exercises: [
        { name: "Flat Barbell Bench Press", sets: 4, reps: "8-10", rest: "90s" },
        { name: "Incline Dumbbell Press", sets: 3, reps: "10-12", rest: "75s" },
        { name: "Overhead Press (Standing)", sets: 4, reps: "8-10", rest: "90s" },
        { name: "Lateral Raises", sets: 3, reps: "12-15", rest: "60s" },
        { name: "Tricep Cable Pushdowns", sets: 3, reps: "12-15", rest: "60s" },
        { name: "Overhead Tricep Extension", sets: 3, reps: "10-12", rest: "60s" },
      ],
    },
    {
      day: "Tuesday",
      focus: "Pull (Back, Biceps)",
      exercises: [
        { name: "Barbell Rows", sets: 4, reps: "8-10", rest: "90s" },
        { name: "Pull-ups / Lat Pulldowns", sets: 4, reps: "8-12", rest: "75s" },
        { name: "Seated Cable Rows", sets: 3, reps: "10-12", rest: "75s" },
        { name: "Face Pulls", sets: 3, reps: "15-20", rest: "60s" },
        { name: "Barbell Curls", sets: 3, reps: "10-12", rest: "60s" },
        { name: "Hammer Curls", sets: 3, reps: "12-15", rest: "60s" },
      ],
    },
    {
      day: "Wednesday",
      focus: "Legs (Quads, Hams, Glutes)",
      exercises: [
        { name: "Barbell Back Squats", sets: 4, reps: "6-8", rest: "120s" },
        { name: "Romanian Deadlifts", sets: 4, reps: "8-10", rest: "90s" },
        { name: "Leg Press", sets: 3, reps: "10-12", rest: "90s" },
        { name: "Walking Lunges", sets: 3, reps: "12/leg", rest: "75s" },
        { name: "Leg Curls", sets: 3, reps: "12-15", rest: "60s" },
        { name: "Calf Raises", sets: 4, reps: "15-20", rest: "60s" },
      ],
    },
  ],
};

/** Rotating copy while AI generates a plan */
const AI_LOADING_TIPS = [
  "Technique: 2–3 reps in reserve on compounds — train hard, not to failure every set.",
  "Bodybuilding: mind-muscle connection beats ego weight — feel the target muscle work.",
  "Diet: protein every meal anchors recovery — aim for consistency, not perfection.",
  "Stretch: 5 min hip flexor + thoracic opener before legs — better depth, safer spine.",
  "Tip: progressive overload — add reps, load, or sets when form stays crisp.",
  "Recovery: 7–9 hours sleep is when muscle actually grows — protect your nights.",
  "Warm-up: 1 light set + 1 working ramp set before heavy bench or squat.",
  "Nutrition: meal prep 2 days ahead beats guessing calories mid-week.",
  "Mobility: band pull-aparts and face pulls keep shoulders healthy on push days.",
  "Hypertrophy: time under tension — control the negative for 2–3 seconds.",
];

const mockDietPlan = {
  calories: 2400,
  protein: 180,
  carbs: 260,
  fats: 67,
  meals: [
    { time: "7:00 AM", name: "Breakfast", items: "4 egg whites + 2 whole eggs, oats (60g), banana, black coffee", cal: 480 },
    { time: "10:00 AM", name: "Snack", items: "Greek yogurt (200g), mixed nuts (30g), honey", cal: 280 },
    { time: "1:00 PM", name: "Lunch", items: "Chicken breast (200g), brown rice (100g), steamed broccoli, olive oil", cal: 550 },
    { time: "4:00 PM", name: "Pre-Workout", items: "Whey protein shake, banana, peanut butter (15g)", cal: 350 },
    { time: "7:00 PM", name: "Dinner", items: "Grilled salmon (180g), sweet potato, mixed salad, avocado (50g)", cal: 520 },
    { time: "9:30 PM", name: "Night", items: "Casein protein, almonds (20g)", cal: 220 },
  ],
};

export default function AICoachPage() {
  const [activeTab, setActiveTab] = useState<"workout" | "diet" | "analyze">("workout");
  const [isGenerating, setIsGenerating] = useState(false);
  const [planGenerated, setPlanGenerated] = useState(false);
  const [expandedDay, setExpandedDay] = useState<number | null>(0);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const { user } = useUserStore();
  const currentUser = user || DEMO_USER;

  // Global AI Coach Store — survives navigation
  const aiStore = useAiCoachStore();

  // Form State
  const [customData, setCustomData] = useState({
    weight: currentUser.onboardingData?.weight || 75,
    goal: currentUser.onboardingData?.goal || "muscle_gain",
    fitnessLevel: currentUser.onboardingData?.fitnessLevel || "intermediate",
    workoutLocation: "gym", // home or gym
    gender: "male", // male or female
    customInstructions: "", // free text for injuries, diet prefs, etc.
  });
  
  // Real data state
  const [workoutPlan, setWorkoutPlan] = useState<any>(null);
  const [dietPlan, setDietPlan] = useState<any>(null);
  const [physiqueAnalysis, setPhysiqueAnalysis] = useState<any>(null);
  const [historyPlans, setHistoryPlans] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [loadingTipIndex, setLoadingTipIndex] = useState(0);
  const aiRequestLock = useRef(false);

  useAppSessionResume({
    routeKey: "/ai-coach",
    state: {
      activeTab,
      planGenerated,
      expandedDay,
      customData,
    },
    deps: [activeTab, planGenerated, expandedDay, customData],
    onRestore: (saved) => {
      if (saved.activeTab === "workout" || saved.activeTab === "diet" || saved.activeTab === "analyze") {
        setActiveTab(saved.activeTab);
      }
      if (typeof saved.planGenerated === "boolean") setPlanGenerated(saved.planGenerated);
      if (saved.expandedDay === null || typeof saved.expandedDay === "number") {
        setExpandedDay(saved.expandedDay as number | null);
      }
      if (saved.customData && typeof saved.customData === "object") {
        setCustomData((prev) => ({ ...prev, ...(saved.customData as typeof customData) }));
      }
    },
  });

  useEffect(() => {
    if (!isGenerating) return;
    setLoadingTipIndex(0);
    const id = window.setInterval(() => {
      setLoadingTipIndex((i) => (i + 1) % AI_LOADING_TIPS.length);
    }, 2800);
    return () => window.clearInterval(id);
  }, [isGenerating]);

  // Restore plans from persisted store (survives reload / phone call)
  useEffect(() => {
    let mounted = true;

    const applyFromStore = () => {
      const store = useAiCoachStore.getState();
      if (store.lastWorkoutPlan && !workoutPlan) {
        setWorkoutPlan(store.lastWorkoutPlan);
        setPlanGenerated(true);
      }
      if (store.lastDietPlan && !dietPlan) {
        setDietPlan(store.lastDietPlan);
        setPlanGenerated(true);
      }
      if (store.lastPhysiqueAnalysis && !physiqueAnalysis) {
        setPhysiqueAnalysis(store.lastPhysiqueAnalysis);
        setPlanGenerated(true);
      }
      if (store.lastError) setGenerateError(store.lastError);

      if (store.isGenerating && store.generationPromise) {
        setIsGenerating(true);
        store.generationPromise
          .then(() => {
            if (!mounted) return;
            const s = useAiCoachStore.getState();
            if (s.lastWorkoutPlan) setWorkoutPlan(s.lastWorkoutPlan);
            if (s.lastDietPlan) setDietPlan(s.lastDietPlan);
            if (s.lastPhysiqueAnalysis) setPhysiqueAnalysis(s.lastPhysiqueAnalysis);
            if (s.lastError) setGenerateError(s.lastError);
            setPlanGenerated(!s.lastError);
          })
          .catch(() => {})
          .finally(() => {
            if (mounted) setIsGenerating(false);
          });
      }
    };

    if (useAiCoachStore.persist.hasHydrated()) {
      applyFromStore();
    } else {
      const unsub = useAiCoachStore.persist.onFinishHydration(() => {
        if (mounted) applyFromStore();
      });
      return () => {
        mounted = false;
        unsub();
      };
    }

    return () => {
      mounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Premium branded PDF download (RahulFitzz dark + red — direct .pdf file, no print dialog)
  const downloadPlanAsPDF = async (opts: PrintDocOptions) => {
    const gradId = `rfG${Date.now()}`;
    const genDate = new Date().toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
    const profileHtml = opts.profileRows
      .map(
        (r) => `
      <div class="meta-cell">
        <span class="meta-label">${escapeHtml(r.label)}</span>
        <span class="meta-val">${escapeHtml(r.value)}</span>
      </div>`
      )
      .join("");

    const coachHtml = opts.coachMessage
      ? `<div class="coach-card"><div class="coach-label">Coach note</div><p class="coach-text">${escapeHtml(opts.coachMessage)}</p></div>`
      : "";

    const focusHtml = opts.planFocus
      ? `<div class="focus-pill"><span class="focus-label">Plan focus</span><span class="focus-val">${escapeHtml(opts.planFocus)}</span></div>`
      : "";

    let extrasHtml = "";
    if (opts.variant === "diet") {
      const hyd = opts.hydration ? `<p class="extra-line"><strong>Hydration:</strong> ${escapeHtml(opts.hydration)}</p>` : "";
      const sup =
        opts.supplements && opts.supplements.length > 0
          ? `<p class="extra-line"><strong>Supplements:</strong> ${escapeHtml(opts.supplements.join(" · "))}</p>`
          : "";
      if (hyd || sup) extrasHtml = `<div class="extras-card">${hyd}${sup}</div>`;
    }

    const regionHtml = opts.region
      ? `<p class="region-badge">${escapeHtml(opts.region)} · Telugu states nutrition &amp; training</p>`
      : `<p class="region-badge">Telangana · Andhra · Hyderabad</p>`;

    const tipsHtml =
      opts.tipLines.length > 0
        ? `<div class="tips-card"><h3 class="tips-title">Telugu tips · సూచనలు</h3><ul class="tips-list">${opts.tipLines.map((t) => `<li>${escapeHtml(t)}</li>`).join("")}</ul></div>`
        : "";

    const markSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56" aria-hidden="true"><defs><linearGradient id="${gradId}" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse"><stop stop-color="#ff2a2a"/><stop offset="1" stop-color="#9a0000"/></linearGradient></defs><rect width="56" height="56" rx="16" fill="url(#${gradId})"/><text x="28" y="37" text-anchor="middle" fill="#fff" font-family="Segoe UI,Arial Black,sans-serif" font-size="19" font-weight="900">RF</text></svg>`;

    const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"/><title>${escapeHtml(opts.docTitle)} — RahulFitzz</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet"/>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  @page { margin: 14mm; }
  body {
    font-family: "Space Grotesk", "Segoe UI", system-ui, sans-serif;
    color: #e8e8ea;
    background: #050505;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .page {
    max-width: 820px;
    margin: 0 auto;
    padding: 28px 32px 40px;
  }
  .hero {
    background: linear-gradient(145deg, #0f0f12 0%, #0a0a0c 40%, #120808 100%);
    border: 1px solid rgba(235,0,0,0.25);
    border-radius: 20px;
    padding: 26px 28px;
    margin-bottom: 22px;
    box-shadow: 0 24px 60px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.04) inset;
  }
  .hero-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    flex-wrap: wrap;
    border-bottom: 1px solid rgba(235,0,0,0.35);
    padding-bottom: 18px;
    margin-bottom: 18px;
  }
  .brand-row { display: flex; align-items: center; gap: 16px; }
  .mark-wrap { flex-shrink: 0; filter: drop-shadow(0 8px 24px rgba(235,0,0,0.35)); }
  .brand-text .name {
    font-family: Orbitron, sans-serif;
    font-weight: 900;
    font-size: 1.65rem;
    letter-spacing: 0.04em;
    color: #fff;
    text-transform: uppercase;
  }
  .brand-text .tag {
    font-size: 0.65rem;
    letter-spacing: 0.35em;
    color: #eb0000;
    font-weight: 700;
    margin-top: 4px;
  }
  .gen-stamp {
    text-align: right;
    font-size: 0.7rem;
    color: #6b6b72;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
  .gen-stamp strong { color: #b8b8bf; font-weight: 600; letter-spacing: 0.06em; }
  .doc-title {
    font-family: Orbitron, sans-serif;
    font-weight: 900;
    font-size: 1.35rem;
    letter-spacing: 0.08em;
    color: #fff;
    text-transform: uppercase;
    margin-bottom: 8px;
  }
  .user-line { font-size: 0.85rem; color: #96979c; margin-bottom: 14px; }
  .user-line strong { color: #fff; font-weight: 600; }
  .meta-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 10px;
  }
  .meta-cell {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    padding: 10px 12px;
  }
  .meta-label {
    display: block;
    font-size: 0.58rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #eb0000;
    font-weight: 700;
    margin-bottom: 4px;
  }
  .meta-val { font-size: 0.82rem; color: #f0f0f2; font-weight: 600; }
  .coach-card {
    margin-top: 16px;
    padding: 14px 16px;
    border-radius: 14px;
    background: rgba(235,0,0,0.08);
    border: 1px solid rgba(235,0,0,0.22);
  }
  .coach-label {
    font-size: 0.58rem;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #ff6b6b;
    font-weight: 800;
    margin-bottom: 6px;
  }
  .coach-text { font-size: 0.88rem; line-height: 1.55; color: #e4e4e8; }
  .region-badge {
    font-size: 0.62rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #eb0000;
    font-weight: 800;
    margin-bottom: 10px;
  }
  .focus-pill {
    margin-top: 12px;
    display: inline-flex;
    flex-direction: column;
    gap: 4px;
    padding: 10px 14px;
    border-radius: 12px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
  }
  .focus-label { font-size: 0.55rem; letter-spacing: 0.2em; text-transform: uppercase; color: #888; }
  .focus-val { font-size: 0.85rem; color: #fff; font-weight: 600; }
  .sheet {
    background: #fafafa;
    color: #111;
    border-radius: 18px;
    padding: 22px 24px 26px;
    margin-top: 18px;
    border: 1px solid #e6e6e8;
    box-shadow: 0 20px 50px rgba(0,0,0,0.35);
  }
  .sheet h2 {
    font-family: Orbitron, sans-serif;
    font-size: 0.75rem;
    letter-spacing: 0.2em;
    color: #eb0000;
    text-transform: uppercase;
    margin-bottom: 14px;
  }
  .macros { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 18px; }
  .macro {
    flex: 1 1 120px;
    text-align: center;
    padding: 14px 10px;
    background: linear-gradient(180deg, #fff 0%, #f4f4f6 100%);
    border-radius: 14px;
    border: 1px solid #e2e2e6;
    box-shadow: 0 4px 14px rgba(0,0,0,0.06);
  }
  .macro-val { font-size: 1.45rem; font-weight: 900; color: #111; font-family: Orbitron, sans-serif; }
  .macro-label { font-size: 0.58rem; color: #888; text-transform: uppercase; letter-spacing: 0.18em; margin-top: 4px; font-weight: 700; }
  .meal {
    margin-bottom: 12px;
    padding: 14px 16px;
    border-radius: 14px;
    border: 1px solid #e8e8ec;
    background: #fff;
    page-break-inside: avoid;
    border-left: 4px solid #eb0000;
    box-shadow: 0 2px 10px rgba(0,0,0,0.04);
  }
  .meal-time { font-size: 0.72rem; font-weight: 800; color: #eb0000; letter-spacing: 0.06em; text-transform: uppercase; }
  .meal-food { font-size: 0.82rem; margin-top: 6px; line-height: 1.5; color: #222; }
  .meal-cal { font-size: 0.72rem; color: #888; margin-top: 8px; font-weight: 600; }
  .meal-telugu {
    font-size: 0.72rem;
    color: #555;
    margin-top: 6px;
    font-style: italic;
    line-height: 1.4;
  }
  .day { margin-bottom: 16px; page-break-inside: avoid; }
  .day-title {
    font-size: 0.82rem;
    font-weight: 800;
    background: linear-gradient(90deg, #ffe8e8 0%, #fff 100%);
    padding: 10px 14px;
    border-left: 4px solid #eb0000;
    margin-bottom: 8px;
    border-radius: 0 10px 10px 0;
    color: #111;
  }
  table { width: 100%; border-collapse: collapse; font-size: 0.78rem; }
  th { text-align: left; font-size: 0.58rem; text-transform: uppercase; letter-spacing: 0.12em; color: #888; padding: 6px 8px; border-bottom: 1px solid #ddd; }
  td { padding: 8px; border-bottom: 1px solid #eee; color: #222; }
  .extras-card {
    margin-top: 16px;
    padding: 12px 14px;
    border-radius: 12px;
    background: #f6f6f8;
    border: 1px dashed #ccc;
    font-size: 0.78rem;
    color: #333;
    line-height: 1.55;
  }
  .extra-line { margin: 4px 0; }
  .tips-card {
    margin-top: 18px;
    padding: 16px 18px;
    border-radius: 14px;
    background: #0a0a0c;
    border: 1px solid rgba(235,0,0,0.2);
    color: #ddd;
  }
  .tips-title {
    font-family: Orbitron, sans-serif;
    font-size: 0.68rem;
    letter-spacing: 0.18em;
    color: #eb0000;
    text-transform: uppercase;
    margin-bottom: 10px;
  }
  .tips-list { margin-left: 18px; font-size: 0.8rem; line-height: 1.55; color: #c8c8ce; }
  .tips-list li { margin-bottom: 6px; }
  .footer {
    margin-top: 22px;
    padding-top: 16px;
    border-top: 1px solid rgba(255,255,255,0.08);
    text-align: center;
    font-size: 0.65rem;
    color: #555;
    letter-spacing: 0.08em;
  }
  .footer a { color: #eb0000; text-decoration: none; font-weight: 700; }
</style></head><body>
<div class="page">
  <header class="hero">
    <div class="hero-top">
      <div class="brand-row">
        <div class="mark-wrap">${markSvg}</div>
        <div class="brand-text">
          <div class="name">RahulFitzz</div>
          <div class="tag">AI-powered fitness ecosystem</div>
        </div>
      </div>
      <div class="gen-stamp">Generated<br/><strong>${escapeHtml(genDate)}</strong></div>
    </div>
    <h1 class="doc-title">${escapeHtml(opts.docTitle)}</h1>
    ${regionHtml}
    <p class="user-line">Prepared for <strong>${escapeHtml(opts.userDisplayName)}</strong></p>
    <div class="meta-grid">${profileHtml}</div>
    ${coachHtml}
    ${focusHtml}
  </header>
  <section class="sheet">
    <h2>${opts.variant === "diet" ? "Nutrition blueprint" : "Training blueprint"}</h2>
    ${opts.contentHtml}
    ${extrasHtml}
  </section>
  ${tipsHtml}
  <footer class="footer">RahulFitzz AI Coach · <a href="https://rahulfitzz.com">rahulfitzz.com</a> · Train like it’s personal.</footer>
</div>
</body></html>`;

    const iframe = document.createElement("iframe");
    iframe.setAttribute("aria-hidden", "true");
    iframe.style.cssText =
      "position:fixed;left:0;top:0;width:794px;min-height:1123px;border:0;z-index:-1;opacity:0.01;pointer-events:none;";
    document.body.appendChild(iframe);
    const doc = iframe.contentDocument;
    if (!doc) {
      iframe.remove();
      return;
    }
    doc.open();
    doc.write(html);
    doc.close();

    const openPrintFallback = () => {
      const w = window.open("", "_blank", "noopener,noreferrer");
      if (!w) {
        window.alert("Allow pop-ups to save this plan as PDF (Print → Save as PDF), or try again.");
        return;
      }
      w.document.write(html);
      w.document.close();
      w.focus();
      setTimeout(() => {
        w.print();
      }, 600);
    };

    try {
      if (!opts.contentHtml?.trim()) {
        window.alert("Generate a plan first, then download.");
        return;
      }

      await doc.fonts.ready.catch(() => {});
      await new Promise((r) => setTimeout(r, 700));

      const pageEl = doc.querySelector(".page") as HTMLElement | null;
      const captureRoot = pageEl || doc.body;
      const contentHeight = Math.max(
        captureRoot.scrollHeight,
        captureRoot.offsetHeight,
        doc.documentElement.scrollHeight,
        1100
      );
      iframe.style.height = `${contentHeight + 40}px`;

      await new Promise((r) => setTimeout(r, 400));

      /* html2pdf.js — no bundled types */
      const html2pdf = (await import("html2pdf.js")).default as () => {
        set: (o: object) => { from: (el: HTMLElement) => { save: () => Promise<void> } };
      };
      const slug =
        opts.docTitle
          .replace(/[^\w\s-]+/g, "")
          .trim()
          .replace(/\s+/g, "-")
          .slice(0, 44)
          .toLowerCase() || "plan";
      const filename = `rahulfitzz-${opts.variant}-${slug}.pdf`;
      await html2pdf()
        .set({
          margin: [10, 10, 12, 10],
          filename,
          image: { type: "jpeg", quality: 0.94 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: "#fafafa",
            width: 820,
            height: contentHeight,
            windowWidth: 820,
            windowHeight: contentHeight,
            scrollY: 0,
            scrollX: 0,
            onclone: (clonedDoc: Document) => {
              const clonedPage = clonedDoc.querySelector(".page") as HTMLElement | null;
              if (clonedPage) {
                clonedPage.style.minHeight = `${contentHeight}px`;
              }
              clonedDoc.body.style.background = "#050505";
            },
          },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          pagebreak: { mode: ["css", "legacy"] },
        })
        .from(captureRoot)
        .save();
    } catch (e) {
      console.error("PDF export failed", e);
      openPrintFallback();
    } finally {
      iframe.remove();
    }
  };

  // Load History on Mount
  useEffect(() => {
    if (currentUser?.id) {
      getUserAiPlans(currentUser.id).then(plans => setHistoryPlans(plans));
    }
  }, [currentUser?.id]);

  // Load from history
  const loadFromHistory = (plan: any) => {
    if (plan.plan_type === "workout") {
      setWorkoutPlan(plan.plan_data);
      setActiveTab("workout");
      setPlanGenerated(true);
    } else if (plan.plan_type === "diet") {
      setDietPlan(plan.plan_data);
      setActiveTab("diet");
      setPlanGenerated(true);
    } else if (plan.plan_type === "physique" || plan.plan_type === "analyze") {
      setPhysiqueAnalysis(plan.plan_data);
      setActiveTab("analyze");
      setPlanGenerated(true);
    }
    setShowHistory(false);
  };

  const handleDownloadWorkout = () => {
    if (!workoutPlan) return;
    const days = workoutPlan.days || mockWorkoutPlan.days;
    const o = currentUser.onboardingData;
    const rows = days
      .map((d: any) => {
        const dayTitle = `${d.day} — ${d.title || d.focus || ""}`;
        const exRows = (d.exercises || [])
          .map(
            (ex: any, i: number) =>
              `<tr><td>${i + 1}</td><td>${escapeHtml(ex.name)}</td><td>${escapeHtml(String(ex.sets))}×${escapeHtml(String(ex.reps))}</td><td>${escapeHtml(ex.notes || ex.rest || "—")}</td></tr>`
          )
          .join("");
        return `
      <div class="day">
        <div class="day-title">${escapeHtml(dayTitle)}</div>
        <table><tr><th>#</th><th>Exercise</th><th>Sets × Reps</th><th>Notes</th></tr>
        ${exRows}
        </table>
      </div>`;
      })
      .join("");

    const profileRows = [
      { label: "Name", value: currentUser.name },
      { label: "Age", value: o?.age != null ? `${o.age} yrs` : "—" },
      { label: "Height", value: o?.height != null ? `${o.height} cm` : "—" },
      { label: "Weight (now)", value: `${customData.weight} kg` },
      { label: "Goal", value: goalLabel(customData.goal || o?.goal) },
      { label: "Level", value: escapeHtml(customData.fitnessLevel || o?.fitnessLevel || "—") },
      { label: "Days / week", value: o?.workoutDays != null ? String(o.workoutDays) : "—" },
      {
        label: "Location",
        value: customData.workoutLocation === "home" ? "Home" : "Gym",
      },
      { label: "Gender", value: escapeHtml(customData.gender) },
    ];
    if (customData.customInstructions?.trim()) {
      profileRows.push({
        label: "Your notes",
        value:
          customData.customInstructions.trim().slice(0, 280) +
          (customData.customInstructions.length > 280 ? "…" : ""),
      });
    }

    downloadPlanAsPDF({
      docTitle: workoutPlan.planName || "Personalized workout plan",
      variant: "workout",
      contentHtml: rows,
      userDisplayName: currentUser.name,
      coachMessage: typeof workoutPlan.message === "string" ? workoutPlan.message : undefined,
      planFocus: typeof workoutPlan.focus === "string" ? workoutPlan.focus : undefined,
      profileRows,
      tipLines: planTeluguTips(workoutPlan, DEFAULT_WORKOUT_TELUGU_TIPS),
      region: typeof workoutPlan.region === "string" ? workoutPlan.region : "Telangana · Andhra",
    });
  };

  const handleDownloadDiet = () => {
    if (!dietPlan) return;
    const meals = dietPlan.meals || mockDietPlan.meals;
    const o = currentUser.onboardingData;
    const macroHtml = `<div class="macros">
      <div class="macro"><div class="macro-val">${escapeHtml(dietPlan.dailyCalories ?? mockDietPlan.calories)}</div><div class="macro-label">Calories</div></div>
      <div class="macro"><div class="macro-val">${escapeHtml(dietPlan.macros?.protein ?? `${mockDietPlan.protein}g`)}</div><div class="macro-label">Protein</div></div>
      <div class="macro"><div class="macro-val">${escapeHtml(dietPlan.macros?.carbs ?? `${mockDietPlan.carbs}g`)}</div><div class="macro-label">Carbs</div></div>
      <div class="macro"><div class="macro-val">${escapeHtml(dietPlan.macros?.fats ?? `${mockDietPlan.fats}g`)}</div><div class="macro-label">Fats</div></div>
    </div>`;
    const mealHtml = meals
      .map((m: any) => {
        const food = Array.isArray(m.foods) ? m.foods.join(", ") : m.items || "";
        const teluguNote =
          typeof m.teluguNote === "string" && m.teluguNote.trim()
            ? `<p class="meal-telugu">${escapeHtml(m.teluguNote)}</p>`
            : "";
        return `
      <div class="meal">
        <div class="meal-time">${escapeHtml(m.time)} — ${escapeHtml(m.name || "")}</div>
        <div class="meal-food">${escapeHtml(food)}</div>
        ${teluguNote}
        <div class="meal-cal">${escapeHtml(String(m.calories ?? m.cal ?? ""))} kcal</div>
      </div>`;
      })
      .join("");

    const profileRows = [
      { label: "Name", value: currentUser.name },
      { label: "Age", value: o?.age != null ? `${o.age} yrs` : "—" },
      { label: "Height", value: o?.height != null ? `${o.height} cm` : "—" },
      { label: "Weight (now)", value: `${customData.weight} kg` },
      { label: "Goal", value: goalLabel(customData.goal || o?.goal) },
      { label: "Level", value: escapeHtml(customData.fitnessLevel || o?.fitnessLevel || "—") },
      { label: "Training days / wk", value: o?.workoutDays != null ? String(o.workoutDays) : "—" },
      { label: "Gender", value: escapeHtml(customData.gender) },
    ];
    if (customData.customInstructions?.trim()) {
      profileRows.push({
        label: "Diet prefs / notes",
        value: customData.customInstructions.trim().slice(0, 280) + (customData.customInstructions.length > 280 ? "…" : ""),
      });
    }

    const supplements = Array.isArray(dietPlan.supplements)
      ? dietPlan.supplements.map((s: string) => String(s))
      : [];

    downloadPlanAsPDF({
      docTitle: dietPlan.planName || "Personalized diet plan",
      variant: "diet",
      contentHtml: macroHtml + mealHtml,
      userDisplayName: currentUser.name,
      coachMessage: typeof dietPlan.message === "string" ? dietPlan.message : undefined,
      profileRows,
      hydration: typeof dietPlan.hydration === "string" ? dietPlan.hydration : undefined,
      supplements: supplements.length ? supplements : undefined,
      tipLines: planTeluguTips(dietPlan, DEFAULT_DIET_TELUGU_TIPS),
      region: typeof dietPlan.region === "string" ? dietPlan.region : "Telangana · Andhra",
    });
  };

  const handleGenerate = async () => {
    if (aiRequestLock.current) return;
    aiRequestLock.current = true;
    setIsGenerating(true);
    setPlanGenerated(false);
    setGenerateError(null);
    aiStore.setGenerating(true, activeTab);
    aiStore.setError(null);

    // Fire-and-forget promise stored globally so it survives navigation
    const generationWork = (async () => {
      try {
        const res = await fetch("/api/ai-coach", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: activeTab,
            userData: {
              ...currentUser.onboardingData,
              weight: customData.weight,
              goal: customData.goal,
              fitnessLevel: customData.fitnessLevel,
              workoutLocation: customData.workoutLocation,
              gender: customData.gender,
              customInstructions: customData.customInstructions,
              age: currentUser.onboardingData?.age || 25,
              height: currentUser.onboardingData?.height || 175,
              workoutDays: currentUser.onboardingData?.workoutDays || 4
            }
          })
        });

        const raw = await res.text();
        let data: any;
        try {
          data = raw ? JSON.parse(raw) : {};
        } catch {
          const errMsg = res.ok ? "Invalid response from server." : `Server error (${res.status}).`;
          setGenerateError(errMsg);
          aiStore.setError(errMsg);
          return;
        }

        if (res.status === 429) {
          const retry =
            typeof data?.retryAfterSec === "number"
              ? ` Try again in about ${data.retryAfterSec}s.`
              : "";
          const errMsg = (typeof data?.error === "string" ? data.error : "Too many requests.") + retry;
          setGenerateError(errMsg);
          aiStore.setError(errMsg);
          return;
        }

        if (res.status === 413) {
          const errMsg = typeof data?.error === "string" ? data.error : "Request payload too large.";
          setGenerateError(errMsg);
          aiStore.setError(errMsg);
          return;
        }

        if (!res.ok || data?.error) {
          const errMsg = typeof data?.error === "string" ? data.error : `Request failed (${res.status}).`;
          setGenerateError(errMsg);
          aiStore.setError(errMsg);
          return;
        }

        if (activeTab === "workout") {
          setWorkoutPlan(data);
          aiStore.setWorkoutPlan(data);
          if (currentUser?.id) {
            const savedPlan = await saveAiPlan(currentUser.id, "workout", data);
            if (savedPlan) setHistoryPlans(prev => [savedPlan, ...prev]);
          }
        } else if (activeTab === "diet") {
          setDietPlan(data);
          aiStore.setDietPlan(data);
          if (currentUser?.id) {
            const savedPlan = await saveAiPlan(currentUser.id, "diet", data);
            if (savedPlan) setHistoryPlans(prev => [savedPlan, ...prev]);
          }
        }
        setPlanGenerated(true);
      } catch (err) {
        const msg =
          err instanceof TypeError && err.message === "Failed to fetch"
            ? "Could not reach the server. Confirm `npm run dev` is running and open the app at http://localhost:3000 (not a file preview)."
            : err instanceof Error
              ? err.message
              : "Something went wrong.";
        setGenerateError(msg);
        aiStore.setError(msg);
        console.error("AI Generation Error", err);
      } finally {
        aiRequestLock.current = false;
        setIsGenerating(false);
        aiStore.setGenerating(false);
        aiStore.setGenerationPromise(null);
      }
    })();

    // Store the promise globally so it can be awaited if user navigates back
    aiStore.setGenerationPromise(generationWork);
  };

  const handleAnalyze = async () => {
    if (!uploadedImage) return;
    if (aiRequestLock.current) return;
    aiRequestLock.current = true;
    setIsGenerating(true);
    setGenerateError(null);

    try {
      const res = await fetch("/api/ai-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "physique",
          userData: currentUser.onboardingData,
          photoData: uploadedImage,
        }),
      });

      const raw = await res.text();
      let data: any;
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        setGenerateError(res.ok ? "Invalid response from server." : `Server error (${res.status}).`);
        return;
      }

      if (res.status === 429) {
        const retry =
          typeof data?.retryAfterSec === "number"
            ? ` Try again in about ${data.retryAfterSec}s.`
            : "";
        setGenerateError(
          (typeof data?.error === "string" ? data.error : "Too many requests.") + retry
        );
        return;
      }

      if (res.status === 413) {
        setGenerateError(typeof data?.error === "string" ? data.error : "Image too large for analysis.");
        return;
      }

      if (!res.ok || data?.error) {
        setGenerateError(typeof data?.error === "string" ? data.error : `Request failed (${res.status}).`);
        return;
      }

      const newAnalysis = {
        bodyFat: data.estimatedBodyFat,
        muscleMass: "Analyzed",
        weakAreas: data.weakAreas || [],
        strongAreas: data.strongAreas || [],
        suggestions: data.actionPlan || [data.feedback],
      };
      setPhysiqueAnalysis(newAnalysis);
      if (currentUser?.id) {
        const savedPlan = await saveAiPlan(currentUser.id, "physique", newAnalysis);
        if (savedPlan) setHistoryPlans((prev) => [savedPlan, ...prev]);
      }
      setPlanGenerated(true);
    } catch (err) {
      const msg =
        err instanceof TypeError && err.message === "Failed to fetch"
          ? "Could not reach the server. Confirm `npm run dev` is running and use http://localhost:3000."
          : err instanceof Error
            ? err.message
            : "Something went wrong.";
      setGenerateError(msg);
      console.error("Analysis Error", err);
    } finally {
      aiRequestLock.current = false;
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-[100vw] overflow-x-hidden p-4 sm:p-6 lg:p-8 space-y-6 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-white text-2xl sm:text-3xl font-black uppercase tracking-tighter font-heading">
          AI <span className="text-brand">Coach</span>
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Personalized plans powered by artificial intelligence
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory scroll-pl-4">
        {tabs.map((tab) => (
          <button
            type="button"
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setPlanGenerated(false);
              setPhysiqueAnalysis(null);
              setGenerateError(null);
            }}
            className={cn(
              "flex items-center gap-2 min-h-11 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all shrink-0 snap-start touch-manipulation",
              activeTab === tab.id
                ? "bg-brand text-white shadow-[0_0_20px_rgba(235,0,0,0.2)]"
                : "bg-white/5 text-text-secondary hover:bg-white/10 border border-white/5"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Customization Form */}
      {!isGenerating && !planGenerated && activeTab !== "analyze" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-surface-card border border-white/5 rounded-2xl p-5 sm:p-6 space-y-4">
          <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-4">Customize Your Plan</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-text-muted text-xs font-bold uppercase tracking-widest mb-1 block">Current Weight (kg)</label>
              <input 
                type="number" 
                value={customData.weight} 
                onChange={(e) => setCustomData({...customData, weight: Number(e.target.value)})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-base sm:text-sm focus:border-brand focus:outline-none"
              />
            </div>
            <div>
              <label className="text-text-muted text-xs font-bold uppercase tracking-widest mb-1 block">Primary Goal</label>
              <select 
                value={customData.goal}
                onChange={(e) => setCustomData({...customData, goal: e.target.value as any})}
                className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white text-base sm:text-sm focus:border-brand focus:outline-none"
              >
                <option value="muscle_gain">Muscle Gain</option>
                <option value="fat_loss">Fat Loss</option>
                <option value="maintain">Maintenance</option>
                <option value="endurance">Endurance & Core</option>
              </select>
            </div>
            <div>
              <label className="text-text-muted text-xs font-bold uppercase tracking-widest mb-1 block">Fitness Level</label>
              <select 
                value={customData.fitnessLevel}
                onChange={(e) => setCustomData({...customData, fitnessLevel: e.target.value as any})}
                className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white text-base sm:text-sm focus:border-brand focus:outline-none"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="text-text-muted text-xs font-bold uppercase tracking-widest mb-1 block">Workout Location</label>
              <select 
                value={customData.workoutLocation}
                onChange={(e) => setCustomData({...customData, workoutLocation: e.target.value})}
                className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white text-base sm:text-sm focus:border-brand focus:outline-none"
              >
                <option value="gym">Full Gym (Machines & Free Weights)</option>
                <option value="home">Home (Bodyweight & Dumbbells)</option>
              </select>
            </div>
            <div>
              <label className="text-text-muted text-xs font-bold uppercase tracking-widest mb-1 block">Gender</label>
              <select 
                value={customData.gender}
                onChange={(e) => setCustomData({...customData, gender: e.target.value})}
                className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white text-base sm:text-sm focus:border-brand focus:outline-none"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div className="md:col-span-2 mt-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-3 block">Special Instructions (Optional)</label>
              <textarea
                value={customData.customInstructions}
                onChange={(e) => setCustomData({ ...customData, customInstructions: e.target.value })}
                placeholder="e.g. I am vegetarian, I have a bad knee, I want to lose chest fat..."
                className="w-full h-28 sm:h-24 bg-[#111] border border-white/10 rounded-xl p-4 text-white text-base sm:text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand resize-none transition-all placeholder:text-text-muted"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            className="w-full mt-4 min-h-12 px-5 py-4 bg-brand hover:bg-brand-dark text-white font-black text-sm uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(235,0,0,0.2)] touch-manipulation"
          >
            <Sparkles className="w-5 h-5" />
            Generate {activeTab === "workout" ? "Workout" : "Diet"} Plan
          </button>
          {generateError && (
            <p className="text-red-400 text-sm font-medium leading-relaxed border border-red-500/20 rounded-xl px-4 py-3 bg-red-500/5">
              {generateError}
            </p>
          )}
        </motion.div>
      )}

      {/* Generating animation */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-surface-card border border-brand/20 rounded-2xl p-8 sm:p-12 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-brand/20 flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-8 h-8 text-brand animate-spin" />
            </div>
            <h3 className="text-white text-lg font-bold mb-2">
              {activeTab === "diet"
                ? "Building your nutrition blueprint…"
                : activeTab === "analyze"
                  ? "Scanning physique & weak points…"
                  : "Forging your training split…"}
            </h3>
            <AnimatePresence mode="wait">
              <motion.p
                key={loadingTipIndex}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className="text-text-secondary text-sm min-h-[2.75rem] flex items-center justify-center px-2"
              >
                {AI_LOADING_TIPS[loadingTipIndex]}
              </motion.p>
            </AnimatePresence>
            <div className="mt-6 h-1 bg-white/5 rounded-full overflow-hidden max-w-xs mx-auto">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2.5, ease: "easeInOut" }}
                className="h-full bg-brand rounded-full"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {activeTab === "workout" && planGenerated && workoutPlan && !isGenerating && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* AI Conversational Message */}
          {workoutPlan.message && (
            <div className="bg-brand/10 border border-brand/20 rounded-2xl p-4 sm:p-5 flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-brand/20 flex items-center justify-center shrink-0 mt-1">
                <Brain className="w-5 h-5 text-brand" />
              </div>
              <div className="min-w-0">
                <p className="text-brand font-bold text-sm mb-1 uppercase tracking-widest">Coach RahulFitzz AI</p>
                <p className="text-white text-sm leading-relaxed break-words">{workoutPlan.message}</p>
              </div>
            </div>
          )}

          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h2 className="text-white font-bold text-sm uppercase tracking-widest truncate pr-2">
                {workoutPlan.planName || mockWorkoutPlan.title}
              </h2>
              {workoutPlan.region && (
                <p className="text-brand text-[10px] font-bold uppercase tracking-widest mt-1">
                  {workoutPlan.region}
                </p>
              )}
            </div>
            <div className="flex gap-2 shrink-0">
              <button type="button" onClick={handleDownloadWorkout} className="min-h-10 min-w-10 h-10 w-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-text-secondary hover:text-white transition-colors touch-manipulation">
                <Download className="w-4 h-4" />
              </button>
              <button type="button" onClick={handleDownloadWorkout} className="min-h-10 min-w-10 h-10 w-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-text-secondary hover:text-white transition-colors touch-manipulation">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-[#120808] border border-brand/20 rounded-2xl p-4">
            <p className="text-brand text-xs font-bold uppercase tracking-widest mb-3">
              Telugu tips · సూచనలు
            </p>
            <ul className="space-y-2">
              {planTeluguTips(workoutPlan, DEFAULT_WORKOUT_TELUGU_TIPS).map((tip, idx) => (
                <li key={idx} className="text-text-secondary text-sm leading-relaxed">
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {(workoutPlan.days || mockWorkoutPlan.days).map((day: any, i: number) => (
            <div key={day.day} className="bg-surface-card border border-white/5 rounded-2xl overflow-hidden">
              <button
                type="button"
                onClick={() => setExpandedDay(expandedDay === i ? null : i)}
                className="w-full min-h-[52px] flex items-center justify-between gap-3 p-4 sm:p-5 touch-manipulation text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
                    <Dumbbell className="w-5 h-5 text-brand" />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-white font-bold text-sm">{day.day}</p>
                    <p className="text-text-secondary text-xs line-clamp-2">{day.focus}</p>
                  </div>
                </div>
                <ChevronRight className={cn("w-4 h-4 text-text-muted transition-transform", expandedDay === i && "rotate-90")} />
              </button>

              <AnimatePresence>
                {expandedDay === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 space-y-2">
                      {day.exercises.map((ex: any, j: number) => (
                        <div
                          key={j}
                          className="flex flex-col gap-2.5 p-3 bg-white/[0.03] rounded-xl border border-white/5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <span className="text-text-muted text-xs font-mono w-5 shrink-0">{j + 1}</span>
                              <p className="text-white text-sm font-medium leading-snug">{ex.name}</p>
                            </div>
                            <a
                              href={getExerciseYoutubeUrl(ex.name)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 shrink-0 text-[10px] font-black uppercase tracking-wider text-brand hover:text-white transition-colors border border-brand/25 hover:border-brand px-2.5 py-1.5 bg-brand/5 no-underline touch-manipulation"
                              aria-label={`Watch ${ex.name} on YouTube`}
                            >
                              <Play className="w-3 h-3 fill-current" />
                              YouTube
                            </a>
                          </div>
                          <div className="flex items-center gap-3 pl-8">
                            <span className="text-brand text-xs font-bold">{ex.sets}×{ex.reps}</span>
                            {(ex.rest || ex.notes) && (
                              <span className="text-text-muted text-[10px] line-clamp-2">{ex.rest || ex.notes}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </motion.div>
      )}

      {/* Diet Plan Result */}
      {activeTab === "diet" && planGenerated && dietPlan && !isGenerating && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          
          {/* AI Conversational Message */}
          {dietPlan.message && (
            <div className="bg-brand/10 border border-brand/20 rounded-2xl p-4 sm:p-5 flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-brand/20 flex items-center justify-center shrink-0 mt-1">
                <Salad className="w-5 h-5 text-brand" />
              </div>
              <div className="min-w-0">
                <p className="text-brand font-bold text-sm mb-1 uppercase tracking-widest">Nutritionist AI</p>
                <p className="text-white text-sm leading-relaxed break-words">{dietPlan.message}</p>
              </div>
            </div>
          )}

          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h2 className="text-white font-bold text-sm uppercase tracking-widest truncate pr-2">
                {dietPlan?.planName || "Personalized Diet Plan"}
              </h2>
              {dietPlan.region && (
                <p className="text-brand text-[10px] font-bold uppercase tracking-widest mt-1">
                  {dietPlan.region}
                </p>
              )}
            </div>
            <div className="flex gap-2 shrink-0">
              <button type="button" onClick={handleDownloadDiet} className="min-h-10 min-w-10 h-10 w-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-text-secondary hover:text-white transition-colors touch-manipulation">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-[#120808] border border-brand/20 rounded-2xl p-4">
            <p className="text-brand text-xs font-bold uppercase tracking-widest mb-3">
              Telugu tips · సూచనలు
            </p>
            <ul className="space-y-2">
              {planTeluguTips(dietPlan, DEFAULT_DIET_TELUGU_TIPS).map((tip, idx) => (
                <li key={idx} className="text-text-secondary text-sm leading-relaxed">
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Macro summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Calories", value: dietPlan.dailyCalories || `${mockDietPlan.calories}`, unit: "kcal", color: "text-brand" },
              { label: "Protein", value: dietPlan.macros?.protein || `${mockDietPlan.protein}g`, unit: "", color: "text-blue-400" },
              { label: "Carbs", value: dietPlan.macros?.carbs || `${mockDietPlan.carbs}g`, unit: "", color: "text-yellow-400" },
              { label: "Fats", value: dietPlan.macros?.fats || `${mockDietPlan.fats}g`, unit: "", color: "text-emerald-400" },
            ].map((m) => (
              <div key={m.label} className="bg-surface-card border border-white/5 rounded-2xl p-3 sm:p-4 text-center min-w-0">
                <p className={`text-xl sm:text-2xl font-black font-heading ${m.color} break-words`}>{m.value}</p>
                <p className="text-text-muted text-xs uppercase tracking-widest mt-1">{m.label}</p>
              </div>
            ))}
          </div>

          {/* Meals */}
          <div className="space-y-3">
            {(dietPlan.meals || mockDietPlan.meals).map((meal: any) => (
              <div key={meal.time} className="bg-surface-card border border-white/5 rounded-2xl p-4 sm:p-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
                <div className="flex items-start justify-between gap-3 sm:flex-col sm:justify-start sm:gap-1 shrink-0 sm:w-28">
                  <div>
                    <p className="text-brand text-xs font-bold">{meal.time}</p>
                    <p className="text-text-muted text-[10px] uppercase">{meal.name}</p>
                  </div>
                  <p className="text-text-secondary text-xs font-bold sm:hidden shrink-0">{meal.calories || meal.cal} cal</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm leading-relaxed">{Array.isArray(meal.foods) ? meal.foods.join(", ") : meal.items}</p>
                  {meal.teluguNote && (
                    <p className="text-text-muted text-xs mt-2 italic">{meal.teluguNote}</p>
                  )}
                </div>
                <div className="hidden sm:block shrink-0 sm:text-right">
                  <p className="text-text-secondary text-xs font-bold">{meal.calories || meal.cal} cal</p>
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/supplements"
            className="flex items-center justify-center gap-2 min-h-12 w-full rounded-2xl border border-brand/25 bg-brand/10 text-brand text-xs font-bold uppercase tracking-widest no-underline touch-manipulation hover:bg-brand/15"
          >
            Full supplement guide — creatine, whey, gut & hair →
          </Link>
        </motion.div>
      )}

      {/* Physique Analyzer */}
      {activeTab === "analyze" && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {!physiqueAnalysis && !isGenerating && (
            <div className="bg-surface-card border border-dashed border-white/10 rounded-2xl p-8 sm:p-12 text-center">
              <Camera className="w-12 h-12 text-text-muted mx-auto mb-4" />
              <h3 className="text-white font-bold text-lg mb-2">Upload Your Physique Photo</h3>
              <p className="text-text-secondary text-sm mb-6 max-w-sm mx-auto">
                Our AI will estimate body fat %, muscle distribution, and give actionable suggestions
              </p>
              <label className="inline-flex items-center justify-center gap-2 min-h-12 px-6 py-3 bg-brand hover:bg-brand-dark text-white font-bold text-xs uppercase tracking-widest rounded-xl cursor-pointer transition-all hover:shadow-[0_0_20px_rgba(235,0,0,0.3)] touch-manipulation w-full max-w-xs mx-auto sm:w-auto sm:max-w-none">
                <Camera className="w-4 h-4" />
                Choose Photo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    setGenerateError(null);
                    if (!file) return;
                    if (file.size > MAX_PHYSIQUE_FILE_BYTES) {
                      setGenerateError("Photo must be about 4 MB or smaller. Try another image or export at lower quality.");
                      e.target.value = "";
                      return;
                    }
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setUploadedImage(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                  }}
                />
              </label>
              {uploadedImage && (
                <div className="mt-6">
                  <img src={uploadedImage} alt="Uploaded" className="w-40 h-40 object-cover rounded-2xl mx-auto border border-white/10" />
                  <button
                    type="button"
                    onClick={handleAnalyze}
                    className="mt-4 min-h-12 px-6 py-3 bg-brand hover:bg-brand-dark text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 mx-auto w-full max-w-xs sm:w-auto touch-manipulation"
                  >
                    <Sparkles className="w-4 h-4" /> Analyze Now
                  </button>
                  {generateError && (
                    <p className="mt-4 text-red-400 text-sm font-medium max-w-sm mx-auto leading-relaxed border border-red-500/20 rounded-xl px-4 py-3 bg-red-500/5">
                      {generateError}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {physiqueAnalysis && !isGenerating && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-surface-card border border-white/5 rounded-2xl p-5 text-center">
                  <p className="text-brand text-3xl font-black font-heading">{physiqueAnalysis.bodyFat}%</p>
                  <p className="text-text-muted text-xs uppercase tracking-widest mt-1">Body Fat</p>
                </div>
                <div className="bg-surface-card border border-white/5 rounded-2xl p-5 text-center">
                  <p className="text-emerald-400 text-xl font-black font-heading">{physiqueAnalysis.muscleMass}</p>
                  <p className="text-text-muted text-xs uppercase tracking-widest mt-1">Muscle Mass</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-surface-card border border-white/5 rounded-2xl p-5">
                  <h4 className="text-brand text-xs font-bold uppercase tracking-widest mb-3">Strong Areas 💪</h4>
                  <div className="flex flex-wrap gap-2">
                    {physiqueAnalysis.strongAreas.map((a: string) => (
                      <span key={a} className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-lg border border-emerald-500/20">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="bg-surface-card border border-white/5 rounded-2xl p-5">
                  <h4 className="text-brand text-xs font-bold uppercase tracking-widest mb-3">Needs Work ⚡</h4>
                  <div className="flex flex-wrap gap-2">
                    {physiqueAnalysis.weakAreas.map((a: string) => (
                      <span key={a} className="px-3 py-1.5 bg-yellow-500/10 text-yellow-400 text-xs font-bold rounded-lg border border-yellow-500/20">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-surface-card border border-white/5 rounded-2xl p-5">
                <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-3">AI Suggestions</h4>
                <div className="space-y-3">
                  {physiqueAnalysis.suggestions.map((s: string, i: number) => (
                    <div key={i} className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                      <p className="text-text-secondary text-sm">{s}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button type="button" className="flex-1 min-h-12 py-3 bg-brand/10 border border-brand/20 text-brand font-bold text-xs uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 hover:bg-brand/20 transition-all touch-manipulation">
                  <Share2 className="w-4 h-4" /> Share Result
                </button>
                <button
                  type="button"
                  onClick={() => { setPhysiqueAnalysis(null); setUploadedImage(null); }}
                  className="flex-1 min-h-12 py-3 bg-white/5 border border-white/10 text-white font-bold text-xs uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all touch-manipulation"
                >
                  <RotateCcw className="w-4 h-4" /> Re-analyze
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* History Modal */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0a0a0a] border border-white/10 rounded-t-3xl sm:rounded-3xl w-full max-w-xl max-h-[min(90dvh,900px)] sm:max-h-[85dvh] flex flex-col overflow-hidden"
            >
              <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between gap-3 shrink-0">
                <h3 className="text-white font-black uppercase tracking-widest text-sm sm:text-base truncate">Saved AI Plans</h3>
                <button type="button" onClick={() => setShowHistory(false)} className="min-h-11 min-w-11 flex items-center justify-center rounded-xl text-text-muted hover:text-white hover:bg-white/5 touch-manipulation shrink-0">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 sm:p-6 overflow-y-auto space-y-3 custom-scrollbar flex-1 min-h-0">
                {historyPlans.length === 0 ? (
                  <p className="text-center text-text-muted text-sm py-10">No saved plans yet. Generate one!</p>
                ) : (
                  historyPlans.map((plan: any) => (
                    <button
                      type="button"
                      key={plan.id}
                      onClick={() => loadFromHistory(plan)}
                      className="w-full min-h-[52px] bg-white/5 border border-white/10 hover:border-brand/50 hover:bg-brand/5 transition-all p-4 rounded-xl flex items-center justify-between gap-3 text-left group touch-manipulation"
                    >
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
                          {plan.plan_type === 'workout' ? <Dumbbell className="w-5 h-5 text-brand" /> : 
                           plan.plan_type === 'diet' ? <Salad className="w-5 h-5 text-brand" /> : 
                           <User className="w-5 h-5 text-brand" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-bold text-sm uppercase mb-1 truncate">
                            {plan.plan_data?.planName || plan.plan_type + " Plan"}
                          </p>
                          <p className="text-text-muted text-xs">
                            {new Date(plan.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-brand transition-colors" />
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
 