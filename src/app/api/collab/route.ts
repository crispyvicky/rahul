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
    const brand = String(body.brand ?? "").trim();
    const message = String(body.message ?? "").trim();

    if (!name || name.length < 2) {
      return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
    }
    if (!brand || brand.length < 2) {
      return NextResponse.json({ error: "Please enter your brand or organization." }, { status: 400 });
    }
    if (!message || message.length < 10) {
      return NextResponse.json({ error: "Please include a brief message." }, { status: 400 });
    }

    if (!hasSupabaseAdmin() || !isMailConfigured()) {
      console.warn("[collab] queue or SMTP unavailable");
      return NextResponse.json(
        { success: false, error: "Submissions are temporarily unavailable." },
        { status: 503 }
      );
    }

    const data = { name, email, brand, message };

    await enqueueEmailBatch([
      {
        template: "collab_internal",
        to: "collab@rahulfitzz.com",
        data,
        title: "Partnership lead (internal)",
      },
      {
        template: "collab_user",
        to: email,
        data,
        title: "Partnership confirmation",
      },
    ]);
    scheduleNotificationDrain();

    return NextResponse.json({ success: true, message: "Transmission sent successfully" });
  } catch (error) {
    console.error("[collab]", error);
    return NextResponse.json(
      { success: false, error: "Failed to process transmission" },
      { status: 500 }
    );
  }
}
