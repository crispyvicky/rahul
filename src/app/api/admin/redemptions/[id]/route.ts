import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { updateRedemptionAlert } from "@/lib/prize-redemption-alerts";
import { hasSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await requireAdmin();
  if (error) return error;
  if (!hasSupabaseAdmin()) {
    return NextResponse.json({ error: "Service role not configured" }, { status: 503 });
  }

  const { id } = await params;
  const body = await req.json();
  const status = body.status as "fulfilled" | "dismissed";
  const adminNote = body.adminNote as string | undefined;

  if (status !== "fulfilled" && status !== "dismissed") {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const result = await updateRedemptionAlert(id, {
    status,
    adminNote,
    fulfilledBy: session?.user?.email || "admin",
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
