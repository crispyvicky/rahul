"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Hand, X, ChevronRight } from "lucide-react";
import { useUserStore } from "@/store/use-user-store";
import {
  type TourStep,
  type TourPlacement,
  dispatchCloseMobileMenu,
  dispatchOpenMobileMenu,
  getStepsForPath,
  isTourCompleted,
  markTourCompleted,
  TOUR_REPLAY_FLAG,
} from "@/lib/app-tour";
import { cn } from "@/lib/utils";

type Rect = { top: number; left: number; width: number; height: number };

const MOBILE_BREAKPOINT = 1024;
const SAFE = 12;
const SPOTLIGHT_PAD = 8;

function queryTarget(selector: string): HTMLElement | null {
  return document.querySelector(selector) as HTMLElement | null;
}

/** Sidebar links are unmounted until the mobile drawer opens */
async function waitForTarget(selector: string, maxMs = 1400): Promise<HTMLElement | null> {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    const el = queryTarget(selector);
    if (el) {
      const r = el.getBoundingClientRect();
      if (r.width > 8 && r.height > 8 && r.left > -20) return el;
    }
    await new Promise((r) => setTimeout(r, 60));
  }
  return null;
}

async function ensureMobileMenuForStep(step: TourStep, isMobile: boolean) {
  if (!isMobile) return;
  if (step.openMobileMenu || step.showOpenMenuAction) {
    dispatchOpenMobileMenu();
    await new Promise((r) => setTimeout(r, 520));
  } else {
    dispatchCloseMobileMenu();
    await new Promise((r) => setTimeout(r, 120));
  }
}

function measureRect(el: HTMLElement | null): Rect | null {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

function clampTooltip(
  placement: TourPlacement,
  target: Rect | null,
  tooltipW: number,
  tooltipH: number
): { top: number; left: number; placement: TourPlacement } {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const maxW = Math.min(tooltipW, vw - SAFE * 2);

  if (!target || placement === "center") {
    return {
      top: Math.max(SAFE, (vh - tooltipH) / 2),
      left: Math.max(SAFE, (vw - maxW) / 2),
      placement: "center",
    };
  }

  const preferBottom = target.top + target.height + 16 + tooltipH < vh - SAFE;
  let resolved: TourPlacement = placement;

  if (resolved === "right" && vw < MOBILE_BREAKPOINT) {
    resolved = preferBottom ? "bottom" : "top";
  }

  let top = 0;
  let left = 0;

  if (resolved === "bottom") {
    top = target.top + target.height + 16;
    left = target.left + target.width / 2 - maxW / 2;
  } else if (resolved === "top") {
    top = target.top - tooltipH - 16;
    left = target.left + target.width / 2 - maxW / 2;
  } else if (resolved === "right") {
    top = target.top + target.height / 2 - tooltipH / 2;
    left = target.left + target.width + 16;
  } else {
    top = target.top + target.height / 2 - tooltipH / 2;
    left = target.left - maxW - 16;
  }

  return {
    top: Math.min(Math.max(SAFE, top), vh - tooltipH - SAFE),
    left: Math.min(Math.max(SAFE, left), vw - maxW - SAFE),
    placement: resolved,
  };
}

function fingerPosition(placement: TourPlacement, target: Rect): React.CSSProperties {
  const size = 36;
  if (placement === "bottom") {
    return { top: target.top + target.height + 4, left: target.left + target.width / 2 - size / 2 };
  }
  if (placement === "top") {
    return { top: target.top - size - 4, left: target.left + target.width / 2 - size / 2 };
  }
  if (placement === "right") {
    return { top: target.top + target.height / 2 - size / 2, left: target.left + target.width + 4 };
  }
  return { top: target.top + target.height / 2 - size / 2, left: target.left - size - 4 };
}

type AppTourProps = {
  /** Force tour open (e.g. help button) */
  forceOpen?: boolean;
  onForceOpenHandled?: () => void;
};

export default function AppTour({ forceOpen, onForceOpenHandled }: AppTourProps) {
  const maskId = useId().replace(/:/g, "");
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { user, isAuthenticated } = useUserStore();

  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [spotlight, setSpotlight] = useState<Rect | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const [resolvedPlacement, setResolvedPlacement] = useState<TourPlacement>("center");
  const tooltipRef = useRef<HTMLDivElement>(null);

  const userKey =
    user?.id ||
    (session?.user?.email as string | undefined) ||
    (session?.user?.id as string | undefined) ||
    "guest";

  const allSteps = getStepsForPath(pathname);
  const steps = useMemo(
    () => (isMobile ? allSteps : allSteps.filter((s) => s.id !== "menu")),
    [allSteps, isMobile]
  );
  const step = steps[stepIndex];

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const endTour = useCallback(
    (completed: boolean) => {
      if (completed) markTourCompleted(userKey);
      dispatchCloseMobileMenu();
      setActive(false);
      setStepIndex(0);
      setSpotlight(null);
      document.body.style.overflow = "";
    },
    [userKey]
  );

  useEffect(() => {
    if (!forceOpen) return;
    setStepIndex(0);
    setActive(true);
    document.body.style.overflow = "hidden";
    onForceOpenHandled?.();
  }, [forceOpen, onForceOpenHandled]);

  useEffect(() => {
    if (status === "loading" || forceOpen) return;
    if (!session?.user && !isAuthenticated) return;
    if (!pathname.startsWith("/dashboard")) return;

    const replayPending =
      typeof window !== "undefined" &&
      sessionStorage.getItem(TOUR_REPLAY_FLAG) === "1";
    if (replayPending) {
      sessionStorage.removeItem(TOUR_REPLAY_FLAG);
      setStepIndex(0);
      setActive(true);
      document.body.style.overflow = "hidden";
      return;
    }

    if (isTourCompleted(userKey)) return;

    const t = window.setTimeout(() => {
      setActive(true);
      document.body.style.overflow = "hidden";
    }, 700);
    return () => window.clearTimeout(t);
  }, [status, session?.user, isAuthenticated, pathname, userKey, forceOpen]);

  const layoutStep = useCallback(async () => {
    if (!active || !step) return;

    await ensureMobileMenuForStep(step, isMobile);

    let el: HTMLElement | null = null;
    if (step.target) {
      el = step.openMobileMenu
        ? await waitForTarget(step.target)
        : queryTarget(step.target);
      if (el) {
        el.scrollIntoView({ block: "center", inline: "nearest", behavior: "smooth" });
        await new Promise((r) => setTimeout(r, 280));
        el = step.openMobileMenu
          ? (await waitForTarget(step.target, 600)) ?? el
          : queryTarget(step.target);
      }
    }

    const rect = measureRect(el);
    setSpotlight(rect);

    const placement = step.placement ?? (rect ? "bottom" : "center");
    const tw = tooltipRef.current?.offsetWidth ?? Math.min(320, window.innerWidth - 24);
    const th = tooltipRef.current?.offsetHeight ?? 220;
    const pos = clampTooltip(placement, rect, tw, th);
    setTooltipPos({ top: pos.top, left: pos.left });
    setResolvedPlacement(pos.placement);
  }, [active, step, isMobile]);

  useLayoutEffect(() => {
    layoutStep();
  }, [layoutStep, stepIndex]);

  useEffect(() => {
    if (!active) return;
    const onReflow = () => layoutStep();
    window.addEventListener("resize", onReflow);
    window.addEventListener("scroll", onReflow, true);
    return () => {
      window.removeEventListener("resize", onReflow);
      window.removeEventListener("scroll", onReflow, true);
    };
  }, [active, layoutStep]);

  const goNext = () => {
    if (stepIndex >= steps.length - 1) {
      endTour(true);
      return;
    }
    const current = steps[stepIndex];
    if (isMobile && current?.id === "menu") {
      dispatchOpenMobileMenu();
    }
    setStepIndex((i) => i + 1);
  };

  const handleOpenMenu = () => {
    dispatchOpenMobileMenu();
    if (step.target === '[data-tour="mobile-menu"]') return;
    void layoutStep();
  };

  if (!active || !step || steps.length === 0) return null;

  const showSpotlight = Boolean(step.target && spotlight);

  return (
    <div
      className="fixed inset-0 z-[220]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="app-tour-title"
    >
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <mask id={maskId}>
            <rect width="100%" height="100%" fill="white" />
            {showSpotlight && spotlight && (
              <rect
                x={spotlight.left - SPOTLIGHT_PAD}
                y={spotlight.top - SPOTLIGHT_PAD}
                width={spotlight.width + SPOTLIGHT_PAD * 2}
                height={spotlight.height + SPOTLIGHT_PAD * 2}
                rx={14}
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(0,0,0,0.85)" mask={`url(#${maskId})`} />
      </svg>

      {showSpotlight && spotlight && (
        <>
          <div
            className="fixed pointer-events-none z-[221] rounded-2xl ring-2 ring-brand"
            style={{
              top: spotlight.top - SPOTLIGHT_PAD,
              left: spotlight.left - SPOTLIGHT_PAD,
              width: spotlight.width + SPOTLIGHT_PAD * 2,
              height: spotlight.height + SPOTLIGHT_PAD * 2,
              boxShadow: "0 0 0 4px rgba(235, 0, 0, 0.2)",
            }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed z-[222] pointer-events-none text-brand"
            style={fingerPosition(resolvedPlacement, spotlight)}
          >
            <Hand className="w-9 h-9 -rotate-[25deg] animate-bounce" strokeWidth={2.5} />
          </motion.div>
        </>
      )}

      <motion.div
        ref={tooltipRef}
        key={step.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "fixed z-[223] w-[min(calc(100vw-1.5rem),22rem)]",
          "bg-surface-card border border-white/10 rounded-2xl shadow-2xl p-4 sm:p-5",
          "max-h-[min(75dvh,28rem)] overflow-y-auto overscroll-contain"
        )}
        style={{
          top: tooltipPos.top,
          left: tooltipPos.left,
          paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
        }}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <p className="text-text-muted text-[10px] font-bold uppercase tracking-[0.25em]">
            Step {stepIndex + 1} of {steps.length}
          </p>
          <button
            type="button"
            onClick={() => endTour(true)}
            className="min-h-10 min-w-10 rounded-xl flex items-center justify-center text-text-secondary hover:text-white touch-manipulation"
            aria-label="Close tour"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <h2 id="app-tour-title" className="text-white font-bold text-base leading-snug mb-2">
          {step.title}
        </h2>
        <p className="text-text-secondary text-sm leading-relaxed">{step.body}</p>
        {isMobile && (step.showOpenMenuAction || step.openMobileMenu) && (
          <button
            type="button"
            onClick={handleOpenMenu}
            className="mt-4 w-full min-h-11 px-4 rounded-xl border border-brand/40 bg-brand/10 text-brand text-xs font-bold uppercase tracking-widest touch-manipulation"
          >
            Open menu
          </button>
        )}
        <div className="flex flex-col gap-2 mt-5 sm:flex-row">
          <button
            type="button"
            onClick={() => endTour(true)}
            className="min-h-11 flex-1 px-4 rounded-xl border border-white/10 text-text-secondary text-xs font-bold uppercase tracking-widest hover:bg-white/5 touch-manipulation"
          >
            Skip tour
          </button>
          <button
            type="button"
            onClick={goNext}
            className="min-h-11 flex-1 px-4 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-1 touch-manipulation"
          >
            {stepIndex >= steps.length - 1 ? "Got it" : "Next"}
            {stepIndex < steps.length - 1 && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
