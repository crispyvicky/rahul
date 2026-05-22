export const APP_TOUR_STORAGE_KEY = "rahulfitzz_app_tour_done_v1";
export const TOUR_REPLAY_FLAG = "rahulfitzz_tour_replay";
export const TOUR_OPEN_MENU_EVENT = "rahulfitzz-tour-open-menu";
export const TOUR_CLOSE_MENU_EVENT = "rahulfitzz-tour-close-menu";
export const TOUR_MENU_STATE_EVENT = "rahulfitzz-tour-menu-state";

export function dispatchTourMenuState(open: boolean) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(TOUR_MENU_STATE_EVENT, { detail: { open } })
  );
}

export type TourPlacement = "top" | "bottom" | "left" | "right" | "center";

export type TourStep = {
  id: string;
  /** CSS selector, usually [data-tour="..."] */
  target?: string;
  title: string;
  body: string;
  placement?: TourPlacement;
  /** Only run on paths that start with this (e.g. "/dashboard") */
  pathPrefix?: string;
  /** Open mobile drawer before highlighting sidebar links */
  openMobileMenu?: boolean;
  /** Show "Open menu" button on the tour card (mobile) */
  showOpenMenuAction?: boolean;
};

export const DASHBOARD_TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to RahulFitzz",
    body: "Quick tour in plain words — what to tap and where things live. Takes under a minute.",
    placement: "center",
    pathPrefix: "/dashboard",
  },
  {
    id: "menu",
    target: '[data-tour="mobile-menu"]',
    title: "Menu (phone)",
    body: "Pages like AI Coach live inside this menu. Tap Open menu below (or the ☰ button), then hit Next.",
    placement: "bottom",
    pathPrefix: "/dashboard",
    showOpenMenuAction: true,
  },
  {
    id: "nav-ai",
    target: '[data-tour="nav-ai-coach"]',
    title: "AI Coach",
    body: "Your personal coach. Pick workout, diet, or physique scan — then hit Generate for a plan made for you.",
    placement: "right",
    pathPrefix: "/dashboard",
    openMobileMenu: true,
  },
  {
    id: "nav-gym",
    target: '[data-tour="nav-gym-mode"]',
    title: "Gym Mode",
    body: "Log sets during real workouts. Your dashboard “Today’s workout” fills in from here.",
    placement: "right",
    pathPrefix: "/dashboard",
    openMobileMenu: true,
  },
  {
    id: "nav-challenges",
    target: '[data-tour="nav-challenges"]',
    title: "Challenges",
    body: "Squad challenges and daily check-ins (+15 pts). Coming soon — earn points here when it launches.",
    placement: "right",
    pathPrefix: "/dashboard",
    openMobileMenu: true,
  },
  {
    id: "nav-community",
    target: '[data-tour="nav-community"]',
    title: "Community",
    body: "Share progress, transformations, and tips. Posts can earn giveaway points for the prize sheet.",
    placement: "right",
    pathPrefix: "/dashboard",
    openMobileMenu: true,
  },
  {
    id: "nav-giveaways",
    target: '[data-tour="nav-giveaways"]',
    title: "Giveaways",
    body: "Claim points, see the leaderboard, and compete for the monthly grand prize.",
    placement: "right",
    pathPrefix: "/dashboard",
    openMobileMenu: true,
  },
  {
    id: "prizes-box",
    target: '[data-tour="dash-prizes-box"]',
    title: "Prize sheet",
    body: "Each row shows points needed for a prize. Giveaway points unlock these — XP is only for your level.",
    placement: "top",
    pathPrefix: "/dashboard",
    openMobileMenu: false,
  },
  {
    id: "quick-actions",
    target: '[data-tour="dash-quick-actions"]',
    title: "Quick shortcuts",
    body: "One-tap tiles to AI Coach, Gym Mode, Giveaways, and Community — fastest way around the app.",
    placement: "top",
    pathPrefix: "/dashboard",
    openMobileMenu: false,
  },
  {
    id: "generate",
    target: '[data-tour="dash-generate-plan"]',
    title: "Generate a plan",
    body: "Shortcut straight into AI Coach to build today’s workout or diet plan.",
    placement: "bottom",
    pathPrefix: "/dashboard",
  },
  {
    id: "streak",
    target: '[data-tour="dash-streak"]',
    title: "Streak & XP",
    body: "Streak keeps you consistent. XP levels you up — separate from giveaway points on the prize sheet.",
    placement: "bottom",
    pathPrefix: "/dashboard",
  },
  {
    id: "done",
    title: "You’re set",
    body: "Explore anytime. Open AI Coach when you’re ready for your first plan. Tap the Tour button (bottom-right) to see this guide again.",
    placement: "center",
    pathPrefix: "/dashboard",
  },
];

export function tourStorageKey(userKey: string) {
  return `${APP_TOUR_STORAGE_KEY}:${userKey}`;
}

export function isTourCompleted(userKey: string): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(tourStorageKey(userKey)) === "1";
}

export function markTourCompleted(userKey: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(tourStorageKey(userKey), "1");
}

export function clearTourCompleted(userKey: string) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(tourStorageKey(userKey));
}

export function dispatchOpenMobileMenu() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(TOUR_OPEN_MENU_EVENT));
}

export function dispatchCloseMobileMenu() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(TOUR_CLOSE_MENU_EVENT));
}

export function getStepsForPath(pathname: string): TourStep[] {
  if (pathname.startsWith("/dashboard")) return DASHBOARD_TOUR_STEPS;
  return [];
}
