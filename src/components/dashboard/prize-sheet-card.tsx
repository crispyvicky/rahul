"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Gift, Trophy, ChevronRight, Sparkles } from "lucide-react";
import {
  PRIZE_SHEET,
  POINT_EARN_HINTS,
  getNextPrizeTier,
  getUnlockedTiers,
} from "@/lib/prize-sheet";
import { cn } from "@/lib/utils";

type Props = {
  giveawayPoints: number;
  xpPoints: number;
};

export default function PrizeSheetCard({ giveawayPoints, xpPoints }: Props) {
  const unlocked = getUnlockedTiers(giveawayPoints);
  const next = getNextPrizeTier(giveawayPoints);
  const progressToNext = next
    ? Math.min(100, Math.round((giveawayPoints / next.points) * 100))
    : 100;

  return (
    <motion.section
      data-tour="dash-prizes-box"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-yellow-500/10 via-surface-card to-brand/5 border border-yellow-500/20 rounded-2xl p-4 sm:p-6 overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
        <div>
          <span className="text-yellow-400 text-[10px] font-bold uppercase tracking-[0.35em] flex items-center gap-1.5">
            <Gift className="w-3.5 h-3.5" /> Prize sheet
          </span>
          <h2 className="text-white font-bold text-sm sm:text-base uppercase tracking-widest mt-1">
            Points unlock prizes
          </h2>
          <p className="text-text-secondary text-xs mt-2 max-w-md leading-relaxed">
            <span className="text-yellow-400 font-bold">{giveawayPoints}</span> giveaway points
            for prizes · <span className="text-brand font-bold">{xpPoints}</span> XP for your level
            (different scores).
          </p>
        </div>
        <Link
          href="/giveaways"
          className="inline-flex items-center justify-center gap-2 min-h-11 px-4 py-2.5 bg-brand/15 border border-brand/30 rounded-xl text-brand text-[10px] font-bold uppercase tracking-widest hover:bg-brand/25 transition-colors no-underline touch-manipulation shrink-0"
        >
          Earn points <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {next && (
        <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between gap-2 text-xs mb-2">
            <span className="text-text-secondary">
              Next unlock: <span className="text-white font-bold">{next.emoji} {next.prize}</span>
            </span>
            <span className="text-yellow-400 font-bold tabular-nums">
              {giveawayPoints}/{next.points}
            </span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-500 to-brand rounded-full transition-all duration-700"
              style={{ width: `${progressToNext}%` }}
            />
          </div>
        </div>
      )}

      <div className="overflow-x-auto -mx-1 px-1 pb-1 scrollbar-hide">
        <div className="flex gap-2 sm:grid sm:grid-cols-2 lg:grid-cols-5 sm:gap-2 min-w-max sm:min-w-0">
          {PRIZE_SHEET.map((tier) => {
            const isUnlocked = giveawayPoints >= tier.points;
            return (
              <div
                key={tier.id}
                className={cn(
                  "w-[9.5rem] sm:w-auto shrink-0 sm:shrink rounded-xl border p-3 transition-colors",
                  isUnlocked
                    ? "bg-yellow-500/10 border-yellow-500/30"
                    : "bg-white/[0.03] border-white/10 opacity-80"
                )}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-lg" aria-hidden>
                    {tier.emoji}
                  </span>
                  {tier.tag === "hot" && (
                    <span className="text-[8px] font-bold uppercase text-orange-400 bg-orange-500/15 px-1.5 py-0.5 rounded-full">
                      Hot
                    </span>
                  )}
                  {tier.tag === "elite" && (
                    <span className="text-[8px] font-bold uppercase text-brand bg-brand/15 px-1.5 py-0.5 rounded-full">
                      Elite
                    </span>
                  )}
                </div>
                <p className="text-white text-xs font-bold leading-tight line-clamp-2">{tier.prize}</p>
                <p
                  className={cn(
                    "text-[10px] font-bold mt-1.5 tabular-nums",
                    isUnlocked ? "text-yellow-400" : "text-text-muted"
                  )}
                >
                  {tier.points.toLocaleString()} pts
                  {isUnlocked && " ✓"}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {unlocked.length > 0 && (
        <p className="text-emerald-400/90 text-[10px] font-medium mt-3 flex items-center gap-1.5">
          <Trophy className="w-3.5 h-3.5 shrink-0" />
          {unlocked.length} prize tier{unlocked.length === 1 ? "" : "s"} unlocked — claim on Giveaways when campaigns run.
        </p>
      )}

      <details className="mt-4 group">
        <summary className="text-text-muted text-[10px] font-bold uppercase tracking-widest cursor-pointer list-none flex items-center gap-2 touch-manipulation">
          <Sparkles className="w-3.5 h-3.5 text-brand" />
          How to earn giveaway points
        </summary>
        <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {POINT_EARN_HINTS.map((h) => (
            <li
              key={h.label}
              className="flex items-center justify-between gap-2 text-xs py-2 px-3 rounded-lg bg-white/5 border border-white/5"
            >
              <span className="text-text-secondary">{h.label}</span>
              <span className="text-yellow-400 font-bold shrink-0">+{h.points}</span>
            </li>
          ))}
        </ul>
      </details>
    </motion.section>
  );
}
