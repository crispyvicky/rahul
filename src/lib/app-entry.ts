/** Marketing CTAs: signed-in users enter the app; others go to login. */
export function getAppEntryHref(isLoggedIn: boolean): string {
  return isLoggedIn ? "/dashboard" : "/login";
}

export function getWorkoutPlanHref(isLoggedIn: boolean): string {
  return isLoggedIn ? "/gym-mode" : "/login";
}

export function getDietPlanHref(isLoggedIn: boolean): string {
  return isLoggedIn ? "/ai-coach" : "/login";
}
