import { NextRequest, NextResponse } from "next/server";
import { getGiveawayPageData } from "@/lib/supabase-service";
import { isUuidUserId } from "@/lib/api-guards";
import { getUserClaimStatuses } from "@/lib/admin-service";
import { hasSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId") ?? undefined;
    if (userId && !isUuidUserId(userId)) {
      return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
    }
    const data = await getGiveawayPageData(userId);
    let claimStatuses: Record<string, string> = {};
    if (userId && hasSupabaseAdmin()) {
      try {
        claimStatuses = await getUserClaimStatuses(userId);
      } catch {
        /* table may not exist yet */
      }
    }
    return NextResponse.json({ ...data, claimStatuses });
  } catch (e) {
    console.error("[giveaway GET]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
