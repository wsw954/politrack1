//lib/auth/useRequireRole.js
"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * useRequireRole
 * - Protects a page by role ("admin", "user", etc.)
 * - Redirects unauthorized users
 */
export default function useRequireRole(requiredRole, redirectTo = "/") {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // 🔐 Don't redirect until we know the role
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (session?.user?.role !== requiredRole) {
      router.push(redirectTo);
    }
  }, [status, session, requiredRole, redirectTo, router]);

  if (status === "loading") return null;
  if (!session || session.user.role !== requiredRole) return null;

  return session;
}
