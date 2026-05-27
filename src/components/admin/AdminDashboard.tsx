"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import AdminShell from "./AdminShell";
import { cn } from "@/lib/utils";
import { DEFAULT_GRAND_PRIZE } from "@/lib/prize-sheet";
import { ENGAGEMENT_KIND_OPTIONS } from "@/lib/engagement-notifications";
import {
  Loader2,
  RefreshCw,
  Check,
  X,
  Trash2,
  Search,
} from "lucide-react";

type Tab =
  | "overview"
  | "leaderboard"
  | "users"
  | "logs"
  | "claims"
  | "community"
  | "giveaways"
  | "prebookings"
  | "notifications";

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [giveaways, setGiveaways] = useState<any[]>([]);
  const [winners, setWinners] = useState<any[]>([]);
  const [prebookings, setPrebookings] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [campaignKind, setCampaignKind] = useState<string>("giveaway_live");
  const [campaignTitle, setCampaignTitle] = useState("");
  const [campaignBody, setCampaignBody] = useState("");
  const [campaignAudience, setCampaignAudience] = useState("all");
  const [campaignExpiresHours, setCampaignExpiresHours] = useState("72");
  const [sendingCampaign, setSendingCampaign] = useState(false);
  const [campaignError, setCampaignError] = useState<string | null>(null);
  const [updatingCampaignId, setUpdatingCampaignId] = useState<string | null>(null);
  const [pushReadiness, setPushReadiness] = useState<any>(null);
  const [testingPush, setTestingPush] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [logFilter, setLogFilter] = useState("");
  const [winnerUserId, setWinnerUserId] = useState("");
  const [winnerPrize, setWinnerPrize] = useState(DEFAULT_GRAND_PRIZE);
  const [claimsShowAll, setClaimsShowAll] = useState(false);
  const claimsFilterRef = useRef(claimsShowAll);
  claimsFilterRef.current = claimsShowAll;
  const [pointDelta, setPointDelta] = useState("");
  const [pointReason, setPointReason] = useState("Admin adjustment");
  const [adjustingPoints, setAdjustingPoints] = useState(false);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [claimActionError, setClaimActionError] = useState<string | null>(null);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [communityError, setCommunityError] = useState<string | null>(null);

  const fetchJson = async (url: string, opts?: RequestInit) => {
    const res = await fetch(url, opts);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Request failed");
    return json;
  };

  const loadOverview = useCallback(async () => {
    const s = await fetchJson("/api/admin/stats");
    setStats(s);
    try {
      const l = await fetchJson("/api/admin/point-logs");
      setLogs((l.logs || []).slice(0, 15));
    } catch {
      setLogs([]);
    }
    try {
      const c = await fetchJson("/api/admin/claims");
      setClaims(c.claims || []);
    } catch {
      setClaims([]);
    }
  }, []);

  const loadLeaderboard = useCallback(async () => {
    const d = await fetchJson("/api/admin/leaderboard?limit=100");
    setLeaderboard(d.leaderboard || []);
  }, []);

  const loadUsers = useCallback(async () => {
    const q = userSearch ? `?search=${encodeURIComponent(userSearch)}` : "";
    const d = await fetchJson(`/api/admin/users${q}`);
    setUsers(d.users || []);
  }, [userSearch]);

  const loadLogs = useCallback(async () => {
    const q = logFilter ? `?action=${logFilter}` : "";
    const d = await fetchJson(`/api/admin/point-logs${q}`);
    setLogs(d.logs || []);
  }, [logFilter]);

  const loadClaims = useCallback(async () => {
    const q = claimsFilterRef.current ? "?all=1" : "";
    const d = await fetchJson(`/api/admin/claims${q}`);
    setClaims(d.claims || []);
  }, []);

  const loadCommunity = useCallback(async () => {
    const d = await fetchJson("/api/admin/community");
    setPosts(d.posts || []);
  }, []);

  const loadGiveaways = useCallback(async () => {
    const d = await fetchJson("/api/admin/giveaways");
    setGiveaways(d.giveaways || []);
    setWinners(d.winners || []);
  }, []);

  const loadPrebookings = useCallback(async () => {
    const d = await fetchJson("/api/admin/prebookings");
    setPrebookings(d.prebookings || []);
  }, []);

  const loadCampaigns = useCallback(async () => {
    const d = await fetchJson("/api/admin/campaigns");
    setCampaigns(d.campaigns || []);
  }, []);

  const loadPushReadiness = useCallback(async (audience: string) => {
    try {
      const d = await fetchJson(
        `/api/admin/campaigns/push-readiness?audience=${encodeURIComponent(audience)}`
      );
      setPushReadiness(d.stats || null);
    } catch {
      setPushReadiness(null);
    }
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (tab === "overview") await loadOverview();
      else if (tab === "leaderboard") await loadLeaderboard();
      else if (tab === "users") await loadUsers();
      else if (tab === "logs") await loadLogs();
      else if (tab === "claims") await loadClaims();
      else if (tab === "community") await loadCommunity();
      else if (tab === "giveaways") {
        await loadGiveaways();
        if (leaderboard.length === 0) await loadLeaderboard();
      }
      else if (tab === "prebookings") await loadPrebookings();
      else if (tab === "notifications") {
        await loadCampaigns();
        await loadPushReadiness(campaignAudience);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [
    tab,
    loadOverview,
    loadLeaderboard,
    loadUsers,
    loadLogs,
    loadClaims,
    loadCommunity,
    loadGiveaways,
    loadPrebookings,
    loadCampaigns,
    loadPushReadiness,
    campaignAudience,
  ]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (tab === "notifications" && !campaignTitle && !campaignBody) {
      applyKindTemplate(campaignKind);
    }
  }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (tab !== "notifications") return;
    void loadPushReadiness(campaignAudience);
  }, [tab, campaignAudience, loadPushReadiness]);

  const reloadClaimsForFilter = async (showAll: boolean) => {
    claimsFilterRef.current = showAll;
    setClaimsShowAll(showAll);
    if (tab === "claims") {
      setLoading(true);
      try {
        await loadClaims();
      } catch (e) {
        setClaimActionError(e instanceof Error ? e.message : "Failed to load claims");
      } finally {
        setLoading(false);
      }
    }
  };

  const reviewClaim = async (id: string, action: "approve" | "deny") => {
    setReviewingId(id);
    setClaimActionError(null);
    try {
      await fetchJson(`/api/admin/claims/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      await loadClaims();
      if (tab === "overview") await loadOverview();
    } catch (e) {
      setClaimActionError(e instanceof Error ? e.message : "Action failed");
      await loadClaims();
    } finally {
      setReviewingId(null);
    }
  };

  const openUser = async (id: string) => {
    const d = await fetchJson(`/api/admin/users/${id}`);
    setSelectedUser(d);
  };

  const deletePost = async (id: string) => {
    if (!confirm("Delete this post permanently? Likes are removed too.")) return;
    setDeletingPostId(id);
    setCommunityError(null);
    try {
      await fetchJson(`/api/admin/community/${id}`, { method: "DELETE" });
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      setCommunityError(e instanceof Error ? e.message : "Could not delete post");
    } finally {
      setDeletingPostId(null);
    }
  };

  const toggleFeatured = async (id: string, featured: boolean) => {
    setCommunityError(null);
    try {
      await fetchJson(`/api/admin/community/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_featured: featured }),
      });
      setPosts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, is_featured: featured } : p))
      );
    } catch (e) {
      setCommunityError(e instanceof Error ? e.message : "Could not update post");
    }
  };

  const endCampaign = async (giveawayId: string) => {
    if (!confirm("End this giveaway?")) return;
    await fetchJson("/api/admin/giveaways", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ giveawayId, action: "end" }),
    });
    await loadGiveaways();
  };

  const markWinner = async () => {
    const active = giveaways.find((g) => g.is_active);
    if (!active || !winnerUserId) return;
    await fetchJson("/api/admin/giveaways/winner", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        giveawayId: active.id,
        userId: winnerUserId,
        prize: winnerPrize,
      }),
    });
    await loadGiveaways();
    alert("Winner recorded.");
  };

  const applyKindTemplate = (kind: string) => {
    setCampaignKind(kind);
    const option = ENGAGEMENT_KIND_OPTIONS.find((o) => o.value === kind);
    if (option) {
      setCampaignTitle(option.sampleTitle);
      setCampaignBody(option.sampleBody);
    }
  };

  const sendCampaign = async () => {
    setSendingCampaign(true);
    setCampaignError(null);
    try {
      const response = await fetchJson("/api/admin/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: campaignKind,
          title: campaignTitle,
          body: campaignBody,
          audience: campaignAudience,
          expiresInHours: Number(campaignExpiresHours) || 72,
        }),
      });
      setCampaignTitle("");
      setCampaignBody("");
      await loadCampaigns();
      await loadPushReadiness(campaignAudience);
      const push = response.push;
      if (push?.error) {
        alert(`Campaign saved, but push blast was skipped: ${push.error}`);
      } else {
        const delivered = push?.delivered ?? 0;
        const total = push?.totalSubscriptions ?? 0;
        const failed = push?.failed ?? 0;
        alert(
          `Campaign sent.\nPush: ${delivered} delivered, ${failed} failed (${total} devices).\n\nIf you don't see it: check Windows/Mac notification center, use Chrome (not incognito), and on localhost set ENABLE_PWA_DEV=true then restart dev server.`
        );
      }
    } catch (e) {
      setCampaignError(e instanceof Error ? e.message : "Could not send campaign");
    } finally {
      setSendingCampaign(false);
    }
  };

  const updateCampaignStatus = async (campaignId: string, status: "active" | "paused" | "ended") => {
    setUpdatingCampaignId(campaignId);
    setCampaignError(null);
    try {
      await fetchJson("/api/admin/campaigns", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId, status }),
      });
      await loadCampaigns();
    } catch (e) {
      setCampaignError(e instanceof Error ? e.message : "Could not update campaign");
    } finally {
      setUpdatingCampaignId(null);
    }
  };

  const sendTestPush = async () => {
    setTestingPush(true);
    setCampaignError(null);
    try {
      const res = await fetchJson("/api/admin/campaigns/test-push", { method: "POST" });
      if (!res.success) {
        alert(res.error || res.hint || "Test push failed");
      } else {
        alert(
          `Test push sent to ${res.delivered}/${res.total} of your device(s).\n\n${res.hint || "Check notification center."}`
        );
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : "Test push failed");
    } finally {
      setTestingPush(false);
    }
  };

  const audienceLabels: Record<string, string> = {
    all: "All users",
    active_7d: "Active in last 7 days",
    top_20: "Top 20 leaderboard",
    streak_users: "Users with active streak",
    zero_points: "Users with 0 giveaway points",
  };

  const pendingCount = claims.filter((c) => c.status === "pending").length;

  const exportLeaderboardCsv = () => {
    const headers = ["Rank", "Name", "Email", "Giveaway Points", "Streak", "XP"];
    const rows = leaderboard.map((u, i) => [
      i + 1,
      u.name,
      u.email,
      u.giveaway_points,
      u.current_streak,
      u.xp_points,
    ]);
    const escape = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
    const csv = [headers, ...rows].map((r) => r.map(escape).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rahulfitzz-leaderboard-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const adjustPoints = async () => {
    if (!selectedUser?.profile?.id) return;
    const delta = Number(pointDelta);
    if (!delta || Number.isNaN(delta)) {
      alert("Enter a non-zero number (positive or negative).");
      return;
    }
    setAdjustingPoints(true);
    try {
      await fetchJson("/api/admin/points", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.profile.id,
          delta,
          reason: pointReason || "Admin adjustment",
        }),
      });
      await openUser(selectedUser.profile.id);
      setPointDelta("");
      alert("Points updated.");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed");
    } finally {
      setAdjustingPoints(false);
    }
  };

  return (
    <AdminShell active={tab} onNav={(id) => setTab(id as Tab)} pendingClaims={pendingCount}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-white text-2xl font-black uppercase tracking-tighter font-heading">
          {tab.replace("-", " ")}
        </h1>
        <button
          type="button"
          onClick={refresh}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-text-secondary text-xs font-bold uppercase hover:text-white"
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} /> Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-brand/10 border border-brand/30 rounded-xl text-brand text-sm">
          {error}
          {error.includes("SERVICE_ROLE") && (
            <p className="mt-2 text-text-muted text-xs">
              Add SUPABASE_SERVICE_ROLE_KEY to .env.local and run supabase/admin_panel.sql
            </p>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 text-brand animate-spin" />
        </div>
      ) : (
        <>
          {tab === "overview" && stats && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {[
                  { label: "Total users", value: stats.userCount },
                  { label: "Pending claims", value: stats.pendingClaims },
                  { label: "Community posts", value: stats.communityPosts ?? 0 },
                  { label: "Points today", value: stats.pointsIssuedToday },
                  {
                    label: "Active campaign",
                    value: stats.activeGiveaway?.title?.slice(0, 20) || "None",
                  },
                ].map((c) => (
                  <div
                    key={c.label}
                    className="bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-2xl p-5"
                  >
                    <p className="text-text-muted text-[10px] uppercase tracking-widest">{c.label}</p>
                    <p className="text-white text-2xl font-black font-heading mt-2 truncate">{c.value}</p>
                  </div>
                ))}
              </div>
              {pendingCount > 0 && (
                <button
                  type="button"
                  onClick={() => setTab("claims")}
                  className="w-full p-4 bg-brand/10 border border-brand/30 rounded-xl text-brand font-bold text-sm text-left"
                >
                  {pendingCount} claim(s) awaiting review →
                </button>
              )}
            </div>
          )}

          {tab === "leaderboard" && (
            <div className="space-y-4">
              <button
                type="button"
                onClick={exportLeaderboardCsv}
                disabled={leaderboard.length === 0}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold uppercase text-text-secondary hover:text-white disabled:opacity-40"
              >
                Export CSV
              </button>
            <Table
              headers={["#", "Name", "Email", "Points", "Streak", "XP"]}
              rows={leaderboard.map((u, i) => [
                i + 1,
                u.name,
                u.email,
                u.giveaway_points,
                u.current_streak,
                u.xp_points,
              ])}
            />
            </div>
          )}

          {tab === "users" && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && loadUsers()}
                    placeholder="Search name or email"
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={loadUsers}
                  className="px-4 py-3 bg-brand text-white text-xs font-bold uppercase rounded-xl"
                >
                  Search
                </button>
              </div>
              <Table
                headers={["Name", "Email", "Points", "IG", ""]}
                rows={users.map((u) => [
                  u.name,
                  u.email,
                  u.giveaway_points,
                  u.instagram_handle || "—",
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => openUser(u.id)}
                    className="text-brand text-xs font-bold uppercase"
                  >
                    View
                  </button>,
                ])}
              />
            </div>
          )}

          {tab === "logs" && (
            <div className="space-y-4">
              <select
                value={logFilter}
                onChange={(e) => setLogFilter(e.target.value)}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
              >
                <option value="">All actions</option>
                {["follow", "share_story", "workout", "streak", "checkin", "share_post", "admin_bonus"].map(
                  (a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  )
                )}
              </select>
              <button
                type="button"
                onClick={loadLogs}
                className="ml-2 px-4 py-2 bg-brand/20 text-brand text-xs font-bold uppercase rounded-lg"
              >
                Filter
              </button>
              <Table
                headers={["When", "User", "Action", "Pts", "Description"]}
                rows={logs.map((l) => [
                  new Date(l.created_at).toLocaleString(),
                  l.user_profiles?.name || l.user_id?.slice(0, 8),
                  l.action,
                  l.points,
                  l.description || "",
                ])}
              />
            </div>
          )}

          {tab === "claims" && (
            <div className="space-y-4">
              {claimActionError && (
                <p className="text-brand text-sm p-3 bg-brand/10 border border-brand/30 rounded-xl">
                  {claimActionError}
                </p>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => void reloadClaimsForFilter(false)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-bold uppercase border",
                    !claimsShowAll
                      ? "bg-brand text-white border-brand"
                      : "bg-white/5 text-text-secondary border-white/10"
                  )}
                >
                  Pending
                </button>
                <button
                  type="button"
                  onClick={() => void reloadClaimsForFilter(true)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-bold uppercase border",
                    claimsShowAll
                      ? "bg-brand text-white border-brand"
                      : "bg-white/5 text-text-secondary border-white/10"
                  )}
                >
                  All claims
                </button>
              </div>
              <p className="text-text-muted text-xs leading-relaxed">
                Instagram follow (+200) and story (+100) claims need a screenshot. Referrals (+150) are
                automatic when a friend signs up with your link — no screenshot in this list.
              </p>
              {claims.length === 0 ? (
                <p className="text-text-muted text-sm">No claims to show.</p>
              ) : (
                claims.map((c) => (
                  <div
                    key={c.id}
                    className="bg-surface-card border border-white/10 rounded-2xl p-5 flex flex-wrap items-center gap-4"
                  >
                    <div className="flex-1 min-w-[200px]">
                      <p className="text-white font-bold">{c.user_profiles?.name}</p>
                      <p className="text-text-muted text-xs">{c.user_profiles?.email}</p>
                      <p className="text-brand text-sm font-bold mt-1">
                        {c.action} · +{c.points} pts ·{" "}
                        <span
                          className={cn(
                            c.status === "pending" && "text-yellow-400",
                            c.status === "approved" && "text-emerald-400",
                            c.status === "denied" && "text-red-400"
                          )}
                        >
                          {c.status}
                        </span>
                      </p>
                      {c.user_profiles?.instagram_handle && (
                        <p className="text-text-muted text-xs mt-1">
                          IG: {c.user_profiles.instagram_handle}
                        </p>
                      )}
                      {c.instagram_username && (
                        <p className="text-text-muted text-xs mt-1">
                          Claim IG username: @{String(c.instagram_username).replace(/^@+/, "")}
                        </p>
                      )}
                      {c.phone && (
                        <p className="text-text-muted text-xs mt-1">Claim phone: {c.phone}</p>
                      )}
                      {c.proof_display_url || c.proof_url ? (
                        <div className="mt-3 space-y-2">
                          <a
                            href={c.proof_display_url || c.proof_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block rounded-xl overflow-hidden border border-white/10 bg-black/40 max-w-[280px]"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={c.proof_display_url || c.proof_url}
                              alt={`Proof for ${c.action}`}
                              className="w-full max-h-48 object-contain bg-black"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                              }}
                            />
                          </a>
                          <a
                            href={c.proof_display_url || c.proof_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand text-xs font-bold inline-block"
                          >
                            Open full screenshot →
                          </a>
                        </div>
                      ) : c.status === "pending" &&
                        (c.action === "follow" || c.action === "share_story") ? (
                        <p className="text-yellow-400/90 text-xs mt-2 font-medium">
                          No screenshot attached — ask user to re-submit with proof, or deny.
                        </p>
                      ) : null}
                    </div>
                    {c.status === "pending" && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={
                            reviewingId === c.id ||
                            ((c.action === "follow" || c.action === "share_story") &&
                              !(c.proof_display_url || c.proof_url))
                          }
                          title={
                            (c.action === "follow" || c.action === "share_story") &&
                            !(c.proof_display_url || c.proof_url)
                              ? "Screenshot required before approval"
                              : undefined
                          }
                          onClick={() => reviewClaim(c.id, "approve")}
                          className="flex items-center gap-1 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold disabled:opacity-50"
                        >
                          {reviewingId === c.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}{" "}
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={reviewingId === c.id}
                          onClick={() => reviewClaim(c.id, "deny")}
                          className="flex items-center gap-1 px-4 py-2 bg-red-500/20 text-red-400 rounded-xl text-xs font-bold disabled:opacity-50"
                        >
                          <X className="w-4 h-4" /> Deny
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {tab === "community" && (
            <div className="space-y-4">
              <p className="text-text-secondary text-sm">
                Moderate posts — delete spam or inappropriate content. Likes are cleaned up automatically.
              </p>
              {communityError && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm">
                  {communityError}
                </div>
              )}
              {posts.length === 0 ? (
                <div className="py-16 text-center border border-white/10 rounded-2xl text-text-muted text-sm">
                  No community posts yet.
                </div>
              ) : (
                posts.map((p) => (
                  <div
                    key={p.id}
                    className="bg-surface-card border border-white/10 rounded-2xl p-5"
                  >
                    <div className="flex flex-wrap justify-between gap-3 mb-2">
                      <div className="min-w-0">
                        <p className="text-white font-bold text-sm">
                          {p.user_profiles?.name || "Unknown"} · {p.post_type}
                          {p.is_featured && (
                            <span className="ml-2 text-yellow-400 text-[10px] uppercase">Featured</span>
                          )}
                        </p>
                        <p className="text-text-muted text-xs truncate">{p.user_profiles?.email}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => toggleFeatured(p.id, !p.is_featured)}
                          className="px-3 py-2 min-h-10 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-xl text-[10px] font-bold uppercase"
                        >
                          {p.is_featured ? "Unfeature" : "Feature"}
                        </button>
                        <button
                          type="button"
                          disabled={deletingPostId === p.id}
                          onClick={() => deletePost(p.id)}
                          className="min-h-10 min-w-10 flex items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 disabled:opacity-50"
                          aria-label="Delete post"
                        >
                          {deletingPostId === p.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <p className="text-text-secondary text-sm whitespace-pre-wrap break-words">
                      {p.content}
                    </p>
                    <p className="text-text-muted text-xs mt-2">
                      {new Date(p.created_at).toLocaleString()} · {p.likes_count ?? 0} likes
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === "giveaways" && (
            <div className="space-y-6">
              {giveaways.map((g) => (
                <div
                  key={g.id}
                  className="bg-surface-card border border-white/10 rounded-2xl p-5"
                >
                  <p className="text-white font-bold">{g.title}</p>
                  <p className="text-text-muted text-xs mt-1">
                    {g.prize} · {g.is_active ? "ACTIVE" : "Ended"} · ends{" "}
                    {new Date(g.ends_at).toLocaleDateString()}
                  </p>
                  {g.is_active && (
                    <button
                      type="button"
                      onClick={() => endCampaign(g.id)}
                      className="mt-3 px-4 py-2 bg-white/5 border border-white/10 text-xs font-bold uppercase rounded-lg text-text-secondary hover:text-white"
                    >
                      End campaign
                    </button>
                  )}
                </div>
              ))}
              <div className="bg-gradient-to-r from-yellow-500/10 to-brand/10 border border-yellow-500/20 rounded-2xl p-5 space-y-3">
                <p className="text-white font-bold text-sm uppercase tracking-widest">
                  Mark winner
                </p>
                <select
                  value={winnerUserId}
                  onChange={(e) => setWinnerUserId(e.target.value)}
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white text-sm"
                >
                  <option value="">Select user (top leaderboard)</option>
                  {leaderboard.length === 0 &&
                    users.slice(0, 20).map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} — {u.giveaway_points} pts
                      </option>
                    ))}
                  {leaderboard.slice(0, 20).map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} — {u.giveaway_points} pts
                    </option>
                  ))}
                </select>
                <input
                  value={winnerPrize}
                  onChange={(e) => setWinnerPrize(e.target.value)}
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white text-sm"
                  placeholder="Prize"
                />
                <button
                  type="button"
                  onClick={markWinner}
                  className="px-6 py-3 bg-brand text-white font-bold text-xs uppercase rounded-xl"
                >
                  Save winner
                </button>
              </div>
              {winners.length > 0 && (
                <Table
                  headers={["Giveaway", "Winner", "Prize", "Date"]}
                  rows={winners.map((w) => [
                    w.giveaways?.title,
                    w.user_profiles?.name,
                    w.prize,
                    new Date(w.announced_at).toLocaleDateString(),
                  ])}
                />
              )}
            </div>
          )}

          {tab === "prebookings" && (
            <Table
              headers={["Name", "Email", "Phone", "City", "When"]}
              rows={prebookings.map((b) => [
                b.name,
                b.email,
                b.phone || "—",
                b.city || "—",
                new Date(b.created_at).toLocaleString(),
              ])}
            />
          )}

          {tab === "notifications" && (
            <div className="space-y-6">
              <div className="bg-surface-card border border-white/10 rounded-2xl p-5 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-white font-bold text-sm uppercase tracking-widest">
                      Push readiness
                    </p>
                    <p className="text-text-muted text-xs mt-1">
                      Background push needs VAPID keys, user Allow, and service worker. On localhost
                      add ENABLE_PWA_DEV=true to .env.local and restart dev.
                    </p>
                  </div>
                  <span
                    className={cn(
                      "text-xs font-bold uppercase px-2 py-1 rounded-lg",
                      pushReadiness?.vapidConfigured
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-red-500/10 text-red-400"
                    )}
                  >
                    {pushReadiness?.vapidConfigured ? "VAPID ready" : "VAPID missing"}
                  </span>
                </div>

                {pushReadiness ? (
                  <>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      {[
                        { label: "Total users", value: pushReadiness.totalUsers },
                        { label: "Push subscribers", value: pushReadiness.usersWithPush },
                        { label: "Active devices", value: pushReadiness.activeSubscriptions },
                        { label: "Reach (all)", value: `${pushReadiness.pushReachPercent}%` },
                      ].map((c) => (
                        <div
                          key={c.label}
                          className="bg-black/30 border border-white/10 rounded-xl p-3"
                        >
                          <p className="text-text-muted text-[10px] uppercase tracking-widest">
                            {c.label}
                          </p>
                          <p className="text-white text-lg font-bold mt-1">{c.value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="bg-brand/5 border border-brand/20 rounded-xl p-4">
                      <p className="text-brand text-xs font-bold uppercase tracking-widest mb-2">
                        Selected audience: {audienceLabels[campaignAudience] || campaignAudience}
                      </p>
                      <div className="grid sm:grid-cols-3 gap-3 text-sm">
                        <p className="text-text-secondary">
                          Users in audience:{" "}
                          <span className="text-white font-semibold">
                            {pushReadiness.audienceUsers}
                          </span>
                        </p>
                        <p className="text-text-secondary">
                          With push enabled:{" "}
                          <span className="text-white font-semibold">
                            {pushReadiness.audienceUsersWithPush}
                          </span>{" "}
                          ({pushReadiness.audienceReachPercent}%)
                        </p>
                        <p className="text-text-secondary">
                          Est. devices to hit:{" "}
                          <span className="text-emerald-400 font-semibold">
                            {pushReadiness.audienceSubscriptions}
                          </span>
                        </p>
                      </div>
                    </div>

                    {pushReadiness.inactiveSubscriptions > 0 && (
                      <p className="text-yellow-400 text-xs">
                        {pushReadiness.inactiveSubscriptions} inactive subscription(s) — expired or
                        unsubscribed devices.
                      </p>
                    )}

                    {!pushReadiness.vapidConfigured && (
                      <p className="text-red-400 text-xs">
                        Add VAPID keys to `.env.local` and restart dev server. Run:{" "}
                        <code className="text-red-300">npx web-push generate-vapid-keys</code>
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={sendTestPush}
                      disabled={testingPush || !pushReadiness.vapidConfigured}
                      className="w-full py-2.5 bg-white/5 border border-white/10 text-text-secondary font-bold text-xs uppercase tracking-widest rounded-xl hover:text-white hover:border-brand/40 disabled:opacity-50"
                    >
                      {testingPush ? "Sending test…" : "Send test push to my devices"}
                    </button>
                  </>
                ) : (
                  <p className="text-text-muted text-sm">Could not load push stats.</p>
                )}
              </div>

              <div className="bg-gradient-to-r from-brand/10 to-yellow-500/10 border border-brand/20 rounded-2xl p-5 space-y-4">
                <div>
                  <p className="text-white font-bold text-sm uppercase tracking-widest">
                    Send campaign notification
                  </p>
                  <p className="text-text-muted text-xs mt-1">
                    Sends to saved push subscribers even if app is closed. If push is unavailable,
                    users still get it on next app open. Use {"{firstName}"} or {"{points}"} in the message.
                  </p>
                </div>

                {campaignError && (
                  <p className="text-red-400 text-sm">{campaignError}</p>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-text-muted text-xs uppercase tracking-widest block mb-2">
                      Type
                    </label>
                    <select
                      value={campaignKind}
                      onChange={(e) => applyKindTemplate(e.target.value)}
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white text-sm"
                    >
                      {ENGAGEMENT_KIND_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-text-muted text-xs uppercase tracking-widest block mb-2">
                      Audience
                    </label>
                    <select
                      value={campaignAudience}
                      onChange={(e) => setCampaignAudience(e.target.value)}
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white text-sm"
                    >
                      {Object.entries(audienceLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <input
                  value={campaignTitle}
                  onChange={(e) => setCampaignTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white text-sm"
                  placeholder="Notification title"
                />
                <textarea
                  value={campaignBody}
                  onChange={(e) => setCampaignBody(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white text-sm resize-none"
                  placeholder="Notification body"
                />
                <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
                  <div className="flex-1">
                    <label className="text-text-muted text-xs uppercase tracking-widest block mb-2">
                      Expires in (hours)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={campaignExpiresHours}
                      onChange={(e) => setCampaignExpiresHours(e.target.value)}
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white text-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={sendCampaign}
                    disabled={sendingCampaign || !campaignTitle.trim() || !campaignBody.trim()}
                    className="px-6 py-3 bg-brand text-white font-bold text-xs uppercase rounded-xl disabled:opacity-50"
                  >
                    {sendingCampaign ? "Sending…" : "Send campaign"}
                  </button>
                </div>
              </div>

              <div className="bg-surface-card border border-white/10 rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-white/10">
                  <p className="text-white font-bold text-sm uppercase tracking-widest">
                    Recent campaigns
                  </p>
                </div>
                {campaigns.length === 0 ? (
                  <p className="p-5 text-text-muted text-sm">No campaigns yet.</p>
                ) : (
                  <div className="divide-y divide-white/5">
                    {campaigns.map((c) => (
                      <div key={c.id} className="p-5 space-y-2">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-white font-semibold">{c.title}</p>
                            <p className="text-text-secondary text-sm mt-1">{c.body}</p>
                          </div>
                          <span
                            className={cn(
                              "text-xs font-bold uppercase px-2 py-1 rounded-lg",
                              c.status === "active" && "bg-emerald-500/10 text-emerald-400",
                              c.status === "paused" && "bg-yellow-500/10 text-yellow-400",
                              c.status === "ended" && "bg-white/5 text-text-muted"
                            )}
                          >
                            {c.status}
                          </span>
                        </div>
                        <p className="text-text-muted text-xs">
                          {c.kind} · {audienceLabels[c.audience] || c.audience} ·{" "}
                          {new Date(c.created_at).toLocaleString()}
                          {c.expires_at
                            ? ` · expires ${new Date(c.expires_at).toLocaleString()}`
                            : ""}
                        </p>
                        {c.status !== "ended" && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {c.status === "paused" && (
                              <button
                                type="button"
                                disabled={updatingCampaignId === c.id}
                                onClick={() => updateCampaignStatus(c.id, "active")}
                                className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase rounded-lg disabled:opacity-50"
                              >
                                Resume
                              </button>
                            )}
                            {c.status === "active" && (
                              <button
                                type="button"
                                disabled={updatingCampaignId === c.id}
                                onClick={() => updateCampaignStatus(c.id, "paused")}
                                className="px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-bold uppercase rounded-lg disabled:opacity-50"
                              >
                                Pause
                              </button>
                            )}
                            <button
                              type="button"
                              disabled={updatingCampaignId === c.id}
                              onClick={() => {
                                if (confirm("End this campaign? Users who haven't seen it won't get it.")) {
                                  void updateCampaignStatus(c.id, "ended");
                                }
                              }}
                              className="px-3 py-1.5 bg-white/5 border border-white/10 text-text-secondary text-xs font-bold uppercase rounded-lg hover:text-white disabled:opacity-50"
                            >
                              End
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex justify-between mb-4">
              <h2 className="text-white font-bold">{selectedUser.profile?.name}</h2>
              <button type="button" onClick={() => setSelectedUser(null)} className="text-text-muted">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-text-muted text-sm mb-4">{selectedUser.profile?.email}</p>
            <p className="text-white text-sm mb-4">
              Points: <span className="text-brand font-bold">{selectedUser.profile?.giveaway_points}</span>
              {" · "}
              XP: {selectedUser.profile?.xp_points}
            </p>
            <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
              <p className="text-white text-xs font-bold uppercase tracking-widest">Adjust points</p>
              <input
                type="number"
                value={pointDelta}
                onChange={(e) => setPointDelta(e.target.value)}
                placeholder="+50 or -25"
                className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white text-sm"
              />
              <input
                value={pointReason}
                onChange={(e) => setPointReason(e.target.value)}
                className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white text-sm"
                placeholder="Reason"
              />
              <button
                type="button"
                onClick={adjustPoints}
                disabled={adjustingPoints}
                className="w-full py-2 bg-brand text-white text-xs font-bold uppercase rounded-lg disabled:opacity-50"
              >
                {adjustingPoints ? "Saving…" : "Apply adjustment"}
              </button>
            </div>
            {selectedUser.claims?.length > 0 && (
              <>
                <p className="text-brand font-bold mb-2">IG claims</p>
                <ul className="space-y-2 text-xs text-text-secondary mb-4">
                  {selectedUser.claims.map((c: { id: string; action: string; status: string; points: number }) => (
                    <li key={c.id}>
                      {c.action} +{c.points} —{" "}
                      <span
                        className={cn(
                          c.status === "approved" && "text-emerald-400",
                          c.status === "denied" && "text-red-400",
                          c.status === "pending" && "text-yellow-400"
                        )}
                      >
                        {c.status}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}
            <p className="text-brand font-bold mb-2">Point logs</p>
            <ul className="space-y-2 text-xs text-text-secondary">
              {selectedUser.pointLogs?.slice(0, 20).map((l: any) => (
                <li key={l.id}>
                  {l.action} +{l.points} — {new Date(l.created_at).toLocaleDateString()}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

function Table({ headers, rows }: { headers: string[]; rows: (string | number | React.ReactNode)[][] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-white/5 text-left">
            {headers.map((h) => (
              <th key={h} className="px-4 py-3 text-text-muted text-[10px] uppercase tracking-widest font-bold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="px-4 py-8 text-center text-text-muted">
                No data
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr key={i} className="hover:bg-white/[0.02]">
                {row.map((cell, j) => (
                  <td key={j} className="px-4 py-3 text-white">
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
