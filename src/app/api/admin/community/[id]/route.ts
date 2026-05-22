import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { deleteCommunityPost, setCommunityPostFeatured } from "@/lib/admin-service";
import { hasSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;
  if (!hasSupabaseAdmin()) {
    return NextResponse.json({ error: "Service role not configured" }, { status: 503 });
  }
  const { id } = await params;
  const result = await deleteCommunityPost(id);
  if (!result.ok) {
    return NextResponse.json({ error: result.error || "Delete failed" }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;
  if (!hasSupabaseAdmin()) {
    return NextResponse.json({ error: "Service role not configured" }, { status: 503 });
  }
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  if (typeof body.is_featured === "boolean") {
    const result = await setCommunityPostFeatured(id, body.is_featured);
    if (!result.ok) {
      return NextResponse.json({ error: result.error || "Update failed" }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}
