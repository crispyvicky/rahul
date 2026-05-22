import { NextResponse } from "next/server";
import { enqueueEmailBatch } from "@/lib/notification-queue";
import { scheduleNotificationDrain } from "@/lib/background";
import { hasSupabaseAdmin } from "@/lib/supabase-admin";
import { isMailConfigured } from "@/lib/mailer";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const email = normalizeEmail(String(body.email ?? ""));

    if (!name || name.length < 2) {
      return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
    }

    if (!hasSupabaseAdmin() || !isMailConfigured()) {
      console.warn("[notify] queue or SMTP unavailable");
      return NextResponse.json(
        { success: false, error: "Waitlist is temporarily unavailable." },
        { status: 503 }
      );
    }

    await enqueueEmailBatch([
      {
        template: "waitlist_internal",
        to: "collab@rahulfitzz.com",
        data: { name, email },
        title: "Waitlist (internal)",
      },
      {
        template: "waitlist_user",
        to: email,
        data: { name, email },
        title: "Waitlist confirmation",
      },
    ]);
    scheduleNotificationDrain();

    return NextResponse.json({ success: true, message: "Waitlist entry recorded" });
  } catch (error) {
    console.error("[notify]", error);
    return NextResponse.json(
      { success: false, error: "Failed to record entry" },
      { status: 500 }
    );
  }
}
