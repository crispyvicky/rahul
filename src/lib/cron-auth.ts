/**
 * Verifies Vercel Cron (or manual ops) requests.
 * Set CRON_SECRET in Vercel env; cron sends Authorization: Bearer <CRON_SECRET>.
 */
export function verifyCronRequest(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;

  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}
