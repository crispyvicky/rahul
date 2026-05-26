"use client";

import { useEffect, useState } from "react";

/** iOS Safari often never fires whileInView — keep content visible. */
export function useIosMotionFix(): boolean {
  const [forceVisible, setForceVisible] = useState(true);

  useEffect(() => {
    const isIOS =
      /iPad|iPhone|iPod/i.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    if (!isIOS) {
      setForceVisible(false);
      return;
    }

    setForceVisible(true);
    const reveal = () => setForceVisible(true);
    window.addEventListener("scroll", reveal, { passive: true });
    const t = window.setTimeout(reveal, 600);
    return () => {
      window.removeEventListener("scroll", reveal);
      window.clearTimeout(t);
    };
  }, []);

  return forceVisible;
}

/** Use with motion: initial={motionInitial(safe)} */
export function motionInitial(safe: boolean) {
  return safe ? false : undefined;
}

export const motionViewport = { once: true, amount: 0.12 as const };
