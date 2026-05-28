"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Gift, Trophy, Users, Instagram, Share2, UserPlus,
  Dumbbell, Target, Flame, Clock, CheckCircle, Copy,
  Sparkles, Medal, Crown, Loader2, AlertCircle,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { useUserStore } from "@/store/use-user-store";
import { isUuidUserId } from "@/lib/api-guards";
import { compressImageForUpload } from "@/lib/compress-image";
import { mapDbProfileToStore } from "@/lib/user-profile-mapper";
import PrizeSheetCard from "@/components/dashboard/prize-sheet-card";
import { sendEngagementNotification } from "@/lib/engagement-notifications";

const POINT_ACTIONS = [
  { icon: Instagram, label: "Follow @rahulfitzz on Instagram", points: 200, oneTime: true, action: "follow", cta: "Follow & Claim" },
  { icon: Share2, label: "Share platform on Instagram Story", points: 100, oneTime: true, action: "share_story", cta: "Share & Claim" },
  { icon: UserPlus, label: "Refer a friend (per signup)", points: 150, oneTime: false, action: "refer", cta: "Invite" },
  { icon: Flame, label: "Daily login streak", points: 10, oneTime: false, action: "streak", cta: "Auto" },
  { icon: Dumbbell, label: "Complete today’s workout in Gym Mode", points: 25, oneTime: false, action: "workout", cta: "Gym Mode" },
  { icon: Target, label: "Challenge check-in", points: 15, oneTime: false, action: "checkin", cta: "Challenges" },
  { icon: Share2, label: "Post a transformation in Community", points: 75, oneTime: false, action: "share_post", cta: "Community" },
] as const;

type GiveawayData = {
  giveaway: { title: string; description: string; prize: string; ends_at: string } | null;
  leaderboard: { id: string; name: string; avatar_url?: string; giveaway_points: number }[];
  participantCount: number;
  pastGiveaways: { title: string; prize: string; ends_at: string }[];
  completedActions: string[];
  myPoints: number;
  myRank: number | null;
  referralCode: string;
  pointsToFirst: number;
  xpPoints?: number;
  claimStatuses?: Record<string, string>;
};

function daysUntil(iso: string) {
  const diff = new Date(iso).getTime() - Date.now();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Ending soon";
  return `${days} day${days === 1 ? "" : "s"} left`;
}

export default function GiveawayPage() {
  const { data: session } = useSession();
  const { user, syncFromServer, login } = useUserStore();
  const [tab, setTab] = useState<"earn" | "leaderboard" | "winners">("earn");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<GiveawayData | null>(null);
  const [proofFiles, setProofFiles] = useState<Record<string, File>>({});
  const [proofPreviews, setProofPreviews] = useState<Record<string, string>>({});
  const [followClaimDetails, setFollowClaimDetails] = useState({
    instagramUsername: "",
    phone: "",
  });
  const [compressingProof, setCompressingProof] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const syncedOnPage = useRef(false);

  const canEarn = user && isUuidUserId(user.id);
  const referralCode = data?.referralCode || user?.referralCode || "";
  const referralLink =
    typeof window !== "undefined" && referralCode
      ? `${window.location.origin}/signup?ref=${referralCode}`
      : "";

  const userId = user?.id;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const q = userId && isUuidUserId(userId) ? `?userId=${userId}` : "";
      const res = await fetch(`/api/giveaway${q}`);
      if (!res.ok) throw new Error("Could not load giveaway data");
      const json = await res.json();
      setData(json);

      if (userId && isUuidUserId(userId) && json.myPoints != null) {
        const current = useUserStore.getState().user;
        if (current) {
          const patch: Partial<typeof current> = {};
          if (json.myPoints !== current.giveawayPoints) {
            patch.giveawayPoints = json.myPoints;
          }
          if (json.referralCode && json.referralCode !== current.referralCode) {
            patch.referralCode = json.referralCode;
          }
          if (json.xpPoints != null && json.xpPoints !== current.xpPoints) {
            patch.xpPoints = json.xpPoints;
          }
          if (Object.keys(patch).length > 0) {
            useUserStore.getState().syncFromServer(patch);
          }
        }
      }
    } catch {
      setError("Could not load giveaway. Check Supabase connection.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    return () => {
      Object.values(proofPreviews).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [proofPreviews]);

  useEffect(() => {
    if (!session?.user?.email || syncedOnPage.current) return;
    if (user?.id && isUuidUserId(user.id)) return;

    syncedOnPage.current = true;
    (async () => {
      const res = await fetch("/api/auth/sync-profile", { method: "POST" });
      const json = await res.json();
      if (res.ok && json.profile) {
        login(mapDbProfileToStore(json.profile));
        await load();
      } else {
        syncedOnPage.current = false;
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync once when session exists but store has no UUID
  }, [session?.user?.email, user?.id, login]);

  const claim = async (action: string) => {
    if (!canEarn) {
      setError("Sign in with Google to earn and track points.");
      return;
    }
    setClaiming(action);
    setError(null);
    setSuccessMsg(null);
    try {
      if (action === "follow") {
        const instagramUsername = followClaimDetails.instagramUsername.trim().replace(/^@+/, "");
        const phone = followClaimDetails.phone.trim();
        if (!instagramUsername) {
          setError("Enter your Instagram username before submitting the follow claim.");
          setClaiming(null);
          return;
        }
        if (!phone || phone.replace(/\D/g, "").length < 10) {
          setError("Enter a valid phone number (at least 10 digits) before submitting.");
          setClaiming(null);
          return;
        }
      }

      let proofUrl: string | undefined;
      const file = proofFiles[action];
      const needsProof = action === "follow" || action === "share_story";
      if (needsProof) {
        if (!file) {
          setError("Upload a screenshot of your follow or story before claiming points.");
          setClaiming(null);
          return;
        }
        const fd = new FormData();
        fd.append("file", file);
        fd.append("userId", user!.id);
        const up = await fetch("/api/claim-proof/upload", { method: "POST", body: fd });
        const uploadJson = await up.json();
        if (!up.ok || !uploadJson.proofUrl) {
          setError(
            uploadJson.error ||
              "Screenshot upload failed. Run supabase/claim_storage.sql in Supabase, then try again."
          );
          setClaiming(null);
          return;
        }
        proofUrl = uploadJson.proofUrl;
      }

      const res = await fetch("/api/giveaway/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user!.id,
          action,
          proofUrl,
          instagramUsername:
            action === "follow"
              ? followClaimDetails.instagramUsername.trim().replace(/^@+/, "")
              : undefined,
          phone: action === "follow" ? followClaimDetails.phone.trim() : undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Could not claim points");
        return;
      }
      if (!json.pending) {
        syncFromServer({
          giveawayPoints: json.giveawayPoints,
          xpPoints: json.xpPoints,
        });
        setSuccessMsg(`+${json.pointsAwarded ?? ""} points added!`);
        void sendEngagementNotification("points_earned", {
          firstName: (user?.name || "Athlete").split(" ")[0],
          points: json.pointsAwarded ?? 0,
        });
      } else {
        setSuccessMsg(
          json.message ||
            "Submitted for admin review. You will see Pending on this action until approved."
        );
        void sendEngagementNotification("points_pending", {
          firstName: (user?.name || "Athlete").split(" ")[0],
        });
        setProofFiles((prev) => {
          const next = { ...prev };
          delete next[action];
          return next;
        });
        setProofPreviews((prev) => {
          const next = { ...prev };
          const old = next[action];
          if (old) URL.revokeObjectURL(old);
          delete next[action];
          return next;
        });
      }
      await load();
    } catch {
      setError("Claim failed. Try again.");
    } finally {
      setClaiming(null);
    }
  };

  const copyReferralLink = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openIgTask = (action: string) => {
    if (action === "follow") {
      window.open("https://www.instagram.com/rahulfitzz", "_blank", "noopener,noreferrer");
      return;
    }
    if (action === "share_story") {
      const text = `I'm competing on RahulFitzz! Join: ${referralLink}`;
      if (navigator.share) {
        void navigator.share({ title: "RahulFitzz", text, url: referralLink });
      } else {
        window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
      }
    }
  };

  const handleAction = async (action: string) => {
    if (action === "follow" || action === "share_story") {
      if (!proofFiles[action]) {
        setError("Upload your screenshot first, then tap Submit for review.");
        openIgTask(action);
        return;
      }
      await claim(action);
      return;
    }
    if (action === "refer") {
      copyReferralLink();
      return;
    }
    if (action === "checkin") {
      await claim("checkin");
    }
  };

  const claimStatus = (action: string) => data?.claimStatuses?.[action];

  const isCompleted = (action: string) => {
    const st = claimStatus(action);
    if (st === "pending") return false;
    if (st === "approved" || st === "denied") return st === "approved";
    return data?.completedActions?.includes(action) ?? false;
  };

  const isPending = (action: string) => claimStatus(action) === "pending";

  const myPoints = data?.myPoints ?? user?.giveawayPoints ?? 0;
  const myRank = data?.myRank ?? "—";
  const pointsToFirst = data?.pointsToFirst ?? 0;
  const giveaway = data?.giveaway;

  if (loading && !data) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-8 h-8 text-brand animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 pb-20">
      {!canEarn && (
        <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-200 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          Sign in with Google to earn points, appear on the leaderboard, and save your rank.
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 p-4 bg-brand/10 border border-brand/30 rounded-xl text-brand text-sm" role="alert">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {successMsg && (
        <div className="flex items-start gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-sm" role="status">
          <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>{successMsg}</p>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-br from-yellow-500/10 via-surface-card to-brand/5 border border-yellow-500/20 rounded-2xl p-5 sm:p-8 overflow-hidden"
      >
        <div className="relative z-10">
          <span className="text-yellow-400 text-[10px] font-bold uppercase tracking-[0.4em]">Active Giveaway</span>
          <h1 className="text-white text-xl sm:text-2xl font-black uppercase tracking-tighter font-heading mt-2">
            {giveaway?.title || "No active giveaway"}
          </h1>
          <p className="text-text-secondary text-sm leading-relaxed mb-6 max-w-lg mt-3">
            {giveaway?.description || "Run supabase/migration.sql to seed the active giveaway."}
          </p>
          <div className="flex flex-wrap gap-3">
            {giveaway?.ends_at && (
              <span className="flex items-center gap-2 px-3 py-1.5 bg-brand/10 border border-brand/20 rounded-full text-brand text-xs font-bold">
                <Clock className="w-3.5 h-3.5" /> {daysUntil(giveaway.ends_at)}
              </span>
            )}
            <span className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-text-secondary text-xs font-bold">
              <Users className="w-3.5 h-3.5" /> {(data?.participantCount ?? 0).toLocaleString()} competing
            </span>
            {myRank !== "—" && (
              <span className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-yellow-400 text-xs font-bold">
                <Trophy className="w-3.5 h-3.5" /> Your Rank: #{myRank}
              </span>
            )}
          </div>
        </div>
        </motion.div>

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
          <p className="text-emerald-400 text-2xl sm:text-3xl font-black font-heading">{pointsToFirst.toLocaleString()}</p>
          <p className="text-text-muted text-[10px] uppercase tracking-widest mt-1">Points to #1</p>
        </div>
      </div>

      <PrizeSheetCard
        giveawayPoints={myPoints}
        xpPoints={data?.xpPoints ?? user?.xpPoints ?? 0}
        userId={user?.id}
      />

      <div className="bg-surface-card border border-brand/10 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <UserPlus className="w-4 h-4 text-brand" />
          <h3 className="text-white font-bold text-sm uppercase tracking-widest">Your Referral Link</h3>
          <span className="text-brand text-[10px] font-bold bg-brand/10 px-2 py-0.5 rounded-full">+150 pts each signup</span>
        </div>
        <div className="flex gap-2">
          <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-text-secondary text-xs truncate font-mono">
            {referralLink || "Sign in to generate your link"}
          </div>
          <button
            type="button"
            onClick={copyReferralLink}
            disabled={!referralLink}
            className={cn(
              "px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 shrink-0 transition-all disabled:opacity-40",
              copied ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20" : "bg-brand hover:bg-brand-dark text-white"
            )}
          >
            {copied ? <><CheckCircle className="w-4 h-4" /> Copied</> : <><Copy className="w-4 h-4" /> Copy</>}
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { id: "earn" as const, label: "Earn Points", icon: Sparkles },
          { id: "leaderboard" as const, label: "Leaderboard", icon: Trophy },
          { id: "winners" as const, label: "Past Campaigns", icon: Crown },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest whitespace-nowrap shrink-0",
              tab === t.id ? "bg-brand text-white" : "bg-white/5 text-text-secondary border border-white/5"
            )}
          >
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === "earn" && (
        <div className="space-y-3">
          {POINT_ACTIONS.map((action, i) => {
            const done = isCompleted(action.action);
            const pending = isPending(action.action);
            const autoDone = ["streak", "workout"].includes(action.action) && done;
            return (
              <motion.div
                key={action.action}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-surface-card border border-white/5 rounded-2xl p-4 flex items-center gap-4"
              >
                <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0", done ? "bg-emerald-500/10" : "bg-brand/10")}>
                  <action.icon className={cn("w-5 h-5", done ? "text-emerald-400" : "text-brand")} />
                </div>
                <motion.div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-bold truncate">{action.label}</p>
                  <p className="text-brand text-xs font-bold mt-0.5">+{action.points} pts {action.oneTime ? "· one time" : "· repeatable"}</p>
                  {(action.action === "follow" || action.action === "share_story") && !done && !pending && (
                    <div className="mt-2 space-y-2">
                      <p className="text-[10px] text-text-muted leading-relaxed">
                        1) Open Instagram · 2) Upload screenshot · 3) Submit for admin review
                      </p>
                      {action.action === "follow" && (
                        <div className="grid gap-2 sm:grid-cols-2">
                          <label className="block text-[10px] text-text-muted">
                            <span className="font-bold uppercase tracking-wider text-text-secondary">
                              Instagram username
                            </span>
                            <input
                              type="text"
                              inputMode="text"
                              autoComplete="off"
                              placeholder="@yourusername"
                              value={followClaimDetails.instagramUsername}
                              onChange={(e) =>
                                setFollowClaimDetails((prev) => ({
                                  ...prev,
                                  instagramUsername: e.target.value,
                                }))
                              }
                              className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-xs text-white placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-brand"
                            />
                          </label>
                          <label className="block text-[10px] text-text-muted">
                            <span className="font-bold uppercase tracking-wider text-text-secondary">
                              Phone number
                            </span>
                            <input
                              type="tel"
                              inputMode="tel"
                              autoComplete="tel"
                              placeholder="9876543210"
                              value={followClaimDetails.phone}
                              onChange={(e) =>
                                setFollowClaimDetails((prev) => ({
                                  ...prev,
                                  phone: e.target.value,
                                }))
                              }
                              className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-xs text-white placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-brand"
                            />
                          </label>
                        </div>
                      )}
                      <label className="block text-[10px] text-text-muted">
                        <span className="font-bold uppercase tracking-wider text-text-secondary">
                          Screenshot required (auto-resized)
                        </span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          disabled={compressingProof === action.action}
                          className="mt-1 block w-full text-xs text-text-muted file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-brand/20 file:text-brand disabled:opacity-50"
                          onChange={async (e) => {
                            const f = e.target.files?.[0];
                            if (!f) return;
                            setCompressingProof(action.action);
                            try {
                              const compressed = await compressImageForUpload(f);
                              setProofFiles((prev) => ({ ...prev, [action.action]: compressed }));
                              setProofPreviews((prev) => {
                                const old = prev[action.action];
                                if (old) URL.revokeObjectURL(old);
                                return {
                                  ...prev,
                                  [action.action]: URL.createObjectURL(compressed),
                                };
                              });
                              setError(null);
                            } catch (err) {
                              setError(err instanceof Error ? err.message : "Invalid image");
                            } finally {
                              setCompressingProof(null);
                              e.target.value = "";
                            }
                          }}
                        />
                      </label>
                      {proofPreviews[action.action] && (
                        <div className="flex items-center gap-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={proofPreviews[action.action]}
                            alt="Your screenshot preview"
                            className="h-14 w-14 rounded-lg object-cover border border-white/10"
                          />
                          <span className="text-emerald-400 text-[10px] font-bold uppercase">
                            Ready to submit
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
                {pending ? (
                  <span className="text-yellow-400 text-[10px] font-bold uppercase flex items-center gap-1 shrink-0">
                    Pending review
                  </span>
                ) : autoDone || (action.oneTime && done) ? (
                  <span className="text-emerald-400 text-[10px] font-bold uppercase flex items-center gap-1 shrink-0">
                    <CheckCircle className="w-3.5 h-3.5" /> Done
                  </span>
                ) : action.action === "workout" ? (
                  <Link href="/gym-mode" className="px-4 py-2 bg-brand/10 border border-brand/20 text-brand font-bold text-[10px] uppercase rounded-lg shrink-0 no-underline">
                    Gym Mode
                  </Link>
                ) : action.action === "share_post" ? (
                  <Link href="/community" className="px-4 py-2 bg-brand/10 border border-brand/20 text-brand font-bold text-[10px] uppercase rounded-lg shrink-0 no-underline">
                    Community
                  </Link>
                ) : action.action === "streak" ? (
                  <span className="text-text-muted text-[10px] font-bold uppercase shrink-0">On login</span>
                ) : action.action === "follow" || action.action === "share_story" ? (
                  <div className="flex flex-col gap-1.5 shrink-0">
                    <button
                      type="button"
                      disabled={!canEarn}
                      onClick={() => openIgTask(action.action)}
                      className="px-3 py-2 bg-white/5 border border-white/10 text-text-secondary font-bold text-[10px] uppercase rounded-lg"
                    >
                      Open IG
                    </button>
                    <button
                      type="button"
                      disabled={
                        !!claiming ||
                        !canEarn ||
                        !proofFiles[action.action] ||
                        (action.action === "follow" &&
                          (!followClaimDetails.instagramUsername.trim() ||
                            followClaimDetails.phone.trim().replace(/\D/g, "").length < 10))
                      }
                      onClick={() => handleAction(action.action)}
                      className="px-4 py-2 bg-brand/10 border border-brand/20 text-brand font-bold text-[10px] uppercase rounded-lg flex items-center gap-1 disabled:opacity-50"
                    >
                      {claiming === action.action ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        "Submit"
                      )}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={!!claiming || !canEarn}
                    onClick={() => handleAction(action.action)}
                    className="px-4 py-2 bg-brand/10 border border-brand/20 text-brand font-bold text-[10px] uppercase rounded-lg shrink-0 flex items-center gap-1 disabled:opacity-50"
                  >
                    {claiming === action.action ? <Loader2 className="w-3 h-3 animate-spin" /> : action.cta}
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {tab === "leaderboard" && (
        <div className="bg-surface-card border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
          {(data?.leaderboard?.length ?? 0) === 0 ? (
            <p className="p-8 text-center text-text-muted text-sm">No scores yet. Be the first to earn points!</p>
          ) : (
            data!.leaderboard.map((entry, i) => {
              const rank = i + 1;
              const isYou = user?.id === entry.id;
              return (
                <div key={entry.id} className={cn("flex items-center gap-4 p-4 sm:px-5", isYou && "bg-brand/5")}>
                  <span className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0",
                    rank === 1 && "bg-yellow-500/20 text-yellow-400",
                    rank === 2 && "bg-gray-400/20 text-gray-300",
                    rank === 3 && "bg-orange-500/20 text-orange-400",
                    rank > 3 && "bg-white/5 text-text-muted"
                  )}>
                    {rank <= 3 ? <Medal className="w-4 h-4" /> : rank}
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-brand/20 flex items-center justify-center text-brand text-xs font-bold shrink-0 overflow-hidden">
                    {entry.avatar_url ? (
                      <img src={entry.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      getInitials(entry.name)
                    )}
                  </div>
                  <p className={cn("flex-1 text-sm font-bold truncate", isYou ? "text-brand" : "text-white")}>
                    {entry.name} {isYou && "(You)"}
                  </p>
                  <p className="text-white font-bold text-sm font-heading shrink-0">{entry.giveaway_points.toLocaleString()}</p>
                </div>
              );
            })
          )}
        </div>
      )}

      {tab === "winners" && (
        <div className="space-y-3">
          {(data?.pastGiveaways?.length ?? 0) === 0 ? (
            <p className="text-text-muted text-sm text-center py-8">Past campaigns will appear here when a giveaway ends.</p>
          ) : (
            data!.pastGiveaways.map((g, i) => (
              <div key={i} className="bg-surface-card border border-white/5 rounded-2xl p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                  <Gift className="w-6 h-6 text-yellow-400" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-bold text-sm">{g.title}</p>
                  <p className="text-text-muted text-xs">Ended {new Date(g.ends_at).toLocaleDateString()}</p>
                </div>
                <p className="text-yellow-400 text-sm font-bold">{g.prize}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

