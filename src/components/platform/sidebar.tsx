"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  CalendarCheck,
  Brain,
  Swords,
  Users,
  Dumbbell,
  Crown,
  Gift,
  Settings,
  LogOut,
  ChevronLeft,
  Flame,
  Menu,
  X,
} from "lucide-react";
import { useUserStore } from "@/store/use-user-store";
import { cn } from "@/lib/utils";
import {
  TOUR_CLOSE_MENU_EVENT,
  TOUR_OPEN_MENU_EVENT,
  dispatchTourMenuState,
} from "@/lib/app-tour";

const tourAttr: Record<string, string> = {
  "/dashboard": "nav-dashboard",
  "/book-gym": "nav-book-gym",
  "/ai-coach": "nav-ai-coach",
  "/challenges": "nav-challenges",
  "/community": "nav-community",
  "/gym-mode": "nav-gym-mode",
  "/giveaways": "nav-giveaways",
  "/premium": "nav-premium",
};

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/book-gym", icon: CalendarCheck, label: "Gym Booking", badge: "NEW" as const },
  { href: "/ai-coach", icon: Brain, label: "AI Coach" },
  { href: "/challenges", icon: Swords, label: "Challenges" },
  { href: "/community", icon: Users, label: "Community" },
  { href: "/gym-mode", icon: Dumbbell, label: "Gym Mode" },
  { href: "/giveaways", icon: Gift, label: "Giveaways" },
  { href: "/premium", icon: Crown, label: "Premium" },
];

const bottomItems = [
  { href: "/settings", icon: Settings, label: "Settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useUserStore();

  useEffect(() => {
    dispatchTourMenuState(mobileOpen);
  }, [mobileOpen]);

  useEffect(() => {
    const open = () => setMobileOpen(true);
    const close = () => setMobileOpen(false);
    window.addEventListener(TOUR_OPEN_MENU_EVENT, open);
    window.addEventListener(TOUR_CLOSE_MENU_EVENT, close);
    return () => {
      window.removeEventListener(TOUR_OPEN_MENU_EVENT, open);
      window.removeEventListener(TOUR_CLOSE_MENU_EVENT, close);
    };
  }, []);

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-6 border-b border-white/5">
        <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center shrink-0">
          <Flame className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-white font-heading font-bold text-lg tracking-tight"
          >
            RahulFitzz
          </motion.span>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              data-tour={tourAttr[item.href]}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-3 min-h-[44px] rounded-xl transition-all duration-200 group relative no-underline touch-manipulation",
                isActive
                  ? "bg-brand/10 text-white"
                  : "text-text-secondary hover:text-white hover:bg-white/5"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-brand rounded-r-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <item.icon
                className={cn(
                  "w-5 h-5 shrink-0 transition-colors",
                  isActive ? "text-brand" : "text-text-secondary group-hover:text-white"
                )}
              />
              {!collapsed && (
                <span className="text-sm font-medium truncate">
                  {item.label}
                </span>
              )}
              {item.href === "/premium" && !collapsed && (
                <span className="ml-auto text-[9px] font-bold uppercase tracking-wider bg-brand/20 text-brand px-2 py-0.5 rounded-full">
                  Pro
                </span>
              )}
              {"badge" in item && item.badge === "NEW" && !collapsed && (
                <span className="ml-auto text-[9px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                  NEW
                </span>
              )}
              {item.href === "/giveaways" && !collapsed && (
                <span className="ml-auto text-[9px] font-bold uppercase tracking-wider bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full animate-pulse">
                  🎁 HOT
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-white/5 space-y-1">
        {bottomItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-3 min-h-[44px] rounded-xl transition-all duration-200 no-underline touch-manipulation",
                isActive
                  ? "bg-brand/10 text-white"
                  : "text-text-secondary hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </Link>
          );
        })}

        <button
          onClick={async () => {
            logout();
            setMobileOpen(false);
            await signOut({ callbackUrl: window.location.origin });
          }}
          className="flex items-center gap-3 px-3 py-3 min-h-[44px] rounded-xl transition-all duration-200 text-text-secondary hover:text-red-400 hover:bg-red-500/5 w-full touch-manipulation"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && (
            <span className="text-sm font-medium">Logout</span>
          )}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 256 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="hidden lg:flex flex-col bg-surface-card border-r border-white/5 h-full relative shrink-0"
      >
        <SidebarContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-surface-elevated border border-white/10 rounded-full flex items-center justify-center text-text-secondary hover:text-white transition-colors z-10"
        >
          <ChevronLeft
            className={cn(
              "w-3 h-3 transition-transform",
              collapsed && "rotate-180"
            )}
          />
        </button>
      </motion.aside>

      {/* Mobile hamburger */}
      <button
        type="button"
        data-tour="mobile-menu"
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed z-[230] min-h-11 min-w-11 h-11 w-11 left-[max(1rem,env(safe-area-inset-left))] top-[max(1rem,env(safe-area-inset-top))] bg-surface-card border border-white/10 rounded-xl flex items-center justify-center text-white touch-manipulation"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-[225]"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-[min(280px,85vw)] max-w-[100vw] bg-surface-card border-r border-white/5 z-[230] flex flex-col pb-[env(safe-area-inset-bottom)]"
            >
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="absolute top-[max(1rem,env(safe-area-inset-top))] right-[max(1rem,env(safe-area-inset-right))] min-h-11 min-w-11 h-11 w-11 bg-white/5 rounded-xl flex items-center justify-center text-text-secondary hover:text-white touch-manipulation"
              >
                <X className="w-4 h-4" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
