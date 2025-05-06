//lib/auth/UseRequireAuth.js
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

/**
 * useRequireAuth
 * - Redirects to /auth/login if user is not authenticated
 * - Returns session object for logged-in users
 */
export default function useRequireAuth() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  if (status === "loading") return null; // Prevent rendering until status is known
  if (!session) return null; // Prevent rendering if redirecting

  return session;
}
