import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSupabaseAdmin, hasSupabaseAdmin } from "@/lib/supabase-admin";
import { updateStreakServer } from "@/lib/profile-server";

export const runtime = "nodejs";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }

    if (!hasSupabaseAdmin()) {
      return NextResponse.json(
        { error: "Add SUPABASE_SERVICE_ROLE_KEY to .env.local" },
        { status: 503 }
      );
    }

    const db = getSupabaseAdmin();
    const email = session.user.email.trim().toLowerCase();
    const now = new Date().toISOString();
    const profileFields = {
      google_id: (session.user as { id?: string }).id || `google-${email}`,
      name: session.user.name || "Athlete",
      email,
      avatar_url: session.user.image || "",
      updated_at: now,
    };

    const { data: existing } = await db
      .from("user_profiles")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (existing) {
      // Streak + daily login points use previous last_login — run before overwriting it
      const withStreak = await updateStreakServer(existing.id);

      const { data, error } = await db
        .from("user_profiles")
        .update(profileFields)
        .eq("id", existing.id)
        .select()
        .single();

      if (error) {
        console.error("[sync-profile update]", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ profile: withStreak || data });
    }

    const referralCode = `RF-${profileFields.name.toUpperCase().replace(/\s+/g, "").slice(0, 4)}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const { data, error } = await db
      .from("user_profiles")
      .insert({
        ...profileFields,
        referral_code: referralCode,
        last_login: now,
      })
      .select()
      .single();

    if (error) {
      console.error("[sync-profile insert]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const withStreak = await updateStreakServer(data.id);
    return NextResponse.json({ profile: withStreak || data });
  } catch (e) {
    console.error("[sync-profile]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
