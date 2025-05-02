//app/admin/manage/bills.js
"use client";

import useRequireRole from "@/lib/auth/useRequireRole";
import Card from "@/components/ui/Card";

export default function AdminManageBills() {
  const session = useRequireRole("admin");
  if (!session) return null;

  return (
    <main className="p-6">
      <Card className="text-center">
        <h1 className="text-2xl font-bold text-blue-800">Admin Manage Bills</h1>
        <p className="text-gray-600">
          Welcome, <span className="font-medium">{session.user.name}</span>!
        </p>
      </Card>
    </main>
  );
}
