import { NextResponse } from "next/server";
import { assertBodyUserMatchesSession } from "@/lib/points-service";
import { requestPrizeRedemption } from "@/lib/prize-redemption-alerts";
import { hasSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!hasSupabaseAdmin()) {
    return NextResponse.json({ error: "Server not configured" }, { status: 503 });
  }

  const body = await request.json();
  const { userId: bodyUserId, tierId, note, phone, instagram } = body;

  if (!bodyUserId || !tierId) {
    return NextResponse.json({ error: "userId and tierId required" }, { status: 400 });
  }

  const sessionCheck = await assertBodyUserMatchesSession(bodyUserId);
  if ("error" in sessionCheck) return sessionCheck.error;

  const result = await requestPrizeRedemption(sessionCheck.userId, tierId, {
    userNote: note,
    phone: typeof phone === "string" ? phone : undefined,
    instagram: typeof instagram === "string" ? instagram : undefined,
  });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    alreadyRequested: "alreadyRequested" in result && result.alreadyRequested,
  });
}
