import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { getAdminStats } from "@/lib/admin-service";
import { hasSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  if (!hasSupabaseAdmin()) {
    return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY not configured" }, { status: 503 });
  }
  try {
    const stats = await getAdminStats();
    return NextResponse.json(stats);
  } catch (e) {
    console.error("[admin/stats]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
