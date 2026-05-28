/** Pure date helpers — safe to import from client bundles. */

export function startOfTodayUtc(): string {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  return start.toISOString();
}

export function startOfUtcDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export function utcDayDiff(from: Date, to: Date): number {
  const fromStart = startOfUtcDay(from).getTime();
  const toStart = startOfUtcDay(to).getTime();
  return Math.round((toStart - fromStart) / (24 * 60 * 60 * 1000));
}
