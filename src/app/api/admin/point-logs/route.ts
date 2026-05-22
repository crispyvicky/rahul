import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { getPointLogs } from "@/lib/admin-service";
import { hasSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;
  if (!hasSupabaseAdmin()) {
    return NextResponse.json({ error: "Service role not configured" }, { status: 503 });
  }
  const action = req.nextUrl.searchParams.get("action") || undefined;
  const logs = await getPointLogs({ action, limit: 200 });
  return NextResponse.json({ logs });
}
