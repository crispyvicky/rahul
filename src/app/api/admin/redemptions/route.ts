import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { listRedemptionAlerts } from "@/lib/prize-redemption-alerts";
import { hasSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;
  if (!hasSupabaseAdmin()) {
    return NextResponse.json({ error: "Service role not configured" }, { status: 503 });
  }

  const status = req.nextUrl.searchParams.get("status") || "pending";
  const alerts = await listRedemptionAlerts(
    status === "all" ? "all" : (status as "pending" | "fulfilled" | "dismissed")
  );
  return NextResponse.json({ alerts });
}
