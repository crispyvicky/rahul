"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gift, Trophy, Crown, Flame, Users, Instagram, Share2, UserPlus,
  Dumbbell, Target, ChevronRight, Star, Clock, CheckCircle, Copy,
  ExternalLink, Sparkles, Medal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserStore, DEMO_USER } from "@/store/use-user-store";

// Active giveaway
const activeGiveaway = {
  title: "Win an iPhone 16 Pro",
  description: "The most consistent athlete this month wins an iPhone 16 Pro. Track workouts, complete challenges, and rise to the top.",
  prize: "iPhone 16 Pro",
  endsIn: "18 days",
  totalParticipants: 4821,
  prizeImage: "🏆",
};

// How to earn giveaway points
const pointActions = [
  { icon: Instagram, label: "Follow @rahulfitzz on Instagram", points: 200, oneTime: true, completed: false, action: "follow" },
  { icon: Share2, label: "Share platform on Instagram Story", points: 100, oneTime: false, completed: false, action: "share_story" },
  { icon: UserPlus, label: "Refer a friend (per signup)", points: 150, oneTime: false, completed: false, action: "refer" },
  { icon: Flame, label: "Daily login streak", points: 10, oneTime: false, completed: true, action: "streak" },
  { icon: Dumbbell, label: "Log a workout in Gym Mode", points: 25, oneTime: false, completed: false, action: "workout" },
  { icon: Target, label: "Complete a challenge check-in", points: 15, oneTime: false, completed: false, action: "checkin" },
  { icon: Share2, label: "Share transformation post", points: 75, oneTime: false, completed: false, action: "share_post" },
];

// Leaderboard
const giveawayLeaderboard = [
  { rank: 1, name: "Arjun S.", points: 8420, avatar: "A", badge: "👑" },
  { rank: 2, name: "Priya M.", points: 7810, avatar: "P", badge: "🥈" },
  { rank: 3, name: "Vikram R.", points: 7200, avatar: "V", badge: "🥉" },
  { rank: 4, name: "Neha K.", points: 6950, avatar: "N", badge: "" },
  { rank: 5, name: "Rohit D.", points: 6400, avatar: "R", badge: "" },
  { rank: 6, name: "Sneha P.", points: 5800, avatar: "S", badge: "" },
  { rank: 7, name: "Karan M.", points: 5200, avatar: "K", badge: "" },
  { rank: 8, name: "You", points: 2450, avatar: "Y", badge: "", isYou: true },
];

// Past winners
const pastWinners = [
  { name: "Raj Kumar", prize: "Gym Bag + Supplements", month: "April 2026", avatar: "R" },
  { name: "Ananya S.", prize: "1-Month Free Coaching", month: "March 2026", avatar: "A" },
  { name: "Dev Patel", prize: "Wireless Earbuds", month: "February 2026", avatar: "D" },
];

export default function GiveawayPage() {
  const [tab, setTab] = useState<"earn" | "leaderboard" | "winners">("earn");
  const [copied, setCopied] = useState(false);
  const { user } = useUserStore();
  const currentUser = user || DEMO_USER;
  const referralCode = `RF-${currentUser.name.toUpperCase().slice(0, 4)}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const referralLink = `https://rahulfitzz.com/signup?ref=${referralCode}`;

  const myPoints = 2450;
  const myRank = 8;

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInstagramFollow = () => {
    window.open("https://www.instagram.com/rahulfitzz", "_blank");
  };

  const handleShareStory = () => {
    const text = `🔥 I'm competing for an iPhone 16 Pro on RahulFitzz's fitness platform! Join using my link: ${referralLink} #RahulFitzz #FitnessChallenge`;
    if (navigator.share) {
      navigator.share({ title: "RahulFitzz Giveaway", text, url: referralLink });
    } else {
      window.open(`https://www.instagram.com/`, "_blank");
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 pb-20">
      {/* Hero Giveaway Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-br from-yellow-500/10 via-surface-card to-brand/5 border border-yellow-500/20 rounded-2xl p-5 sm:p-8 overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-500/10 blur-[80px] rounded-full" />
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-yellow-500/20 flex items-center justify-center text-3xl">
                {activeGiveaway.prizeImage}
              </div>
              <div>
                <span className="text-yellow-400 text-[10px] font-bold uppercase tracking-[0.4em]">Active Giveaway</span>
                <h1 className="text-white text-xl sm:text-2xl font-black uppercase tracking-tighter font-heading">
                  {activeGiveaway.title}
                </h1>
              </div>
            </div>
          </div>
          <p className="text-text-secondary text-sm leading-relaxed mb-6 max-w-lg">
            {activeGiveaway.description}
          </p>
          <div className="flex flex-wrap gap-4 sm:gap-6">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-brand/10 border border-brand/20 rounded-full">
              <Clock className="w-3.5 h-3.5 text-brand" />
              <span className="text-brand text-xs font-bold">{activeGiveaway.endsIn} left</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full">
              <Users className="w-3.5 h-3.5 text-text-secondary" />
              <span className="text-text-secondary text-xs font-bold">{activeGiveaway.totalParticipants.toLocaleString()} competing</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
              <Trophy className="w-3.5 h-3.5 text-yellow-400" />
              <span className="text-yellow-400 text-xs font-bold">Your Rank: #{myRank}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Your Points Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-surface-card border border-white/5 rounded-2xl p-4 text-center">
          <p className="text-brand text-2xl sm:text-3xl font-black font-heading">{myPoints}</p>
          <p className="text-text-muted text-[10px] uppercase tracking-widest mt-1">Your Points</p>
        </div>
        <div className="bg-surface-card border border-white/5 rounded-2xl p-4 text-center">
          <p className="text-yellow-400 text-2xl sm:text-3xl font-black font-heading">#{myRank}</p>
          <p className="text-text-muted text-[10px] uppercase tracking-widest mt-1">Your Rank</p>
        </div>
        <div className="col-span-2 sm:col-span-1 bg-surface-card border border-white/5 rounded-2xl p-4 text-center">
          <p className="text-emerald-400 text-2xl sm:text-3xl font-black font-heading">5,970</p>
          <p className="text-text-muted text-[10px] uppercase tracking-widest mt-1">Points to #1</p>
        </div>
      </div>

      {/* Referral Link */}
      <div className="bg-surface-card border border-brand/10 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <UserPlus className="w-4 h-4 text-brand" />
          <h3 className="text-white font-bold text-sm uppercase tracking-widest">Your Referral Link</h3>
          <span className="text-brand text-[10px] font-bold bg-brand/10 px-2 py-0.5 rounded-full">+150 pts each</span>
        </div>
        <div className="flex gap-2">
          <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-text-secondary text-xs truncate font-mono">
            {referralLink}
          </div>
          <button
            onClick={copyReferralLink}
            className={cn(
              "px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 shrink-0 transition-all",
              copied
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                : "bg-brand hover:bg-brand-dark text-white"
            )}
          >
            {copied ? <><CheckCircle className="w-4 h-4" /> Copied</> : <><Copy className="w-4 h-4" /> Copy</>}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {[
          { id: "earn" as const, label: "Earn Points", icon: Sparkles },
          { id: "leaderboard" as const, label: "Leaderboard", icon: Trophy },
          { id: "winners" as const, label: "Past Winners", icon: Crown },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all shrink-0",
              tab === t.id
                ? "bg-brand text-white"
                : "bg-white/5 text-text-secondary hover:bg-white/10 border border-white/5"
            )}
          >
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* Earn Points */}
      {tab === "earn" && (
        <div className="space-y-3">
          {pointActions.map((action, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-surface-card border border-white/5 rounded-2xl p-4 flex items-center gap-4 hover:border-white/10 transition-colors"
            >
              <div className={cn(
                "w-11 h-11 rounded-xl flex items-center justify-center shrink-0",
                action.completed ? "bg-emerald-500/10" : "bg-brand/10"
              )}>
                <action.icon className={cn("w-5 h-5", action.completed ? "text-emerald-400" : "text-brand")} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-bold truncate">{action.label}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-brand text-xs font-bold">+{action.points} pts</span>
                  {action.oneTime && <span className="text-text-muted text-[10px]">· one time</span>}
                  {!action.oneTime && <span className="text-text-muted text-[10px]">· per action</span>}
                </div>
              </div>
              {action.completed ? (
                <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 shrink-0">
                  <CheckCircle className="w-3.5 h-3.5" /> Done
                </span>
              ) : (
                <button
                  onClick={() => {
                    if (action.action === "follow") handleInstagramFollow();
                    else if (action.action === "share_story") handleShareStory();
                    else if (action.action === "refer") copyReferralLink();
                  }}
                  className="px-4 py-2 bg-brand/10 border border-brand/20 text-brand font-bold text-[10px] uppercase tracking-widest rounded-lg hover:bg-brand/20 transition-all shrink-0 flex items-center gap-1.5"
                >
                  {action.action === "follow" && <><ExternalLink className="w-3 h-3" /> Follow</>}
                  {action.action === "share_story" && <><Share2 className="w-3 h-3" /> Share</>}
                  {action.action === "refer" && <><Copy className="w-3 h-3" /> Invite</>}
                  {!["follow", "share_story", "refer"].includes(action.action) && <><ChevronRight className="w-3 h-3" /> Go</>}
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Leaderboard */}
      {tab === "leaderboard" && (
        <div className="bg-surface-card border border-white/5 rounded-2xl overflow-hidden">
          <div className="divide-y divide-white/5">
            {giveawayLeaderboard.map((entry, i) => (
              <motion.div
                key={entry.rank}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className={cn("flex items-center gap-4 p-4 sm:px-5", (entry as any).isYou && "bg-brand/5")}
              >
                <span className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0",
                  entry.rank === 1 && "bg-yellow-500/20 text-yellow-400",
                  entry.rank === 2 && "bg-gray-400/20 text-gray-300",
                  entry.rank === 3 && "bg-orange-500/20 text-orange-400",
                  entry.rank > 3 && "bg-white/5 text-text-muted"
                )}>
                  {entry.rank <= 3 ? <Medal className="w-4 h-4" /> : entry.rank}
                </span>
                <div className="w-9 h-9 rounded-xl bg-brand/20 flex items-center justify-center text-brand text-xs font-bold shrink-0">
                  {entry.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-bold truncate", (entry as any).isYou ? "text-brand" : "text-white")}>
                    {entry.name} {entry.badge}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-white font-bold text-sm font-heading">{entry.points.toLocaleString()}</p>
                  <p className="text-text-muted text-[10px] uppercase tracking-widest">pts</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Past Winners */}
      {tab === "winners" && (
        <div className="space-y-3">
          {pastWinners.map((winner, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-surface-card border border-white/5 rounded-2xl p-5 flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-400 text-lg font-bold shrink-0">
                {winner.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm">{winner.name}</p>
                <p className="text-text-muted text-xs">{winner.month}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-yellow-400 text-sm font-bold flex items-center gap-1">
                  <Gift className="w-3.5 h-3.5" /> {winner.prize}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
