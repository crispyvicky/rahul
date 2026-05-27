import { NextResponse } from "next/server";
import { getPendingCampaignsForUser } from "@/lib/campaign-notifications";
import { assertBodyUserMatchesSession } from "@/lib/points-service";
import { hasSupabaseAdmin } from "@/lib/supabase-admin";
import { isUuidUserId } from "@/lib/api-guards";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId")?.trim();
    if (!userId || !isUuidUserId(userId)) {
      return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
    }

    const sessionCheck = await assertBodyUserMatchesSession(userId);
    if ("error" in sessionCheck) return sessionCheck.error;

    if (!hasSupabaseAdmin()) {
      return NextResponse.json({ campaigns: [] });
    }

    const campaigns = await getPendingCampaignsForUser(userId);
    return NextResponse.json({ campaigns });
  } catch (e) {
    console.error("[notifications/campaigns GET]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
