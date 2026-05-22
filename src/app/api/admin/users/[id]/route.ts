import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { getUserDetail } from "@/lib/admin-service";
import { hasSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;
  if (!hasSupabaseAdmin()) {
    return NextResponse.json({ error: "Service role not configured" }, { status: 503 });
  }
  const { id } = await params;
  const detail = await getUserDetail(id);
  return NextResponse.json(detail);
}
