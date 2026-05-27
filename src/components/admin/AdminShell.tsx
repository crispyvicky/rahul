"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  Shield,
  LogOut,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "leaderboard", label: "Leaderboard", icon: Trophy },
  { id: "users", label: "Users", icon: Users },
  { id: "logs", label: "Point Logs", icon: ScrollText },
  { id: "claims", label: "Claims", icon: ClipboardCheck },
  { id: "community", label: "Community", icon: MessageSquare },
  { id: "giveaways", label: "Giveaways", icon: Gift },
  { id: "prebookings", label: "Pre-bookings", icon: CalendarCheck },
  { id: "notifications", label: "Campaigns", icon: Bell },
];

export default function AdminShell({
  active,
  onNav,
  pendingClaims = 0,
  children,
}: {
  active: string;
  onNav: (id: string) => void;
  pendingClaims?: number;
  children: React.ReactNode;
}) {
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
        <nav className="flex-1 p-3 space-y-1">
          {nav.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onNav(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-bold transition-all",
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
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-white/5 flex items-center justify-between px-4 lg:px-8 bg-[#0a0a0a]/80 backdrop-blur-xl shrink-0">
          <p className="text-white font-bold text-sm uppercase tracking-widest lg:hidden">
            Admin — {nav.find((n) => n.id === active)?.label}
          </p>
          <p className="text-text-muted text-xs hidden lg:block">
            RahulFitzz Command Center · Live data
          </p>
          <div className="flex gap-2 lg:hidden overflow-x-auto max-w-[70vw] sm:max-w-none pb-1">
            {nav.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onNav(item.id)}
                className={cn(
                  "px-2 py-1 rounded-lg text-[10px] font-bold uppercase whitespace-nowrap",
                  active === item.id ? "bg-brand text-white" : "bg-white/5 text-text-muted"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
