import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { processReferralSignup } from "@/lib/referral-service";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, referralCode } = await req.json();
    if (!name?.trim() || !email?.trim() || !password) {
      return NextResponse.json({ error: "Name, email, and password required" }, { status: 400 });
    }

    const db = getSupabaseAdmin();
    const emailNorm = email.trim().toLowerCase();

    const { data: existing } = await db
      .from("user_profiles")
      .select("id")
      .eq("email", emailNorm)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "Email already registered. Sign in instead." }, { status: 409 });
    }

    const code = `RF-${name.toUpperCase().replace(/\s+/g, "").slice(0, 4)}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    const { data: profile, error } = await db
      .from("user_profiles")
      .insert({
        google_id: `email-${Date.now()}`,
        name: name.trim(),
        email: emailNorm,
        avatar_url: "",
        referral_code: code,
      })
      .select()
      .single();

    if (error || !profile) {
      return NextResponse.json({ error: error?.message || "Could not create account" }, { status: 500 });
    }

    if (referralCode?.trim()) {
      await processReferralSignup(profile.id, referralCode.trim());
    }

    return NextResponse.json({
      success: true,
      profile: {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        referralCode: profile.referral_code,
      },
    });
  } catch (e) {
    console.error("[auth/signup]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
