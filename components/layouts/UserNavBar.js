// components/layouts/UserNavBar.js
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";

export default function UserNavBar() {
  const pathname = usePathname();
  const isDashboardPage = pathname === "/user/dashboard";
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);

  const linkClass = (path) =>
    `hover:text-blue-600 ${
      pathname === path ? "text-blue-600 font-bold underline" : "text-gray-800"
    }`;

  return (
    <nav className="bg-white border-b shadow px-6 py-4 flex justify-between items-center">
      {/* Left Side - Public Pages */}
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

      {/* Right Side - User Pages */}
      <div className="flex items-center space-x-4 text-sm relative">
        {!isDashboardPage && (
          <Link href="/user/dashboard" className={linkClass("/user/dashboard")}>
            Dashboard
          </Link>
        )}
        <Link href="/user/profile" className={linkClass("/user/profile")}>
          Profile
        </Link>
        <div
          className="relative"
          onMouseEnter={() => setIsTrackerOpen(true)}
          onMouseLeave={() => setIsTrackerOpen(false)}
        >
          <button className="text-gray-800 hover:text-blue-600 font-medium">
            Tracker ▾
          </button>

          <div
            className={`absolute right-0 top-full w-48 bg-white border shadow-lg z-10 rounded-md overflow-hidden transition-opacity duration-200 ${
              isTrackerOpen ? "opacity-100 visible" : "opacity-0 invisible"
            }`}
          >
            <Link
              href="/user/tracker"
              className="block px-4 py-2 hover:bg-gray-100 text-sm text-gray-800"
            >
              Overview
            </Link>
            <Link
              href="/user/tracker/politicians"
              className="block px-4 py-2 hover:bg-gray-100 text-sm text-gray-800"
            >
              Tracked Politicians
            </Link>
            <Link
              href="/user/tracker/bills"
              className="block px-4 py-2 hover:bg-gray-100 text-sm text-gray-800"
            >
              Tracked Bills
            </Link>
            <Link
              href="/user/tracker/tags"
              className="block px-4 py-2 hover:bg-gray-100 text-sm text-gray-800"
            >
              Tracked Tags
            </Link>
          </div>
        </div>
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
