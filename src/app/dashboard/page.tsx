"use client";

import { motion } from "framer-motion";
import {
  Flame,
  TrendingUp,
  Footprints,
  Droplets,
  Dumbbell,
  Target,
  Trophy,
  ArrowUpRight,
  Zap,
  Calendar,
  ChevronRight,
  Gift,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useUserStore, DEMO_USER } from "@/store/use-user-store";
import { calculateLevel, getStreakEmoji } from "@/lib/utils";

// Mock data for the dashboard
const todayStats = {
  calories: { value: 1850, target: 2200, unit: "kcal" },
  steps: { value: 8420, target: 10000, unit: "steps" },
  water: { value: 2.1, target: 3, unit: "L" },
  workouts: { value: 1, target: 1, unit: "done" },
};

const weeklyData = [
  { day: "Mon", value: 85 },
  { day: "Tue", value: 92 },
  { day: "Wed", value: 78 },
  { day: "Thu", value: 95 },
  { day: "Fri", value: 88 },
  { day: "Sat", value: 70 },
  { day: "Sun", value: 0 },
];

const recentAchievements = [
  { name: "7-Day Warrior", icon: "🔥", desc: "7 day streak completed", time: "2 days ago" },
  { name: "First Challenge", icon: "⚔️", desc: "Joined your first challenge", time: "5 days ago" },
  { name: "Iron Recruit", icon: "🏋️", desc: "Logged 10 workouts", time: "1 week ago" },
];

const quickActions = [
  { label: "AI Coach", href: "/ai-coach", icon: Zap, color: "from-brand to-red-700" },
  { label: "Gym Mode", href: "/gym-mode", icon: Dumbbell, color: "from-orange-500 to-orange-700" },
  { label: "Giveaways", href: "/giveaways", icon: Gift, color: "from-yellow-500 to-amber-700" },
  { label: "Community", href: "/community", icon: Target, color: "from-emerald-500 to-emerald-700" },
];

function StatCard({
  icon: Icon,
  label,
  value,
  target,
  unit,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  target: number;
  unit: string;
  color: string;
}) {
  const pct = Math.min((value / target) * 100, 100);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface-card border border-white/5 rounded-2xl p-4 sm:p-5 hover:border-white/10 transition-colors"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <span className="text-text-muted text-[10px] font-bold uppercase tracking-widest">
          {Math.round(pct)}%
        </span>
      </div>
      <p className="text-white text-2xl font-black font-heading">
        {value}
        <span className="text-text-muted text-xs font-body ml-1">{unit}</span>
      </p>
      <p className="text-text-secondary text-xs mt-1">{label}</p>
      <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const { user } = useUserStore();
  const currentUser = user || DEMO_USER;
  const displayName = session?.user?.name || currentUser.name;
  const avatarUrl = session?.user?.image || currentUser.avatarUrl || "";
  const levelInfo = calculateLevel(currentUser.xpPoints);
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          {avatarUrl && (
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-12 h-12 rounded-2xl border-2 border-brand/30 object-cover"
              referrerPolicy="no-referrer"
            />
          )}
          <div>
            <h1 className="text-white text-2xl sm:text-3xl font-black uppercase tracking-tighter font-heading">
              Hey, {displayName.split(" ")[0]}! 👋
            </h1>
            <p className="text-text-secondary text-sm mt-1 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" /> {today}
            </p>
          </div>
        </div>
        <Link
          href="/ai-coach"
          className="flex items-center justify-center gap-2 px-5 py-3 min-h-11 w-full sm:w-auto sm:py-2.5 bg-brand/10 border border-brand/20 rounded-xl text-brand text-xs font-bold uppercase tracking-widest hover:bg-brand/20 transition-all no-underline touch-manipulation shrink-0"
        >
          <Zap className="w-3.5 h-3.5" /> Generate Plan
        </Link>
      </div>

      {/* Level Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-brand/10 via-surface-card to-surface-card border border-brand/10 rounded-2xl p-4 sm:p-6"
      >
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-brand/20 flex items-center justify-center shrink-0">
              <span className="text-2xl">{getStreakEmoji(currentUser.currentStreak)}</span>
            </div>
            <div className="min-w-0">
              <p className="text-white font-bold text-sm">
                Level {levelInfo.level} — {currentUser.currentStreak} Day Streak
              </p>
              <p className="text-text-secondary text-xs">
                {Math.round(levelInfo.nextLevelXp - (levelInfo.progress / 100 * levelInfo.nextLevelXp))} XP to next level
              </p>
            </div>
          </div>
          <div className="text-right shrink-0 ml-auto sm:ml-0">
            <p className="text-brand font-bold text-lg font-heading">{currentUser.xpPoints} XP</p>
            <p className="text-text-muted text-[10px] uppercase tracking-widest">Total Points</p>
          </div>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${levelInfo.progress}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-brand to-brand-light rounded-full"
          />
        </div>
      </motion.div>

      {/* Quick Actions — mobile grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {quickActions.map((action, i) => (
          <motion.div
            key={action.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              href={action.href}
              className="block p-4 bg-surface-card border border-white/5 rounded-2xl hover:border-white/10 transition-all group no-underline"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-3`}>
                <action.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-white text-sm font-bold">{action.label}</p>
              <ArrowUpRight className="w-3.5 h-3.5 text-text-muted mt-2 group-hover:text-white transition-colors" />
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Today's Stats */}
      <div>
        <h2 className="text-white font-bold text-sm uppercase tracking-widest mb-4">Today&apos;s Progress</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard icon={Flame} label="Calories" value={todayStats.calories.value} target={todayStats.calories.target} unit={todayStats.calories.unit} color="bg-brand" />
          <StatCard icon={Footprints} label="Steps" value={todayStats.steps.value} target={todayStats.steps.target} unit={todayStats.steps.unit} color="bg-blue-600" />
          <StatCard icon={Droplets} label="Water" value={todayStats.water.value} target={todayStats.water.target} unit={todayStats.water.unit} color="bg-cyan-600" />
          <StatCard icon={Dumbbell} label="Workouts" value={todayStats.workouts.value} target={todayStats.workouts.target} unit={todayStats.workouts.unit} color="bg-emerald-600" />
        </div>
      </div>

      {/* Weekly Overview + Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Weekly bar chart */}
        <div className="lg:col-span-2 bg-surface-card border border-white/5 rounded-2xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-bold text-sm uppercase tracking-widest">Weekly Activity</h3>
            <span className="text-text-muted text-xs">Completion %</span>
          </div>
          <div className="flex items-end gap-2 sm:gap-4 h-40">
            {weeklyData.map((d, i) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(d.value, 5)}%` }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className={`w-full rounded-xl transition-colors ${
                    d.value === 0
                      ? "bg-white/5"
                      : d.value >= 90
                      ? "bg-brand"
                      : d.value >= 70
                      ? "bg-brand/60"
                      : "bg-brand/30"
                  }`}
                />
                <span className="text-text-muted text-[10px] font-medium">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-surface-card border border-white/5 rounded-2xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-sm uppercase tracking-widest">Achievements</h3>
            <Trophy className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="space-y-4">
            {recentAchievements.map((ach) => (
              <div key={ach.name} className="flex items-start gap-3 group">
                <span className="text-xl shrink-0">{ach.icon}</span>
                <div className="min-w-0">
                  <p className="text-white text-sm font-bold truncate">{ach.name}</p>
                  <p className="text-text-muted text-xs">{ach.time}</p>
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/challenges"
            className="mt-4 flex items-center gap-2 text-brand text-xs font-bold uppercase tracking-widest hover:text-brand-light transition-colors no-underline"
          >
            View All <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Today's Workout Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-surface-card to-surface-elevated border border-white/5 rounded-2xl p-4 sm:p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold text-sm uppercase tracking-widest">Today&apos;s Workout</h3>
          <Link
            href="/gym-mode"
            className="text-brand text-xs font-bold uppercase tracking-widest flex items-center gap-1 no-underline hover:text-brand-light transition-colors"
          >
            Start <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { name: "Bench Press", sets: "4×8", muscle: "Chest" },
            { name: "Incline DB Press", sets: "3×12", muscle: "Upper Chest" },
            { name: "Cable Flyes", sets: "3×15", muscle: "Chest" },
          ].map((ex) => (
            <div
              key={ex.name}
              className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5"
            >
              <div className="w-9 h-9 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
                <Dumbbell className="w-4 h-4 text-brand" />
              </div>
              <div className="min-w-0">
                <p className="text-white text-sm font-bold truncate">{ex.name}</p>
                <p className="text-text-muted text-xs">{ex.sets} · {ex.muscle}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
