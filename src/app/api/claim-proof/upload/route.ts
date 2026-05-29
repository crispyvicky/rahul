import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, hasSupabaseAdmin } from "@/lib/supabase-admin";
import { isUuidUserId } from "@/lib/api-guards";
import { assertBodyUserMatchesSession } from "@/lib/points-service";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    if (!hasSupabaseAdmin()) {
      return NextResponse.json({ error: "Server not configured" }, { status: 503 });
    }

    const form = await req.formData();
    const file = form.get("file") as File | null;
    const userId = form.get("userId") as string | null;

    if (!file || !userId || !isUuidUserId(userId)) {
      return NextResponse.json({ error: "Invalid upload" }, { status: 400 });
    }

    const sessionCheck = await assertBodyUserMatchesSession(userId);
    if ("error" in sessionCheck) return sessionCheck.error;

    const allowed = new Set(["image/jpeg", "image/png", "image/webp", "image/jpg", ""]);
    const nameOk = /\.(jpe?g|png|webp)$/i.test(file.name);
    if (!allowed.has(file.type) && !nameOk && file.type !== "image/heic" && file.type !== "image/heif") {
      return NextResponse.json(
        { error: "Only image files (JPG, PNG, WebP). Screenshots work best." },
        { status: 400 }
      );
    }

    if (file.size > 1.5 * 1024 * 1024) {
      return NextResponse.json({ error: "Image too large (max 1.5MB after compress)" }, { status: 400 });
    }

    const ext =
      file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const contentType =
      ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
    const path = `${userId}/${Date.now()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const db = getSupabaseAdmin();
    const { error } = await db.storage.from("claim-proofs").upload(path, buffer, {
      contentType,
      upsert: false,
    });

    if (error) {
      console.error("[claim-proof upload]", error);
      return NextResponse.json(
        {
          error:
            "Upload failed. Create bucket claim-proofs in Supabase Storage (public read) or use a screenshot link.",
        },
        { status: 500 }
      );
    }

    const { data: urlData } = db.storage.from("claim-proofs").getPublicUrl(path);

    return NextResponse.json({ proofUrl: urlData.publicUrl });
  } catch (e) {
    console.error("[claim-proof upload]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
