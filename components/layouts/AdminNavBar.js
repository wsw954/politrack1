//components/layouts/AdminNavBar.js
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

export default function AdminNavBar() {
  const pathname = usePathname();

  const linkClass = (path) =>
    `hover:text-blue-600 ${
      pathname === path ? "text-blue-600 font-bold underline" : "text-gray-800"
    }`;

  return (
    <nav className="bg-white border-b shadow px-6 py-4 flex justify-between items-center">
      <div className="flex items-center space-x-6 text-sm font-medium">
        <Link href="/" className={linkClass("/")}>
          Home
        </Link>
        <Link href="/admin/dashboard" className={linkClass("/admin/dashboard")}>
          Admin Dashboard
        </Link>
        <Link
          href="/admin/manage-bills"
          className={linkClass("/admin/manage-bills")}
        >
          Manage Bills
        </Link>
        <Link
          href="/admin/manage-politicians"
          className={linkClass("/admin/manage-politicians")}
        >
          Manage Politicians
        </Link>
        <Link
          href="/admin/manage-users"
          className={linkClass("/admin/manage-users")}
        >
          Manage Users
        </Link>
      </div>
      <div className="flex items-center space-x-4 text-sm">
        <button
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
          className="text-red-600 hover:underline"
        >
          Sign Out
        </button>
      </div>
    </nav>
  );
}
