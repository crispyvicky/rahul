import { after } from "next/server";
import { processPendingNotifications } from "./notification-queue";

/**
 * Process queued emails after the response is sent (Vercel / Next 15+).
 * Cron still drains the queue if this fails or times out.
 */
export function scheduleNotificationDrain(): void {
  after(async () => {
    try {
      await processPendingNotifications(10);
    } catch (err) {
      console.error("[background] notification drain failed:", err);
    }
  });
}
