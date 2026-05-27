/**
 * Run: node scripts/test-push.mjs
 * Sends a test push to every active subscription in Supabase.
 */
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import webpush from "web-push";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) {
    console.error("Missing .env.local");
    process.exit(1);
  }
  const text = readFileSync(path, "utf8");
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    const key = t.slice(0, i).trim();
    let val = t.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const subject = process.env.VAPID_SUBJECT || "mailto:admin@rahulfitzz.com";

if (!url || !key || !publicKey || !privateKey) {
  console.error("Need NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, VAPID keys in .env.local");
  process.exit(1);
}

webpush.setVapidDetails(subject, publicKey, privateKey);
const db = createClient(url, key, { auth: { persistSession: false } });

const { data: subs, error } = await db
  .from("push_subscriptions")
  .select("id, user_id, endpoint, p256dh, auth, is_active, last_error, user_agent")
  .eq("is_active", true);

if (error) {
  console.error("DB error:", error.message);
  process.exit(1);
}

console.log(`Active subscriptions: ${subs?.length ?? 0}\n`);
if (!subs?.length) {
  console.log("No subscriptions. Open app → Allow notifications → check POST /api/notifications/push-subscriptions in network tab.");
  process.exit(0);
}

for (const sub of subs) {
  const shortEndpoint = String(sub.endpoint).slice(0, 60) + "...";
  console.log(`--- ${sub.id}`);
  console.log(`  user: ${sub.user_id}`);
  console.log(`  endpoint: ${shortEndpoint}`);
  console.log(`  ua: ${sub.user_agent || "—"}`);

  try {
    await webpush.sendNotification(
      {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      },
      JSON.stringify({
        title: "RahulFitzz test push",
        body: `Test at ${new Date().toLocaleTimeString()} — if you see this, push works.`,
        tag: "rf-test-push",
        url: "/dashboard",
        icon: "/icon.png",
      })
    );
    console.log("  result: OK (sent to push network)\n");
    await db
      .from("push_subscriptions")
      .update({ last_success_at: new Date().toISOString(), last_error: null })
      .eq("id", sub.id);
  } catch (e) {
    console.log(`  result: FAIL — ${e.message} (status ${e.statusCode ?? "?"})\n`);
    if (e.statusCode === 404 || e.statusCode === 410) {
      await db
        .from("push_subscriptions")
        .update({ is_active: false, last_error: e.message })
        .eq("id", sub.id);
    }
  }
}

console.log("Done. Check your device notification center (not only popups).");
