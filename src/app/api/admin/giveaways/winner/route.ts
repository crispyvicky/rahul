import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { markWinner } from "@/lib/admin-service";
import { hasSupabaseAdmin } from "@/lib/supabase-admin";
import { isUuidUserId } from "@/lib/api-guards";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;
  if (!hasSupabaseAdmin()) {
    return NextResponse.json({ error: "Service role not configured" }, { status: 503 });
  }
  const { giveawayId, userId, prize, notes, rank } = await req.json();
  if (!giveawayId || !isUuidUserId(userId)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const result = await markWinner(
    giveawayId,
    userId,
    prize || "Prize",
    notes,
    rank ?? 1
  );
  if (!result.ok) {
    return NextResponse.json({ error: "Could not save winner" }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
