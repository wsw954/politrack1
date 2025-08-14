// /app/user/layout.js
"use client";

import useRequireRole from "@/lib/auth/useRequireRole";

export default function UserLayout({ children }) {
  const session = useRequireRole("user", "/");

  if (!session) return null;

  return (
    <section className="py-8 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-neutral-dark">Your Space</h1>
        <p className="text-base text-neutral-muted">
          Dashboard, profile, and tracker tools.
        </p>
      </header>
      {children}
    </section>
  );
}
