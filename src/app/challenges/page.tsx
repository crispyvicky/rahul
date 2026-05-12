"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Swords,
  Trophy,
  Flame,
  Clock,
  Users,
  Star,
  ChevronRight,
  Check,
  Medal,
} from "lucide-react";
import { cn } from "@/lib/utils";

const challenges = [
  {
    id: 1,
    title: "30-Day Iron Warrior",
    description: "Complete daily workouts for 30 consecutive days. No excuses.",
    type: "strength",
    duration: 30,
    participants: 1243,
    badge: "🏆",
    active: true,
    progress: 12,
    difficulty: "Hard",
  },
  {
    id: 2,
    title: "7-Day Core Shred",
    description: "Intensive core-focused workouts to build visible abs.",
    type: "core",
    duration: 7,
    participants: 3892,
    badge: "⚡",
    active: true,
    progress: 5,
    difficulty: "Medium",
  },
  {
    id: 3,
    title: "10K Steps Challenge",
    description: "Hit 10,000 steps every day for 14 days straight.",
    type: "cardio",
    duration: 14,
    participants: 5621,
    badge: "🚶",
    active: false,
    progress: 0,
    difficulty: "Easy",
  },
  {
    id: 4,
    title: "Clean Eating Protocol",
    description: "Follow a clean nutrition plan — no processed food for 21 days.",
    type: "nutrition",
    duration: 21,
    participants: 2104,
    badge: "🥗",
    active: false,
    progress: 0,
    difficulty: "Hard",
  },
];

const leaderboard = [
  { rank: 1, name: "Arjun S.", xp: 4820, streak: 30, avatar: "A" },
  { rank: 2, name: "Priya M.", xp: 4510, streak: 28, avatar: "P" },
  { rank: 3, name: "Vikram R.", xp: 4200, streak: 25, avatar: "V" },
  { rank: 4, name: "Neha K.", xp: 3950, streak: 22, avatar: "N" },
  { rank: 5, name: "Rahul D.", xp: 3800, streak: 20, avatar: "R" },
  { rank: 6, name: "You", xp: 2450, streak: 12, avatar: "Y", isYou: true },
];

export default function ChallengesPage() {
  const [tab, setTab] = useState<"active" | "leaderboard">("active");

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 pb-20">
      <div>
        <h1 className="text-white text-2xl sm:text-3xl font-black uppercase tracking-tighter font-heading">
          <span className="text-brand">Challenges</span>
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Compete, earn badges, and prove your discipline
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { id: "active", label: "Challenges", icon: Swords },
          { id: "leaderboard", label: "Leaderboard", icon: Trophy },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as "active" | "leaderboard")}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
              tab === t.id
                ? "bg-brand text-white"
                : "bg-white/5 text-text-secondary hover:bg-white/10 border border-white/5"
            )}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Challenges Grid */}
      {tab === "active" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {challenges.map((ch, i) => (
            <motion.div
              key={ch.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-surface-card border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-3xl">{ch.badge}</span>
                <span
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full",
                    ch.difficulty === "Easy" && "bg-emerald-500/10 text-emerald-400",
                    ch.difficulty === "Medium" && "bg-yellow-500/10 text-yellow-400",
                    ch.difficulty === "Hard" && "bg-brand/10 text-brand"
                  )}
                >
                  {ch.difficulty}
                </span>
              </div>
              <h3 className="text-white font-bold text-base mb-1">{ch.title}</h3>
              <p className="text-text-muted text-xs mb-4 line-clamp-2">{ch.description}</p>

              <div className="flex items-center gap-4 mb-4 text-text-secondary text-xs">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {ch.duration} days
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" /> {ch.participants.toLocaleString()}
                </span>
              </div>

              {ch.active ? (
                <>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-text-secondary">Progress</span>
                    <span className="text-brand font-bold">
                      {ch.progress}/{ch.duration} days
                    </span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-4">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(ch.progress / ch.duration) * 100}%` }}
                      className="h-full bg-brand rounded-full"
                    />
                  </div>
                  <button className="w-full py-3 bg-brand/10 border border-brand/20 text-brand font-bold text-xs uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 hover:bg-brand/20 transition-all">
                    <Check className="w-4 h-4" /> Check In Today
                  </button>
                </>
              ) : (
                <button className="w-full py-3 bg-brand hover:bg-brand-dark text-white font-bold text-xs uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all hover:shadow-[0_0_20px_rgba(235,0,0,0.3)]">
                  <Swords className="w-4 h-4" /> Join Challenge
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Leaderboard */}
      {tab === "leaderboard" && (
        <div className="bg-surface-card border border-white/5 rounded-2xl overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-white/5">
            <h3 className="text-white font-bold text-sm uppercase tracking-widest">Global Rankings</h3>
          </div>
          <div className="divide-y divide-white/5">
            {leaderboard.map((entry, i) => (
              <motion.div
                key={entry.rank}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  "flex items-center gap-4 p-4 sm:px-5",
                  (entry as any).isYou && "bg-brand/5"
                )}
              >
                <span
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0",
                    entry.rank === 1 && "bg-yellow-500/20 text-yellow-400",
                    entry.rank === 2 && "bg-gray-400/20 text-gray-300",
                    entry.rank === 3 && "bg-orange-500/20 text-orange-400",
                    entry.rank > 3 && "bg-white/5 text-text-muted"
                  )}
                >
                  {entry.rank <= 3 ? <Medal className="w-4 h-4" /> : entry.rank}
                </span>
                <div className="w-9 h-9 rounded-xl bg-brand/20 flex items-center justify-center text-brand text-xs font-bold shrink-0">
                  {entry.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-bold truncate", (entry as any).isYou ? "text-brand" : "text-white")}>
                    {entry.name}
                  </p>
                  <p className="text-text-muted text-xs">{entry.streak} day streak</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-white font-bold text-sm">{entry.xp.toLocaleString()}</p>
                  <p className="text-text-muted text-[10px] uppercase tracking-widest">XP</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
