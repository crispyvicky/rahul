"use client";

import { usePathname } from "next/navigation";
import Header from "./header";
import Footer from "./footer";
import ScrollToHash from "./scroll";
import Sidebar from "@/components/platform/sidebar";
import Topbar from "@/components/platform/topbar";

const platformRoutes = [
  "/dashboard",
  "/ai-coach",
  "/challenges",
  "/community",
  "/gym-mode",
  "/giveaways",
  "/premium",
  "/settings",
  "/admin",
];

const authRoutes = ["/login", "/signup"];
const onboardingRoutes = ["/onboarding"];

export default function LayoutRouter({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isPlatform = platformRoutes.some((r) => pathname.startsWith(r));
  const isAuth = authRoutes.some((r) => pathname === r);
  const isOnboarding = onboardingRoutes.some((r) => pathname.startsWith(r));

  // Platform layout — sidebar + topbar
  if (isPlatform) {
    return (
      <div className="flex h-[100dvh] max-h-[100dvh] min-h-0 bg-surface overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <Topbar />
          <main className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain scrollbar-hide pb-[max(0px,env(safe-area-inset-bottom))]">
            {children}
          </main>
        </div>
      </div>
    );
  }

  // Auth layout — clean centered
  if (isAuth) {
    return (
      <div className="min-h-[100dvh] bg-surface flex items-center justify-center px-4 py-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]">
        {children}
      </div>
    );
  }

  // Onboarding — full screen
  if (isOnboarding) {
    return (
      <div className="min-h-[100dvh] bg-surface pb-[max(0px,env(safe-area-inset-bottom))]">
        {children}
      </div>
    );
  }

  // Marketing layout — header + footer (existing pages)
  return (
    <div className="main-container">
      <ScrollToHash />
      <Header />
      {children}
      <Footer />
    </div>
  );
}
