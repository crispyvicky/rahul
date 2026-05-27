import { NextResponse } from "next/server";
import { assertBodyUserMatchesSession } from "@/lib/points-service";
import { getSupabaseAdmin, hasSupabaseAdmin } from "@/lib/supabase-admin";
import { isUuidUserId } from "@/lib/api-guards";
import type { WebPushSubscription } from "@/lib/web-push";

export const runtime = "nodejs";

function isValidSubscription(subscription: any): subscription is WebPushSubscription {
  return Boolean(
    subscription &&
      typeof subscription.endpoint === "string" &&
      subscription.endpoint &&
      subscription.keys &&
      typeof subscription.keys.p256dh === "string" &&
      typeof subscription.keys.auth === "string"
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userId = String(body.userId ?? "").trim();
    const subscription = body.subscription;
    const userAgent = String(body.userAgent ?? "").trim();

    if (!isUuidUserId(userId) || !isValidSubscription(subscription)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const sessionCheck = await assertBodyUserMatchesSession(userId);
    if ("error" in sessionCheck) return sessionCheck.error;

    if (!hasSupabaseAdmin()) {
      return NextResponse.json({ success: true });
    }

    const db = getSupabaseAdmin();
    const { error } = await db.from("push_subscriptions").upsert(
      {
        user_id: userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        user_agent: userAgent || null,
        is_active: true,
        updated_at: new Date().toISOString(),
        last_error: null,
      },
      { onConflict: "endpoint" }
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[notifications/push-subscriptions POST]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const userId = String(body.userId ?? "").trim();
    const endpoint = String(body.endpoint ?? "").trim();

    if (!isUuidUserId(userId) || !endpoint) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const sessionCheck = await assertBodyUserMatchesSession(userId);
    if ("error" in sessionCheck) return sessionCheck.error;

    if (!hasSupabaseAdmin()) {
      return NextResponse.json({ success: true });
    }

    const db = getSupabaseAdmin();
    const { error } = await db
      .from("push_subscriptions")
      .delete()
      .eq("user_id", userId)
      .eq("endpoint", endpoint);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[notifications/push-subscriptions DELETE]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
