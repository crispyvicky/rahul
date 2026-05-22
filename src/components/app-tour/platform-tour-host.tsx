"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { HelpCircle } from "lucide-react";
import AppTour from "./app-tour";
import { clearTourCompleted, TOUR_REPLAY_FLAG } from "@/lib/app-tour";
import { useSession } from "next-auth/react";
import { useUserStore } from "@/store/use-user-store";

const platformPrefixes = [
  "/dashboard",
  "/book-gym",
  "/ai-coach",
  "/challenges",
  "/community",
  "/gym-mode",
  "/giveaways",
  "/premium",
  "/settings",
];

export default function PlatformTourHost() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const { user, isAuthenticated } = useUserStore();
  const [replay, setReplay] = useState(false);

  const isPlatform = platformPrefixes.some((p) => pathname.startsWith(p));
  if (!isPlatform) return null;
  if (!session?.user && !isAuthenticated) return null;

  const userKey =
    user?.id ||
    (session?.user?.email as string | undefined) ||
    (session?.user?.id as string | undefined) ||
    "guest";

  const handleReplay = () => {
    clearTourCompleted(userKey);
    if (!pathname.startsWith("/dashboard")) {
      sessionStorage.setItem(TOUR_REPLAY_FLAG, "1");
      router.push("/dashboard");
      return;
    }
    setReplay(true);
  };

  return (
    <>
      <AppTour forceOpen={replay} onForceOpenHandled={() => setReplay(false)} />
      <button
        type="button"
        onClick={handleReplay}
        className="fixed z-[90] bottom-[max(5.5rem,calc(4.5rem+env(safe-area-inset-bottom)))] right-[max(1rem,env(safe-area-inset-right))] lg:bottom-auto lg:top-[max(5.5rem,calc(4.5rem+env(safe-area-inset-top)))] lg:right-6 min-h-11 px-3.5 rounded-full bg-surface-card/95 border border-white/10 text-text-secondary hover:text-white hover:border-brand/40 shadow-lg flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest touch-manipulation backdrop-blur-md"
        aria-label="Replay app tour"
      >
        <HelpCircle className="w-4 h-4 text-brand shrink-0" />
        <span className="hidden sm:inline">Tour</span>
      </button>
    </>
  );
}
