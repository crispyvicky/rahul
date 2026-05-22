import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { getPrebookings } from "@/lib/admin-service";
import { hasSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  if (!hasSupabaseAdmin()) {
    return NextResponse.json({ error: "Service role not configured" }, { status: 503 });
  }
  const prebookings = await getPrebookings();
  return NextResponse.json({ prebookings });
}
