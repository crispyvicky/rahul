/**
 * In-memory sliding-window rate limit for /api/ai-coach.
 * Protects Vertex/Gemini spend from bursts and accidental loops.
 *
 * Limits apply per client IP (from x-forwarded-for / x-real-ip).
 * On multi-instance deployments, use a shared store (Redis/Upstash) for global limits.
 *
 * Optional env (defaults are conservative for a personal/small app):
 *   AI_RATE_LIMIT_TEXT_MAX=12
 *   AI_RATE_LIMIT_TEXT_WINDOW_SEC=600
 *   AI_RATE_LIMIT_VISION_MAX=6
 *   AI_RATE_LIMIT_VISION_WINDOW_SEC=900
 */

export type AiRateBucket = "text" | "vision";

const textMax = Math.max(1, parseInt(process.env.AI_RATE_LIMIT_TEXT_MAX || "12", 10) || 12);
const textWindowMs =
  Math.max(60_000, (parseInt(process.env.AI_RATE_LIMIT_TEXT_WINDOW_SEC || "600", 10) || 600) * 1000);

const visionMax = Math.max(1, parseInt(process.env.AI_RATE_LIMIT_VISION_MAX || "6", 10) || 6);
const visionWindowMs =
  Math.max(60_000, (parseInt(process.env.AI_RATE_LIMIT_VISION_WINDOW_SEC || "900", 10) || 900) * 1000);

const hits = new Map<string, number[]>();

function prune(ts: number[], windowMs: number, now: number) {
  const cutoff = now - windowMs;
  while (ts.length > 0 && (ts[0] as number) < cutoff) ts.shift();
}

function config(bucket: AiRateBucket) {
  return bucket === "vision"
    ? { max: visionMax, windowMs: visionWindowMs }
    : { max: textMax, windowMs: textWindowMs };
}

export function getAiClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first.slice(0, 128);
  }
  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp.slice(0, 128);
  return "unknown";
}

export function consumeAiRateLimit(
  ip: string,
  bucket: AiRateBucket
): { ok: true } | { ok: false; retryAfterSec: number; message: string } {
  const { max, windowMs } = config(bucket);
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  let ts = hits.get(key);
  if (!ts) {
    ts = [];
    hits.set(key, ts);
  }
  prune(ts, windowMs, now);
  if (ts.length >= max) {
    const oldest = ts[0] ?? now;
    const retryAfterMs = Math.max(1000, oldest + windowMs - now);
    const retryAfterSec = Math.ceil(retryAfterMs / 1000);
    const label = bucket === "vision" ? "photo analysis" : "plan generation";
    return {
      ok: false,
      retryAfterSec,
      message: `Too many ${label} requests. Try again in about ${retryAfterSec}s.`,
    };
  }
  ts.push(now);
  return { ok: true };
}
