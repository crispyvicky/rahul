import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
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
    const phone = String(body.phone ?? "").trim() || null;
    const city = String(body.city ?? "").trim() || null;
    const notes = String(body.notes ?? "").trim() || null;
    const source = String(body.source ?? "homepage_gym").trim() || "homepage_gym";

    if (!name || name.length < 2) {
      return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
    }

    const { error: dbError } = await supabase.from("gym_prebookings").insert({
      name,
      email,
      phone,
      city,
      notes,
      source,
    });

    if (dbError) {
      if (dbError.code === "23505") {
        return NextResponse.json(
          {
            error:
              "This email is already on the pre-booking list. Check your inbox for our confirmation.",
          },
          { status: 409 }
        );
      }
      console.error("[gym-prebook] DB error:", dbError.message);
      return NextResponse.json(
        { error: "Could not save your pre-booking. Try again shortly." },
        { status: 500 }
      );
    }

    const internalTo =
      process.env.PREBOOK_NOTIFY_EMAIL?.trim() || "collab@rahulfitzz.com";
    const emailData = { name, email, phone, city, notes, source };

    if (hasSupabaseAdmin() && isMailConfigured()) {
      await enqueueEmailBatch([
        {
          template: "gym_prebook_internal",
          to: internalTo,
          data: emailData,
          title: "Gym pre-book (internal)",
        },
        {
          template: "gym_prebook_user",
          to: email,
          data: emailData,
          title: "Gym pre-book confirmation",
        },
      ]);
      scheduleNotificationDrain();
    }

    return NextResponse.json({ success: true, message: "Pre-booking confirmed" });
  } catch (error) {
    console.error("[gym-prebook]", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
