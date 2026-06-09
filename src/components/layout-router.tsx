"use client";

import { usePathname } from "next/navigation";
import Header from "./header";
import Footer from "./footer";
import ScrollToHash from "./scroll";
import Sidebar from "@/components/platform/sidebar";
import Topbar from "@/components/platform/topbar";
import PlatformTourHost from "@/components/app-tour/platform-tour-host";
import CampaignNotificationHost from "@/components/platform/campaign-notification-host";
import NotificationOptInHost from "@/components/platform/notification-opt-in-host";
import PrizeUnlockNotificationHost from "@/components/platform/prize-unlock-notification-host";
import PushSubscriptionHost from "@/components/platform/push-subscription-host";
import ServiceWorkerRegister from "@/components/platform/service-worker-register";
import NotificationPermissionPrompt from "@/components/platform/notification-permission-prompt";
import AppSessionResumeHost from "@/components/app-session-resume-host";
import { BravooCredit } from "@/components/bravoo-credit";

const platformRoutes = [
  "/book-gym",
  "/dashboard",
  "/ai-coach",
  "/supplements",
  "/challenges",
  "/community",
  "/gym-mode",
  "/giveaways",
  "/premium",
  "/settings",
];

const adminRoutes = ["/admin"];

const authRoutes = ["/login", "/signup"];
const onboardingRoutes = ["/onboarding"];

export default function LayoutRouter({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isAdmin = adminRoutes.some((r) => pathname.startsWith(r));
  const isPlatform = platformRoutes.some((r) => pathname.startsWith(r));
  const isAuth = authRoutes.some((r) => pathname === r);
  const isOnboarding = onboardingRoutes.some((r) => pathname.startsWith(r));

  if (isAdmin) {
    return <>{children}</>;
  }

  // Platform layout — sidebar + topbar
  if (isPlatform) {
    return (
      <div className="flex h-[100dvh] max-h-[100dvh] min-h-0 bg-surface overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <Topbar />
          <main
            id="rf-platform-main"
            className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain scrollbar-hide pb-[max(0px,env(safe-area-inset-bottom))]"
          >
            {children}
            <BravooCredit variant="app" className="text-center px-4" />
          </main>
        </div>
        <AppSessionResumeHost scrollRootId="rf-platform-main" />
        <ServiceWorkerRegister />
        <NotificationOptInHost />
        <CampaignNotificationHost />
        <PrizeUnlockNotificationHost />
        <PushSubscriptionHost />
        <NotificationPermissionPrompt />
        <PlatformTourHost />
      </div>
    );
  }

  // Auth layout — clean centered
  if (isAuth) {
    return (
      <div className="min-h-[100dvh] bg-surface flex flex-col px-4 py-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="flex-1 flex items-center justify-center w-full">{children}</div>
        <BravooCredit variant="minimal" className="text-center pb-2 shrink-0" />
      </div>
    );
  }

  // Onboarding — full screen
  if (isOnboarding) {
    return (
      <div className="min-h-[100dvh] bg-surface flex flex-col pb-[max(0px,env(safe-area-inset-bottom))]">
        <div className="flex-1">{children}</div>
        <BravooCredit variant="minimal" className="text-center py-4 shrink-0" />
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
