import { NextResponse } from "next/server";
import { assertBodyUserMatchesSession } from "@/lib/points-service";
import { recordNotificationOptIn } from "@/lib/notification-opt-in";
import { hasSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!hasSupabaseAdmin()) {
    return NextResponse.json({ error: "Server not configured" }, { status: 503 });
  }

  const body = await request.json();
  const { userId } = body;

  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  const sessionCheck = await assertBodyUserMatchesSession(userId);
  if ("error" in sessionCheck) return sessionCheck.error;

  const result = await recordNotificationOptIn(sessionCheck.userId);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    alreadyOptedIn: result.alreadyOptedIn,
    enabledAt: result.enabledAt,
  });
}
