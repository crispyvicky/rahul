import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { getSupabaseAdmin, hasSupabaseAdmin } from "@/lib/supabase-admin";
import { hasWebPushConfig, sendWebPush } from "@/lib/web-push";

export const runtime = "nodejs";

export async function POST() {
  const { error, session } = await requireAdmin();
  if (error) return error;
  if (!hasSupabaseAdmin()) {
    return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY not configured" }, { status: 503 });
  }
  if (!hasWebPushConfig()) {
    return NextResponse.json({ error: "VAPID keys not configured" }, { status: 503 });
  }

  try {
    const db = getSupabaseAdmin();
    const adminEmail = session?.user?.email?.toLowerCase();
    if (!adminEmail) {
      return NextResponse.json({ error: "Admin email not found in session" }, { status: 400 });
    }

    const { data: profile } = await db
      .from("user_profiles")
      .select("id, name")
      .eq("email", adminEmail)
      .maybeSingle();

    if (!profile?.id) {
      return NextResponse.json(
        { error: "No user profile for this admin email. Log in on the app once with the same Google account." },
        { status: 404 }
      );
    }

    const { data: subs } = await db
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth")
      .eq("user_id", profile.id)
      .eq("is_active", true);

    if (!subs?.length) {
      return NextResponse.json({
        success: false,
        error: "No push subscription for your account. Open /dashboard → allow notifications → tap bell once.",
        userId: profile.id,
      });
    }

    let delivered = 0;
    let failed = 0;
    const details: { id: string; ok: boolean; error?: string }[] = [];

    for (const sub of subs) {
      const result = await sendWebPush(
        {
          endpoint: sub.endpoint as string,
          keys: { p256dh: sub.p256dh as string, auth: sub.auth as string },
        },
        {
          title: "RahulFitzz test",
          body: `Test push for ${profile.name || "admin"} — ${new Date().toLocaleTimeString()}`,
          tag: "rf-admin-test",
          url: "/dashboard",
        }
      );
      if (result.ok) {
        delivered += 1;
        details.push({ id: sub.id as string, ok: true });
      } else {
        failed += 1;
        details.push({
          id: sub.id as string,
          ok: false,
          error: "error" in result ? result.error : "failed",
        });
      }
    }

    return NextResponse.json({
      success: delivered > 0,
      delivered,
      failed,
      total: subs.length,
      userId: profile.id,
      details,
      hint: "Check Windows notification center. Close the browser tab first, then send again.",
    });
  } catch (e) {
    console.error("[admin/campaigns/test-push POST]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
