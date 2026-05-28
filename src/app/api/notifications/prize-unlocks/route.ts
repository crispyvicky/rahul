import { NextRequest, NextResponse } from "next/server";
import { assertBodyUserMatchesSession } from "@/lib/points-service";
import {
  listUnseenInAppPrizeUnlocks,
  markInAppPrizeUnlocksSeen,
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

  const unlocks = await listUnseenInAppPrizeUnlocks(sessionCheck.userId);
  return NextResponse.json({ unlocks });
}

export async function POST(req: NextRequest) {
  if (!hasSupabaseAdmin()) {
    return NextResponse.json({ error: "Server not configured" }, { status: 503 });
  }

  const body = await req.json();
  const { userId, alertIds } = body;

  if (!userId || !Array.isArray(alertIds) || alertIds.length === 0) {
    return NextResponse.json({ error: "userId and alertIds required" }, { status: 400 });
  }

  const sessionCheck = await assertBodyUserMatchesSession(userId);
  if ("error" in sessionCheck) return sessionCheck.error;

  await markInAppPrizeUnlocksSeen(alertIds as string[]);
  return NextResponse.json({ success: true });
}
