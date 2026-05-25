"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  loadScrollForPath,
  saveScrollForPath,
} from "@/lib/app-session-resume";

/**
 * Restores platform main scroll after reload / bfcache / returning from a call.
 * Attach to the scrollable <main> in platform layout.
 */
export default function AppSessionResumeHost({
  scrollRootId = "rf-platform-main",
}: {
  scrollRootId?: string;
}) {
  const pathname = usePathname();
  const restoredRef = useRef<string | null>(null);

  useEffect(() => {
    const el = document.getElementById(scrollRootId);
    if (!el) return;

    const save = () => {
      saveScrollForPath(pathname, el.scrollTop);
    };

    const restore = () => {
      if (restoredRef.current === pathname) return;
      const y = loadScrollForPath(pathname);
      if (y == null || y <= 0) return;
      restoredRef.current = pathname;
      requestAnimationFrame(() => {
        el.scrollTop = y;
      });
    };

    restore();

    const onScroll = () => {
      window.clearTimeout((onScroll as { t?: number }).t);
      (onScroll as { t?: number }).t = window.setTimeout(save, 120);
    };

    el.addEventListener("scroll", onScroll, { passive: true });

    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) restore();
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") restore();
    };
    const onHide = () => save();

    window.addEventListener("pageshow", onPageShow);
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("pagehide", onHide);
    document.addEventListener("visibilitychange", onHide);

    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("pageshow", onPageShow);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("pagehide", onHide);
      document.removeEventListener("visibilitychange", onHide);
      save();
    };
  }, [pathname, scrollRootId]);

  return null;
}
