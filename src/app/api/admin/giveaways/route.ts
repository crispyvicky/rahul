import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { getGiveawaysAdmin, endGiveaway, getWinners } from "@/lib/admin-service";
import { hasSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  if (!hasSupabaseAdmin()) {
    return NextResponse.json({ error: "Service role not configured" }, { status: 503 });
  }
  const [giveaways, winners] = await Promise.all([
    getGiveawaysAdmin(),
    getWinners(),
  ]);
  return NextResponse.json({ giveaways, winners });
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;
  if (!hasSupabaseAdmin()) {
    return NextResponse.json({ error: "Service role not configured" }, { status: 503 });
  }
  const { giveawayId, action } = await req.json();
  if (action === "end" && giveawayId) {
    await endGiveaway(giveawayId);
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}
