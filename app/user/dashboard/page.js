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
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <Card className="max-w-md w-full space-y-6 text-center">
        <h1 className="text-2xl font-bold text-blue-800">User Dashboard</h1>
        <p className="text-gray-600">
          Welcome, <span className="font-medium">{session.user.name}</span>!
        </p>
        <Button onClick={handleSignOut}>Sign Out</Button>
      </Card>
    </main>
  );
}
