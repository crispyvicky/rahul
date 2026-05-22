import { NextRequest, NextResponse } from "next/server";
import { processReferralSignup } from "@/lib/referral-service";
import { assertBodyUserMatchesSession } from "@/lib/points-service";
import { hasSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!hasSupabaseAdmin()) {
    return NextResponse.json({ error: "Referrals unavailable" }, { status: 503 });
  }

  try {
    const { userId: bodyUserId, referralCode } = await req.json();
    if (!referralCode?.trim()) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const sessionCheck = await assertBodyUserMatchesSession(bodyUserId);
    if ("error" in sessionCheck) return sessionCheck.error;

    const result = await processReferralSignup(
      sessionCheck.userId,
      referralCode.trim()
    );
    return NextResponse.json(result);
  } catch (e) {
    console.error("[referral/apply]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
