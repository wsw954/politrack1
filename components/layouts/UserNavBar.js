//components/layouts/UserNavBar.js
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

export default function UserNavBar() {
  const pathname = usePathname();
  const isDashboardPage = pathname === "/user/dashboard";

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
        <Link href="/politicians" className={linkClass("/politicians")}>
          Politicians
        </Link>
        <Link href="/bills" className={linkClass("/bills")}>
          Bills
        </Link>
        <Link href="/engagement" className={linkClass("/engagement")}>
          Take Action
        </Link>
      </div>
      <div className="flex items-center space-x-4 text-sm">
        {!isDashboardPage && (
          <Link href="/user/dashboard" className={linkClass("/user/dashboard")}>
            Dashboard
          </Link>
        )}
        <Link href="/user/watchlist" className={linkClass("/user/watchlist")}>
          Watchlist
        </Link>
        <Link href="/user/history" className={linkClass("/user/history")}>
          Activity
        </Link>
        <Link href="/user/settings" className={linkClass("/user/settings")}>
          Settings
        </Link>
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
