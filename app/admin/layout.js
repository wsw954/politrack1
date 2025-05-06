//app/admin/layout.js
"use client";

import useRequireRole from "@/lib/auth/useRequireRole";

export default function AdminLayout({ children }) {
  const session = useRequireRole("admin", "/");

  if (!session) return null;

  return <>{children}</>;
}
