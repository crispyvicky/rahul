"use client";

import { useSession } from "next-auth/react";

export function useIsAdmin() {
  const { data: session, status } = useSession();
  const isAdmin = Boolean((session?.user as { isAdmin?: boolean } | undefined)?.isAdmin);
  return { isAdmin, status, session };
}
