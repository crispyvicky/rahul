"use client";

import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[100dvh] bg-black flex flex-col items-center justify-center px-8 text-center">
      <AlertTriangle className="w-12 h-12 text-white mb-6 stroke-[1.5]" aria-hidden />
      <h1 className="text-white text-2xl sm:text-3xl font-black mb-3">
        This page couldn&apos;t load
      </h1>
      <p className="text-[#96979c] text-sm mb-8 max-w-sm">
        Reload to try again, or go back.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          type="button"
          onClick={() => reset()}
          className="px-8 py-3 bg-white text-black font-bold text-sm uppercase tracking-wide"
        >
          Reload
        </button>
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-8 py-3 border border-white/30 text-white font-bold text-sm uppercase tracking-wide"
        >
          Back
        </button>
      </div>
    </div>
  );
}
