//app/admin/dashboard.js
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") return <p>Loading...</p>;

  if (!session) {
    router.push("/auth/login");
    return null;
  }

  if (session.user.role !== "admin") {
    router.push("/auth/login"); // or create a custom 403 page like /unauthorized
    return null;
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <Card className="max-w-md w-full space-y-6 text-center">
        <h1 className="text-2xl font-bold text-blue-800">Admin Dashboard</h1>
        <p className="text-gray-600">
          Welcome, <span className="font-medium">{session.user.name}</span>! You
          have admin access.
        </p>
      </Card>
    </main>
  );
}
