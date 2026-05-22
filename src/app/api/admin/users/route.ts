import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { getAllUsers } from "@/lib/admin-service";
import { hasSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;
  if (!hasSupabaseAdmin()) {
    return NextResponse.json({ error: "Service role not configured" }, { status: 503 });
  }
  const search = req.nextUrl.searchParams.get("search") || undefined;
  const users = await getAllUsers(search);
  return NextResponse.json({ users });
}
