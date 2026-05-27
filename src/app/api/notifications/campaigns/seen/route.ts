import { NextResponse } from "next/server";
import { markCampaignSeen } from "@/lib/campaign-notifications";
import { assertBodyUserMatchesSession } from "@/lib/points-service";
import { hasSupabaseAdmin } from "@/lib/supabase-admin";
import { isUuidUserId } from "@/lib/api-guards";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userId = String(body.userId ?? "").trim();
    const campaignId = String(body.campaignId ?? "").trim();

    if (!userId || !isUuidUserId(userId) || !campaignId) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const sessionCheck = await assertBodyUserMatchesSession(userId);
    if ("error" in sessionCheck) return sessionCheck.error;

    if (!hasSupabaseAdmin()) {
      return NextResponse.json({ success: true });
    }

    const result = await markCampaignSeen(userId, campaignId);
    if (!result.ok) {
      return NextResponse.json({ error: result.error || "Could not mark seen" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[notifications/campaigns/seen POST]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
