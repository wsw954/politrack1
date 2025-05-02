//lib/auth/useRequireGuest.js
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

/**
 * useRequireGuest
 * - Redirects logged-in users to /user/dashboard
 * - Allows unauthenticated guests to continue
 */
export default function useRequireGuest() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/user/dashboard");
    }
  }, [status, router]);

  if (status === "loading") return null; // Wait to render anything
  if (session) return null; // Prevent UI flicker while redirecting

  return true; // Let guest continue rendering
}
