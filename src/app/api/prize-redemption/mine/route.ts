import { NextRequest, NextResponse } from "next/server";
import { assertBodyUserMatchesSession } from "@/lib/points-service";
import {
  getUserRedemptionStatuses,
  resolveUserContact,
} from "@/lib/prize-redemption-alerts";
import { hasSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  if (!hasSupabaseAdmin()) {
    return NextResponse.json({ error: "Server not configured" }, { status: 503 });
  }

  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  const sessionCheck = await assertBodyUserMatchesSession(userId);
  if ("error" in sessionCheck) return sessionCheck.error;

  const [statuses, contact] = await Promise.all([
    getUserRedemptionStatuses(sessionCheck.userId),
    resolveUserContact(sessionCheck.userId),
  ]);
  return NextResponse.json({ statuses, contact });
}
