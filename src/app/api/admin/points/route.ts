import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { adjustUserPoints } from "@/lib/admin-service";
import { hasSupabaseAdmin } from "@/lib/supabase-admin";
import { isUuidUserId } from "@/lib/api-guards";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;
  if (!hasSupabaseAdmin()) {
    return NextResponse.json({ error: "Service role not configured" }, { status: 503 });
  }
  const { userId, delta, reason } = await req.json();
  if (!isUuidUserId(userId) || typeof delta !== "number") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const result = await adjustUserPoints(userId, delta, reason || "Admin adjustment");
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ success: true });
}
