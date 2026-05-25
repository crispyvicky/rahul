"use client";

import { useEffect, useState, type ReactElement } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useUserStore } from "@/store/use-user-store";
import { cn } from "@/lib/utils";

const CUE_STORAGE_KEY = "rf_join_now_cue_v1";
const SHOW_AFTER_MS = 900;
const VISIBLE_MS = 14_000;

type Props = {
  children: ReactElement;
  className?: string;
  placement?: "below" | "left";
};

/** First visit on home — pulse + pointing hand on Join now (logged-out only). */
export default function JoinNowHighlight({
  children,
  className,
  placement = "below",
}: Props) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { user } = useUserStore();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (pathname !== "/" || session?.user || user) return;
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(CUE_STORAGE_KEY)) return;

    const showTimer = window.setTimeout(() => setShow(true), SHOW_AFTER_MS);
    const hideTimer = window.setTimeout(() => {
      sessionStorage.setItem(CUE_STORAGE_KEY, "1");
      setShow(false);
    }, SHOW_AFTER_MS + VISIBLE_MS);

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };
  }, [pathname, session?.user, user]);

  const dismiss = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(CUE_STORAGE_KEY, "1");
    }
    setShow(false);
  };

  return (
    <div
      className={cn("relative inline-flex max-w-full", className)}
      onClickCapture={show ? dismiss : undefined}
    >
      {show && (
        <>
          <span
            className="absolute -inset-1 border-2 border-[#eb0000] animate-pulse pointer-events-none z-20 rounded-sm"
            aria-hidden
          />
          <span
            className={cn(
              "absolute z-30 flex flex-col items-center gap-0.5 pointer-events-none select-none",
              placement === "below"
                ? "-bottom-10 sm:-bottom-11 left-1/2 -translate-x-1/2"
                : "-left-9 top-1/2 -translate-y-1/2"
            )}
            aria-hidden
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#eb0000] whitespace-nowrap">
              Start here
            </span>
            <span className="text-2xl leading-none rf-join-cue-finger" role="img" aria-label="Tap here">
              👆
            </span>
          </span>
        </>
      )}
      <div className={cn("relative z-10 w-full", show && "rf-join-cue-glow rounded-sm")}>
        {children}
      </div>
    </div>
  );
}
