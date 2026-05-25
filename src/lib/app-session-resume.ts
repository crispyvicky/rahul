/** Session-scoped resume (survives tab reload / phone call interruptions). */

const RESUME_KEY = "rahulfitzz_app_resume_v1";
const SCROLL_KEY = "rahulfitzz_scroll_resume_v1";
const RESUME_TOAST_KEY = "rahulfitzz_resume_toast_v1";
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

export type AppResumeSnapshot = {
  pathname: string;
  savedAt: number;
  routeState?: Record<string, unknown>;
};

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function saveRouteResume(pathname: string, routeState: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  const snapshot: AppResumeSnapshot = {
    pathname,
    savedAt: Date.now(),
    routeState,
  };
  sessionStorage.setItem(RESUME_KEY, JSON.stringify(snapshot));
}

export function saveScrollForPath(pathname: string, scrollY: number): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(
    SCROLL_KEY,
    JSON.stringify({ pathname, scrollY: Math.max(0, Math.round(scrollY)), savedAt: Date.now() })
  );
}

export function loadScrollForPath(pathname: string): number | null {
  const data = safeParse<{ pathname: string; scrollY: number; savedAt: number }>(
    typeof window !== "undefined" ? sessionStorage.getItem(SCROLL_KEY) : null
  );
  if (!data || data.pathname !== pathname) return null;
  if (Date.now() - data.savedAt > MAX_AGE_MS) return null;
  return data.scrollY;
}

export function loadAppResume(): AppResumeSnapshot | null {
  const data = safeParse<AppResumeSnapshot>(
    typeof window !== "undefined" ? sessionStorage.getItem(RESUME_KEY) : null
  );
  if (!data?.pathname || !data.savedAt) return null;
  if (Date.now() - data.savedAt > MAX_AGE_MS) {
    clearAppResume();
    return null;
  }
  return data;
}

export function loadRouteState<T extends Record<string, unknown>>(
  pathname: string
): T | null {
  const snap = loadAppResume();
  if (!snap || snap.pathname !== pathname || !snap.routeState) return null;
  return snap.routeState as T;
}

export function clearAppResume(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(RESUME_KEY);
  sessionStorage.removeItem(SCROLL_KEY);
}

/** True when user likely returned from background within a short window. */
export function shouldShowResumeToast(pathname: string): boolean {
  const snap = loadAppResume();
  if (!snap || snap.pathname !== pathname) return false;
  if (Date.now() - snap.savedAt > 30 * 60 * 1000) return false;
  if (sessionStorage.getItem(RESUME_TOAST_KEY) === pathname) return false;
  sessionStorage.setItem(RESUME_TOAST_KEY, pathname);
  return true;
}
