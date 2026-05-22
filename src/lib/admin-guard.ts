import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { isAdminEmail } from "./admin-config";

export async function getSessionIsAdmin(): Promise<boolean> {
  const session = await auth();
  if (!session?.user) return false;
  const u = session.user as { isAdmin?: boolean; email?: string | null };
  if (u.isAdmin === true) return true;
  return isAdminEmail(u.email);
}

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), session: null };
  }
  const isAdmin =
    (session.user as { isAdmin?: boolean }).isAdmin === true ||
    isAdminEmail(session.user.email);
  if (!isAdmin) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }), session: null };
  }
  return { error: null, session };
}
