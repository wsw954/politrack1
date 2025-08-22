//app/user/dashboard/page.js
"use client";

import { useSession, signOut } from "next-auth/react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function UserDashboard() {
  const { data: session } = useSession();

  const handleSignOut = () => {
    signOut({ callbackUrl: "/auth/login" });
  };

  if (!session) return null;

  return (
    <section className="py-16">
      <div className="max-w-md mx-auto">
        <Card className="w-full space-y-6 text-center">
          <p className="text-neutral-muted">
            <span className="font-medium">Your Research Dashboard</span>
          </p>
          <Button onClick={handleSignOut}>Sign Out</Button>
        </Card>
      </div>
    </section>
  );
}
