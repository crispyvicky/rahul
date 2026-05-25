"use client";

import dynamic from "next/dynamic";

const VercelAnalytics = dynamic(() => import("@/components/vercel-analytics"), {
  ssr: false,
});

/** Loads analytics after hydration — keeps them off the critical path. */
export default function DeferredAnalytics() {
  return <VercelAnalytics />;
}
