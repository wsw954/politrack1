//app/user/dashboard/page.js
"use client";

import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function UserDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();

  if (status === "loading") return <p>Loading...</p>;
  if (!session) {
    router.push("/auth/login");
    return null;
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: "/auth/login" });
  };

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
