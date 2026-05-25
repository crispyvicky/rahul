"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Pill,
  Sparkles,
  ChevronDown,
  AlertCircle,
  Check,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SUPPLEMENT_GOALS,
  SUPPLEMENTS,
  getRecommendations,
  type DietPref,
  type SupplementGoalId,
  type SupplementGuideInput,
} from "@/lib/supplements-guide";

function SupplementCard({
  s,
  highlight,
}: {
  s: (typeof SUPPLEMENTS)[0];
  highlight?: boolean;
}) {
  const [open, setOpen] = useState(highlight);

  return (
    <div
      className={cn(
        "bg-surface-card border rounded-2xl overflow-hidden",
        highlight ? "border-brand/40 shadow-[0_0_24px_rgba(235,0,0,0.08)]" : "border-white/10"
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full min-h-[56px] flex items-center gap-3 p-4 text-left touch-manipulation"
      >
        <span className="text-2xl shrink-0" aria-hidden>
          {s.emoji}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm">{s.name}</p>
          <p className="text-text-muted text-[10px] uppercase tracking-wider">{s.category}</p>
        </div>
        <ChevronDown
          className={cn("w-5 h-5 text-text-muted shrink-0 transition-transform", open && "rotate-180")}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
              <InfoRow label="What" value={s.what} />
              <InfoRow label="Who" value={s.who} />
              <InfoRow label="When" value={s.when} />
              <InfoRow label="How" value={s.how} />
              <p className="text-amber-200/90 text-xs leading-relaxed bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                <span className="font-bold uppercase tracking-wider text-[10px] block mb-1">
                  Caution
                </span>
                {s.cautions}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-brand text-[10px] font-bold uppercase tracking-widest mb-1">{label}</p>
      <p className="text-text-secondary text-sm leading-relaxed">{value}</p>
    </div>
  );
}

export default function SupplementsPage() {
  const [goals, setGoals] = useState<SupplementGoalId[]>(["general_health"]);
  const [diet, setDiet] = useState<DietPref>("any");
  const [trainsRegularly, setTrainsRegularly] = useState(true);
  const [ageGroup, setAgeGroup] = useState<SupplementGuideInput["ageGroup"]>("18-35");
  const [showLibrary, setShowLibrary] = useState(false);

  const toggleGoal = (id: SupplementGoalId) => {
    setGoals((prev) =>
      prev.includes(id) ? (prev.length > 1 ? prev.filter((g) => g !== id) : prev) : [...prev, id]
    );
  };

  const input: SupplementGuideInput = useMemo(
    () => ({ goals, diet, trainsRegularly, ageGroup }),
    [goals, diet, trainsRegularly, ageGroup]
  );

  const { primary, alsoConsider, stackSummary } = useMemo(
    () => getRecommendations(input),
    [input]
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 pb-24 max-w-3xl mx-auto">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Pill className="w-5 h-5 text-brand" />
          <span className="text-brand text-[10px] font-bold uppercase tracking-[0.35em]">
            RahulFitzz Lab
          </span>
        </div>
        <h1 className="text-white text-2xl sm:text-3xl font-black uppercase tracking-tighter font-heading">
          Supplement Guide
        </h1>
        <p className="text-text-secondary text-sm mt-2 leading-relaxed">
          Research-backed basics for Indian athletes — whey, creatine, fish oil, gut health, hair
          support & more. Pick your goals below.
        </p>
      </div>

      <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/25 rounded-2xl text-amber-100/90 text-xs leading-relaxed">
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
        <p>
          Education only — not medical advice. Pregnant/nursing, chronic illness, or on prescription
          meds: ask your doctor before any supplement. Blood tests beat guessing (iron, D, B12).
        </p>
      </div>

      {/* Goals */}
      <section className="space-y-3">
        <h2 className="text-white font-bold text-sm uppercase tracking-widest">
          Your goals <span className="text-text-muted font-normal normal-case">(pick 1+)</span>
        </h2>
        <div className="flex flex-wrap gap-2">
          {SUPPLEMENT_GOALS.map((g) => {
            const on = goals.includes(g.id);
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => toggleGoal(g.id)}
                className={cn(
                  "min-h-11 px-3 py-2 rounded-xl text-left border transition-colors touch-manipulation max-w-full",
                  on
                    ? "bg-brand/20 border-brand text-white"
                    : "bg-white/5 border-white/10 text-text-secondary hover:border-white/20"
                )}
              >
                <span className="block text-xs font-bold">{g.label}</span>
                <span className="block text-[10px] opacity-80 mt-0.5">{g.description}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Inputs */}
      <section className="bg-surface-card border border-white/10 rounded-2xl p-4 space-y-4">
        <h2 className="text-white font-bold text-sm uppercase tracking-widest">About you</h2>

        <div>
          <p className="text-text-muted text-xs mb-2 font-medium">Diet</p>
          <div className="flex flex-wrap gap-2">
            {(
              [
                { id: "any", label: "Any" },
                { id: "veg", label: "Vegetarian" },
                { id: "vegan", label: "Vegan" },
              ] as const
            ).map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setDiet(d.id)}
                className={cn(
                  "min-h-10 px-4 rounded-xl text-xs font-bold uppercase tracking-wider border touch-manipulation",
                  diet === d.id
                    ? "bg-brand text-white border-brand"
                    : "bg-white/5 text-text-secondary border-white/10"
                )}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-text-muted text-xs mb-2 font-medium">Age group</p>
          <select
            value={ageGroup}
            onChange={(e) => setAgeGroup(e.target.value as SupplementGuideInput["ageGroup"])}
            className="w-full min-h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm"
          >
            <option value="under18">Under 18</option>
            <option value="18-35">18 – 35</option>
            <option value="36-50">36 – 50</option>
            <option value="50plus">50+</option>
          </select>
        </div>

        <label className="flex items-center gap-3 min-h-11 touch-manipulation cursor-pointer">
          <input
            type="checkbox"
            checked={trainsRegularly}
            onChange={(e) => setTrainsRegularly(e.target.checked)}
            className="w-5 h-5 rounded border-white/20 accent-[#eb0000]"
          />
          <span className="text-white text-sm font-medium">
            I train with weights / gym 3+ days a week
          </span>
        </label>
      </section>

      {/* Results */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand" />
          <h2 className="text-white font-bold text-sm uppercase tracking-widest">
            Your suggested stack
          </h2>
        </div>
        <p className="text-text-secondary text-sm leading-relaxed bg-brand/5 border border-brand/15 rounded-xl p-4">
          {stackSummary}
        </p>

        <p className="text-text-muted text-[10px] uppercase tracking-widest font-bold">
          Start with these
        </p>
        {primary.map((s) => (
          <SupplementCard key={s.id} s={s} highlight />
        ))}

        {alsoConsider.length > 0 && (
          <>
            <p className="text-text-muted text-[10px] uppercase tracking-widest font-bold pt-2">
              Also consider
            </p>
            {alsoConsider.map((s) => (
              <SupplementCard key={s.id} s={s} />
            ))}
          </>
        )}
      </section>

      {/* Full library */}
      <section>
        <button
          type="button"
          onClick={() => setShowLibrary((v) => !v)}
          className="w-full min-h-12 flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 text-white text-xs font-bold uppercase tracking-widest touch-manipulation"
        >
          <BookOpen className="w-4 h-4" />
          {showLibrary ? "Hide full supplement library" : "Browse all supplements A–Z"}
          <ChevronDown className={cn("w-4 h-4 transition-transform", showLibrary && "rotate-180")} />
        </button>
        <AnimatePresence>
          {showLibrary && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="mt-3 space-y-3"
            >
              {SUPPLEMENTS.map((s) => (
                <SupplementCard key={s.id} s={s} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <div className="bg-surface-card border border-white/5 rounded-2xl p-4 space-y-2">
        <p className="text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" /> Golden order
        </p>
        <ol className="text-text-secondary text-sm space-y-2 list-decimal list-inside">
          <li>Sleep 7–9 hours + whole foods (dal, rice, eggs/paneer, vegetables)</li>
          <li>Protein target hit daily — then whey if needed</li>
          <li>Creatine if you lift consistently</li>
          <li>Omega-3 + vitamin D if diet/sun is weak</li>
          <li>Goal-specific add-ons (gut, hair, etc.)</li>
        </ol>
      </div>
    </div>
  );
}
