import { getSupabaseAdmin, hasSupabaseAdmin } from "./supabase-admin";
import {
  renderEmailTemplate,
  type EmailTemplateData,
  type EmailTemplateId,
} from "./email-templates";
import { isMailConfigured, sendMailMessage } from "./mailer";

const MAX_ATTEMPTS = 5;
const DEFAULT_BATCH = 20;

export type EmailQueuePayload = {
  channel: "email";
  template: EmailTemplateId;
  to: string;
  data: EmailTemplateData;
  _attempts?: number;
  last_error?: string;
};

type QueueRow = {
  id: string;
  user_id: string | null;
  notification_type: string;
  title: string;
  body: string | null;
  payload: EmailQueuePayload | Record<string, unknown>;
  status: string;
  scheduled_for: string;
};

export async function enqueueEmailJob(params: {
  template: EmailTemplateId;
  to: string;
  data: EmailTemplateData;
  title: string;
  userId?: string | null;
  scheduledFor?: Date;
}): Promise<{ ok: boolean; id?: string; skipped?: boolean }> {
  if (!hasSupabaseAdmin()) {
    console.warn("[notification-queue] admin client unavailable, skipping enqueue");
    return { ok: false, skipped: true };
  }

  const payload: EmailQueuePayload = {
    channel: "email",
    template: params.template,
    to: params.to.trim(),
    data: params.data,
  };

  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("notification_queue")
    .insert({
      user_id: params.userId ?? null,
      notification_type: "email",
      title: params.title,
      body: null,
      payload,
      status: "pending",
      scheduled_for: (params.scheduledFor ?? new Date()).toISOString(),
    })
    .select("id")
    .single();

  if (error) {
    console.error("[notification-queue] enqueue failed:", error.message);
    return { ok: false };
  }

  return { ok: true, id: data.id as string };
}

export async function processPendingNotifications(
  limit = DEFAULT_BATCH
): Promise<{ processed: number; sent: number; failed: number; skipped: number }> {
  const stats = { processed: 0, sent: 0, failed: 0, skipped: 0 };

  if (!hasSupabaseAdmin()) {
    return stats;
  }

  if (!isMailConfigured()) {
    console.warn("[notification-queue] SMTP not configured, skipping batch");
    return stats;
  }

  const db = getSupabaseAdmin();
  const now = new Date().toISOString();

  const { data: rows, error } = await db
    .from("notification_queue")
    .select("id, user_id, notification_type, title, body, payload, status, scheduled_for")
    .eq("status", "pending")
    .lte("scheduled_for", now)
    .order("scheduled_for", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("[notification-queue] fetch failed:", error.message);
    return stats;
  }

  if (!rows?.length) return stats;

  for (const row of rows as QueueRow[]) {
    stats.processed += 1;
    const result = await processOneRow(db, row);
    if (result === "sent") stats.sent += 1;
    else if (result === "failed") stats.failed += 1;
    else stats.skipped += 1;
  }

  return stats;
}

async function processOneRow(
  db: ReturnType<typeof getSupabaseAdmin>,
  row: QueueRow
): Promise<"sent" | "failed" | "skipped"> {
  const payload = row.payload as EmailQueuePayload;

  if (payload?.channel !== "email" || !payload.template || !payload.to) {
    await markRow(db, row.id, "failed");
    return "failed";
  }

  try {
    const rendered = renderEmailTemplate(payload.template, payload.data ?? {});
    await sendMailMessage({
      to: payload.to,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
      fromBrand: rendered.fromBrand,
    });
    await markRow(db, row.id, "sent");
    return "sent";
  } catch (err) {
    const message = err instanceof Error ? err.message : "send_failed";
    const attempts = (payload._attempts ?? 0) + 1;
    const nextPayload: EmailQueuePayload = {
      ...payload,
      _attempts: attempts,
      last_error: message,
    };

    if (attempts >= MAX_ATTEMPTS) {
      await markRow(db, row.id, "failed", nextPayload);
      return "failed";
    }

    const retryAt = new Date(Date.now() + attempts * 60_000).toISOString();
    await db
      .from("notification_queue")
      .update({
        status: "pending",
        scheduled_for: retryAt,
        payload: nextPayload,
      })
      .eq("id", row.id);

    console.warn(`[notification-queue] retry ${attempts}/${MAX_ATTEMPTS} for ${row.id}:`, message);
    return "skipped";
  }
}

async function markRow(
  db: ReturnType<typeof getSupabaseAdmin>,
  id: string,
  status: "sent" | "failed",
  payload?: EmailQueuePayload | Record<string, unknown>
) {
  const patch: Record<string, unknown> = {
    status,
    sent_at: status === "sent" ? new Date().toISOString() : null,
  };
  if (payload) patch.payload = payload;

  await db.from("notification_queue").update(patch).eq("id", id);
}

/** Enqueue multiple emails and optionally drain the queue after the HTTP response. */
export async function enqueueEmailBatch(
  jobs: Array<{
    template: EmailTemplateId;
    to: string;
    data: EmailTemplateData;
    title: string;
    userId?: string | null;
  }>
): Promise<string[]> {
  const ids: string[] = [];
  for (const job of jobs) {
    const { ok, id } = await enqueueEmailJob(job);
    if (ok && id) ids.push(id);
  }
  return ids;
}
