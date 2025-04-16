//app/user/dashboard/page.js
"use client";

import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function UserDashboard() {
  const router = useRouter();

  const handleSignOut = () => {
    // Placeholder for NextAuth's signOut() function
    alert("Signing out...");
    router.push("/auth/login");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <Card className="max-w-md w-full space-y-6 text-center">
        <h1 className="text-2xl font-bold text-blue-800">User Dashboard</h1>
        <p className="text-gray-600">You are logged in (mock session)</p>
        <Button onClick={handleSignOut}>Sign Out</Button>
      </Card>
    </main>
  );
}
