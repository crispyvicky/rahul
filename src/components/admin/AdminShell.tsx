"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Trophy,
  Users,
  ScrollText,
  ClipboardCheck,
  MessageSquare,
  Gift,
  CalendarCheck,
  Bell,
  Package,
  Shield,
  LogOut,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BravooCredit } from "@/components/bravoo-credit";

const nav = [
  { id: "overview", label: "Overview", shortLabel: "Home", icon: LayoutDashboard },
  { id: "leaderboard", label: "Leaderboard", shortLabel: "Board", icon: Trophy },
  { id: "users", label: "Users", shortLabel: "Users", icon: Users },
  { id: "logs", label: "Point Logs", shortLabel: "Logs", icon: ScrollText },
  { id: "claims", label: "Claims", shortLabel: "Claims", icon: ClipboardCheck },
  { id: "redemptions", label: "Redemptions", shortLabel: "Redeem", icon: Package },
  { id: "community", label: "Community", shortLabel: "Posts", icon: MessageSquare },
  { id: "giveaways", label: "Giveaways", shortLabel: "Prizes", icon: Gift },
  { id: "prebookings", label: "Pre-bookings", shortLabel: "Book", icon: CalendarCheck },
  { id: "notifications", label: "Campaigns", shortLabel: "Push", icon: Bell },
];

export default function AdminShell({
  active,
  onNav,
  pendingClaims = 0,
  pendingRedemptions = 0,
  children,
}: {
  active: string;
  onNav: (id: string) => void;
  pendingClaims?: number;
  pendingRedemptions?: number;
  children: React.ReactNode;
}) {
  const activeItem = nav.find((n) => n.id === active);

  return (
    <div className="min-h-[100dvh] bg-[#050505] flex">
      <aside className="w-64 border-r border-white/5 bg-[#0a0a0a] flex flex-col shrink-0 hidden lg:flex">
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-black text-sm uppercase tracking-widest font-heading">
              Command
            </p>
            <p className="text-text-muted text-[10px] uppercase tracking-[0.3em]">Admin Center</p>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {nav.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onNav(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-bold transition-all touch-manipulation",
                active === item.id
                  ? "bg-brand/15 text-white border border-brand/30"
                  : "text-text-secondary hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
              {item.id === "claims" && pendingClaims > 0 && (
                <span className="ml-auto bg-brand text-white text-[10px] px-2 py-0.5 rounded-full">
                  {pendingClaims}
                </span>
              )}
              {item.id === "redemptions" && pendingRedemptions > 0 && (
                <span className="ml-auto bg-yellow-500 text-black text-[10px] px-2 py-0.5 rounded-full">
                  {pendingRedemptions}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/5 space-y-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-text-muted text-xs font-bold uppercase tracking-widest hover:text-white no-underline px-2 py-2"
          >
            <Flame className="w-3.5 h-3.5" /> Athlete App
          </Link>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center gap-2 text-text-muted text-xs font-bold uppercase tracking-widest hover:text-brand px-2 py-2"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign out
          </button>
          <BravooCredit variant="sidebar" className="px-2 pt-3" />
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 min-h-[100dvh]">
        {/* Mobile header — safe area + scrollable nav (below notch/status bar) */}
        <header className="lg:hidden sticky top-0 z-50 shrink-0 bg-[#0a0a0a] border-b border-white/5 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <div className="px-3 pb-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-brand flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-white font-black text-xs uppercase tracking-widest truncate">
                  Admin
                </p>
                <p className="text-text-muted text-[10px] uppercase tracking-wider truncate">
                  {activeItem?.label ?? "Panel"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Link
                href="/dashboard"
                className="min-h-10 px-2.5 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-text-muted text-[10px] font-bold uppercase no-underline touch-manipulation"
              >
                App
              </Link>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="min-h-10 min-w-10 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-text-muted touch-manipulation"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          <nav
            className="px-3 pb-3 overflow-x-auto overscroll-x-contain scrollbar-hide touch-pan-x"
            aria-label="Admin sections"
          >
            <div className="flex gap-2 w-max min-w-full pr-3">
              {nav.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNav(item.id)}
                  className={cn(
                    "relative shrink-0 min-h-11 px-3.5 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wide whitespace-nowrap touch-manipulation active:scale-[0.98]",
                    active === item.id
                      ? "bg-brand text-white shadow-lg shadow-brand/20"
                      : "bg-white/10 text-text-secondary border border-white/10"
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    <item.icon className="w-3.5 h-3.5 shrink-0" />
                    {item.shortLabel}
                  </span>
                  {item.id === "claims" && pendingClaims > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-brand text-white text-[9px] font-bold rounded-full border-2 border-[#0a0a0a]">
                      {pendingClaims > 9 ? "9+" : pendingClaims}
                    </span>
                  )}
                  {item.id === "redemptions" && pendingRedemptions > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-yellow-500 text-black text-[9px] font-bold rounded-full border-2 border-[#0a0a0a]">
                      {pendingRedemptions > 9 ? "9+" : pendingRedemptions}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </nav>
        </header>

        {/* Desktop header */}
        <header className="hidden lg:flex h-14 border-b border-white/5 items-center justify-between px-8 bg-[#0a0a0a]/80 backdrop-blur-xl shrink-0">
          <p className="text-text-muted text-xs">RahulFitzz Command Center · Live data</p>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-8 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {children}
          <BravooCredit variant="app" className="text-center mt-8" />
        </main>
      </div>
    </div>
  );
}
