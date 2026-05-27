import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import {
  getPushReadinessStats,
  type CampaignAudience,
} from "@/lib/campaign-notifications";
import { hasSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

const VALID_AUDIENCES: CampaignAudience[] = [
  "all",
  "active_7d",
  "top_20",
  "streak_users",
  "zero_points",
];

export async function GET(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  if (!hasSupabaseAdmin()) {
    return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY not configured" }, { status: 503 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const rawAudience = searchParams.get("audience") || "all";
    const audience = VALID_AUDIENCES.includes(rawAudience as CampaignAudience)
      ? (rawAudience as CampaignAudience)
      : "all";

    const stats = await getPushReadinessStats(audience);
    return NextResponse.json({ stats });
  } catch (e) {
    console.error("[admin/campaigns/push-readiness GET]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
