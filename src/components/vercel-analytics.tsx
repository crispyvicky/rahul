"use client";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

/**
 * Web Analytics + Speed Insights (active on Vercel production by default).
 * Enable in Vercel project → Analytics → Web Analytics.
 */
export default function VercelAnalytics() {
  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
