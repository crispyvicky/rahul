import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { isUuidUserId } from "@/lib/api-guards";

const ACTION_META: Record<string, { name: string; icon: string }> = {
  follow: { name: "Instagram Follow", icon: "📸" },
  share_story: { name: "Story Share", icon: "📱" },
  refer: { name: "Referral Bonus", icon: "🤝" },
  streak: { name: "Streak Bonus", icon: "🔥" },
  workout: { name: "Workout Logged", icon: "🏋️" },
  checkin: { name: "Challenge Check-in", icon: "⚔️" },
  share_post: { name: "Transformation Post", icon: "⭐" },
  admin_bonus: { name: "Bonus Points", icon: "🎁" },
  admin_revoke: { name: "Points Adjustment", icon: "📊" },
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId || !isUuidUserId(userId)) {
    return NextResponse.json({ achievements: [] });
  }

  const { data } = await supabase
    .from("point_logs")
    .select("action, points, description, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(5);

  const achievements = (data || []).map((row) => {
    const meta = ACTION_META[row.action] || { name: row.action, icon: "🏆" };
    return {
      name: meta.name,
      icon: meta.icon,
      desc: row.description || `+${row.points} pts`,
      time: timeAgo(row.created_at),
    };
  });

  return NextResponse.json({ achievements });
}
