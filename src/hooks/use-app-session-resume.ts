"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import toast from "react-hot-toast";
import {
  loadRouteState,
  saveRouteResume,
  shouldShowResumeToast,
} from "@/lib/app-session-resume";

type Options<T extends Record<string, unknown>> = {
  /** Route prefix, e.g. `/ai-coach` */
  routeKey: string;
  state: T;
  /** Called once on mount when saved state exists */
  onRestore: (saved: T) => void;
  /** Dependencies that trigger re-save */
  deps?: unknown[];
  /** Show a short toast when resuming */
  showToast?: boolean;
};

/**
 * Persists page UI state to sessionStorage so a reload or phone-call
 * interruption does not reset the user's place in the flow.
 */
export function useAppSessionResume<T extends Record<string, unknown>>({
  routeKey,
  state,
  onRestore,
  deps = [],
  showToast = true,
}: Options<T>) {
  const pathname = usePathname();
  const restoredRef = useRef(false);
  const onRestoreRef = useRef(onRestore);
  onRestoreRef.current = onRestore;

  useEffect(() => {
    if (!pathname.startsWith(routeKey) || restoredRef.current) return;
    const saved = loadRouteState<T>(routeKey);
    if (saved) {
      restoredRef.current = true;
      onRestoreRef.current(saved);
      if (showToast && shouldShowResumeToast(routeKey)) {
        toast.success("Welcome back — picked up where you left off", {
          id: "resume-toast",
          duration: 3200,
        });
      }
    }
  }, [pathname, routeKey, showToast]);

  useEffect(() => {
    if (!pathname.startsWith(routeKey)) return;

    const persist = () => {
      saveRouteResume(routeKey, state as Record<string, unknown>);
    };

    persist();
    const t = window.setTimeout(persist, 400);

    const onHide = () => persist();
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", onHide);

    return () => {
      window.clearTimeout(t);
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", onHide);
      persist();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, routeKey, ...deps]);
}
