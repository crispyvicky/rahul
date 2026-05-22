"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import AdminDashboard from "./AdminDashboard";

export default function AdminGate() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";

  useEffect(() => {
    if (status === "loading") return;
    if (isLogin) return;
    if (!session?.user?.isAdmin) {
      router.replace("/admin/login");
    }
  }, [session, status, router, isLogin]);

  if (isLogin) return null;

  if (status === "loading") {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-[#050505]">
        <Loader2 className="w-10 h-10 text-brand animate-spin" />
      </div>
    );
  }

  if (!session?.user?.isAdmin) {
    return null;
  }

  return <AdminDashboard />;
}
