import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import {
  createCampaign,
  listCampaigns,
  sendCampaignPushBlast,
  updateCampaignStatus,
  type CampaignAudience,
  type CampaignStatus,
} from "@/lib/campaign-notifications";
import { hasSupabaseAdmin } from "@/lib/supabase-admin";
import type { EngagementNotificationKind } from "@/lib/engagement-notifications";

export const runtime = "nodejs";

export async function GET() {
  const { error, session } = await requireAdmin();
  if (error) return error;
  if (!hasSupabaseAdmin()) {
    return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY not configured" }, { status: 503 });
  }
  try {
    const campaigns = await listCampaigns();
    return NextResponse.json({ campaigns });
  } catch (e) {
    console.error("[admin/campaigns GET]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { error, session } = await requireAdmin();
  if (error) return error;
  if (!hasSupabaseAdmin()) {
    return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY not configured" }, { status: 503 });
  }

  try {
    const body = await request.json();
    const kind = (body.kind || "custom") as EngagementNotificationKind | "custom";
    const title = String(body.title ?? "").trim();
    const bodyText = String(body.body ?? "").trim();
    const audience = (body.audience || "all") as CampaignAudience;
    const expiresInHours = Number(body.expiresInHours ?? 72);

    const validAudiences: CampaignAudience[] = [
      "all",
      "active_7d",
      "top_20",
      "streak_users",
      "zero_points",
    ];
    if (!validAudiences.includes(audience)) {
      return NextResponse.json({ error: "Invalid audience" }, { status: 400 });
    }

    const result = await createCampaign({
      kind,
      title,
      body: bodyText,
      audience,
      createdBy: session?.user?.email ?? undefined,
      expiresInHours: Number.isFinite(expiresInHours) ? expiresInHours : 72,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const pushResult = await sendCampaignPushBlast(result.campaign);

    return NextResponse.json({
      success: true,
      campaign: result.campaign,
      push: pushResult.ok
        ? {
            delivered: pushResult.delivered,
            failed: pushResult.failed,
            totalSubscriptions: pushResult.totalSubscriptions,
          }
        : { error: pushResult.error },
    });
  } catch (e) {
    console.error("[admin/campaigns POST]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  if (!hasSupabaseAdmin()) {
    return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY not configured" }, { status: 503 });
  }

  try {
    const body = await request.json();
    const campaignId = String(body.campaignId ?? "");
    const status = body.status as CampaignStatus;
    if (!campaignId || !["active", "paused", "ended"].includes(status)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    const result = await updateCampaignStatus(campaignId, status);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[admin/campaigns PATCH]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
