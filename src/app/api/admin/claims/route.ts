import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { getPendingClaims, getAllClaims } from "@/lib/admin-service";
import { hasSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;
  if (!hasSupabaseAdmin()) {
    return NextResponse.json({ error: "Service role not configured" }, { status: 503 });
  }
  const all = req.nextUrl.searchParams.get("all") === "1";
  const claims = all ? await getAllClaims() : await getPendingClaims();
  return NextResponse.json({ claims });
}
