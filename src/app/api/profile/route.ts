import { NextRequest, NextResponse } from "next/server";
import { updateUserProfile } from "@/lib/supabase-service";
import { isUuidUserId } from "@/lib/api-guards";

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, name, instagram_handle } = body;

    if (!isUuidUserId(userId)) {
      return NextResponse.json({ error: "Sign in with Google to save profile" }, { status: 403 });
    }

    const updates: Record<string, string> = {};
    if (typeof name === "string" && name.trim()) updates.name = name.trim();
    if (typeof instagram_handle === "string") {
      updates.instagram_handle = instagram_handle.trim();
    }

    const profile = await updateUserProfile(userId, updates as never);
    if (!profile) {
      return NextResponse.json({ error: "Could not save profile" }, { status: 500 });
    }

    return NextResponse.json({ success: true, profile });
  } catch (e) {
    console.error("[profile PATCH]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
