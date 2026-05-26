"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const RELOAD_KEY = "rf_route_reload_v1";

function shouldReloadForChunkError(value: unknown): boolean {
  const msg = String(
    (value as Error)?.message ?? value ?? ""
  );
  return /Loading chunk|ChunkLoadError|Failed to fetch dynamically imported module|Importing a module script failed/i.test(
    msg
  );
}

/**
 * Recovers from stale PWA chunks and bfcache restores after tab switches / calls.
 */
export default function PwaRouteRecovery() {
  const router = useRouter();

  useEffect(() => {
    const reloadOnce = (reason: string) => {
      if (sessionStorage.getItem(RELOAD_KEY) === reason) return;
      sessionStorage.setItem(RELOAD_KEY, reason);
      window.location.reload();
    };

    const onRejection = (event: PromiseRejectionEvent) => {
      if (!shouldReloadForChunkError(event.reason)) return;
      event.preventDefault();
      reloadOnce("chunk");
    };

    const onError = (event: ErrorEvent) => {
      if (!shouldReloadForChunkError(event.message)) return;
      event.preventDefault();
      reloadOnce("chunk");
    };

    const onOnline = () => {
      sessionStorage.removeItem(RELOAD_KEY);
    };

    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) router.refresh();
    };

    window.addEventListener("unhandledrejection", onRejection);
    window.addEventListener("error", onError);
    window.addEventListener("online", onOnline);
    window.addEventListener("pageshow", onPageShow);

    return () => {
      window.removeEventListener("unhandledrejection", onRejection);
      window.removeEventListener("error", onError);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [router]);

  return null;
}
