"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Flame,
  Dumbbell,
  Target,
  Trophy,
  ArrowUpRight,
  Zap,
  Calendar,
  ChevronRight,
  Gift,
  Heart,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useUserStore, DEMO_USER } from "@/store/use-user-store";
import { calculateLevel, getStreakEmoji } from "@/lib/utils";
import type { DashboardGymData } from "@/lib/gym-plan-types";
import PrizeSheetCard from "@/components/dashboard/prize-sheet-card";

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DAY_ABBREVS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type Achievement = { name: string; icon: string; desc: string; time: string };

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
  
  // Real active Gym Mode state connected live!
  const [todayExercises, setTodayExercises] = useState<{ name: string; sets: string; muscle: string }[]>([]);
  const [weeklyCompleted, setWeeklyCompleted] = useState<{ day: string; value: number }[]>(
    DAY_ABBREVS.map(d => ({ day: d, value: 0 }))
  );
  const [stats, setStats] = useState({
    workouts: { value: 0, target: 1, unit: "done" },
  });
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [gymLoading, setGymLoading] = useState(true);
  const [gymError, setGymError] = useState<string | null>(null);

  useEffect(() => {
    const userId = currentUser.id;
    const controller = new AbortController();

    const applyGymData = (data: Pick<
      DashboardGymData,
      "weeklyCompletion" | "todayExercises" | "workoutsCompleted" | "workoutsTotal"
    >) => {
      setWeeklyCompleted(data.weeklyCompletion);
      setTodayExercises(data.todayExercises);
      setStats((prev) => ({
        ...prev,
        workouts: {
          value: data.workoutsCompleted,
          target: data.workoutsTotal || 1,
          unit:
            data.workoutsCompleted >= data.workoutsTotal && data.workoutsTotal > 0
              ? "completed"
              : "done",
        },
      }));
    };

    const loadLocal = () => {
      const savedPlan = localStorage.getItem("rahulfitzz_gym_mode_weekly_plan");
      const savedLogs = localStorage.getItem("rahulfitzz_gym_mode_logs");
      let activePlan: any[] = [];
      let activeLogs: Record<string, any[]> = {};
      if (savedPlan) {
        try {
          activePlan = JSON.parse(savedPlan);
        } catch {
          /* ignore */
        }
      }
      if (savedLogs) {
        try {
          activeLogs = JSON.parse(savedLogs);
        } catch {
          /* ignore */
        }
      }
      const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
      const todayPlan = activePlan.find((dp) => dp.day === todayName);
      const todayEx =
        todayPlan?.exercises?.map((ex: any) => ({
          name: ex.name,
          sets: `${ex.targetSets || ex.sets || 3} sets`,
          muscle: ex.group ? ex.group.toUpperCase() : "WORKOUT",
        })) ?? [];
      let completed = 0;
      const total = todayPlan?.exercises?.length || 0;
      todayPlan?.exercises?.forEach((_: any, idx: number) => {
        const key = `workout-${todayName}-${idx}`;
        const logged = activeLogs[key] || [];
        if (logged.length > 0 && logged.every((s: any) => s.completed)) completed++;
      });
      const weeklyCompletion = DAYS_OF_WEEK.map((dayName, idx) => {
        const dayPlan = activePlan.find((dp) => dp.day === dayName);
        if (!dayPlan?.exercises?.length) return { day: DAY_ABBREVS[idx], value: 0 };
        let done = 0;
        dayPlan.exercises.forEach((_: any, exIdx: number) => {
          const key = `workout-${dayName}-${exIdx}`;
          const logged = activeLogs[key] || [];
          if (logged.length > 0 && logged.every((s: any) => s.completed)) done++;
        });
        return {
          day: DAY_ABBREVS[idx],
          value: Math.round((done / dayPlan.exercises.length) * 100),
        };
      });
      applyGymData({
        weeklyCompletion,
        todayExercises: todayEx,
        workoutsCompleted: completed,
        workoutsTotal: total,
      });
    };

    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);

    const finish = () => {
      if (!controller.signal.aborted) setGymLoading(false);
    };

    setGymLoading(true);
    setGymError(null);

    if (isUuid) {
      fetch(`/api/gym-plan/dashboard?userId=${encodeURIComponent(userId)}`, {
        signal: controller.signal,
      })
        .then((res) => {
          if (res.status === 404) return null;
          if (!res.ok) throw new Error("Could not load gym progress");
          return res.json() as Promise<DashboardGymData>;
        })
        .then((data) => {
          if (controller.signal.aborted) return;
          if (data) {
            applyGymData(data);
          } else {
            loadLocal();
          }
        })
        .catch((err) => {
          if (controller.signal.aborted) return;
          if (err instanceof Error && err.name === "AbortError") return;
          setGymError("Using saved plan — sync unavailable.");
          loadLocal();
        })
        .finally(finish);
    } else {
      loadLocal();
      finish();
    }

    return () => controller.abort();
  }, [currentUser.id]);

  useEffect(() => {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(currentUser.id);
    if (!isUuid) {
      setAchievements([]);
      return;
    }
    fetch(`/api/profile/achievements?userId=${encodeURIComponent(currentUser.id)}`)
      .then((r) => r.json())
      .then((d) => setAchievements(d.achievements || []))
      .catch(() => setAchievements([]));
  }, [currentUser.id]);

  return (
    <div className="px-4 pt-3 sm:p-6 lg:p-8 space-y-6 pb-20">
      {/* Header — avatar only on tablet+ (topbar shows avatar on mobile) */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          {avatarUrl && (
            <img
              src={avatarUrl}
              alt={displayName}
              className="hidden sm:block w-12 h-12 rounded-2xl border-2 border-brand/30 object-cover shrink-0"
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
          data-tour="dash-generate-plan"
          className="flex items-center justify-center gap-2 px-5 py-3 min-h-11 w-full sm:w-auto sm:py-2.5 bg-brand/10 border border-brand/20 rounded-xl text-brand text-xs font-bold uppercase tracking-widest hover:bg-brand/20 transition-all no-underline touch-manipulation shrink-0"
        >
          <Zap className="w-3.5 h-3.5" /> Generate Plan
        </Link>
      </div>

      {/* Level Progress */}
      <motion.div
        data-tour="dash-streak"
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
            <p className="text-text-muted text-[10px] uppercase tracking-widest">Level XP</p>
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" data-tour="dash-quick-actions">
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

      <PrizeSheetCard
        giveawayPoints={currentUser.giveawayPoints}
        xpPoints={currentUser.xpPoints}
      />

      {gymError && (
        <p className="text-amber-400/90 text-xs font-medium px-1" role="status">
          {gymError}
        </p>
      )}

      {/* Today's Stats */}
      <div>
        <h2 className="text-white font-bold text-sm uppercase tracking-widest mb-4">Today&apos;s Progress</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatCard icon={Dumbbell} label="Workouts Completed" value={stats.workouts.value} target={stats.workouts.target} unit={stats.workouts.unit} color="bg-emerald-600" />
          <StatCard icon={Flame} label="Day Streak" value={currentUser.currentStreak} target={Math.max(currentUser.longestStreak, 7) || 7} unit="days" color="bg-brand" />
          <StatCard icon={Zap} label="Total XP" value={currentUser.xpPoints} target={levelInfo.nextLevelXp} unit="xp" color="bg-yellow-600" />
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
            {weeklyCompleted.map((d, i) => (
              <motion.div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                {gymLoading ? (
                  <div className="w-full h-24 rounded-xl bg-white/10 animate-pulse" />
                ) : (
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
                )}
                <span className="text-text-muted text-[10px] font-medium">{d.day}</span>
              </motion.div>
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
            {achievements.length === 0 ? (
              <p className="text-text-muted text-xs">Earn giveaway points to see recent activity here.</p>
            ) : (
              achievements.map((ach, i) => (
                <div key={`${ach.name}-${i}`} className="flex items-start gap-3 group">
                  <span className="text-xl shrink-0">{ach.icon}</span>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-bold truncate">{ach.name}</p>
                    <p className="text-text-muted text-xs truncate">{ach.desc}</p>
                    <p className="text-text-muted text-[10px]">{ach.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <Link
            href="/giveaways"
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
            {todayExercises.length > 0 ? "Start" : "Set Up Plan"} <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
        <motion.div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {gymLoading ? (
            [0, 1, 2].map((n) => (
              <div
                key={n}
                className="h-16 rounded-xl bg-white/10 animate-pulse border border-white/5"
              />
            ))
          ) : todayExercises.length > 0 ? (
            todayExercises.map((ex) => (
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
            ))
          ) : (
            <div className="col-span-full py-6 flex flex-col items-center justify-center text-center bg-white/5 rounded-xl border border-dashed border-white/10">
              <Heart className="w-8 h-8 text-brand/60 mb-2 animate-pulse" />
              <p className="text-white text-sm font-bold">Active Recovery & Rest Day</p>
              <p className="text-text-muted text-xs mt-1">No muscle split scheduled for today. Keep recovering strong!</p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
