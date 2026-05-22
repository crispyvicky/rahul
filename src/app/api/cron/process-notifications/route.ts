import { NextResponse } from "next/server";
import { verifyCronRequest } from "@/lib/cron-auth";
import { processPendingNotifications } from "@/lib/notification-queue";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  if (!verifyCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const stats = await processPendingNotifications(25);
    return NextResponse.json({ ok: true, ...stats });
  } catch (err) {
    console.error("[cron/process-notifications]", err);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
