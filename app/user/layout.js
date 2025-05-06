// /app/user/layout.js
"use client";

import useRequireRole from "@/lib/auth/useRequireRole";

export default function UserLayout({ children }) {
  const session = useRequireRole("user", "/");

  if (!session) return null;

  return <>{children}</>;
}
