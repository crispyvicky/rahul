"use client";

import { useEffect } from "react";

/** Ensures /sw.js is registered (needed for push in local dev with ENABLE_PWA_DEV). */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    (async () => {
      try {
        const existing = await navigator.serviceWorker.getRegistration();
        if (!existing) {
          await navigator.serviceWorker.register("/sw.js", { scope: "/" });
        }
        await navigator.serviceWorker.ready;
      } catch (e) {
        console.warn("[sw] registration failed", e);
      }
    })();
  }, []);

  return null;
}
