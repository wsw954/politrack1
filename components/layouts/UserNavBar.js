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
    `hover:text-primary ${
      pathname === path
        ? "text-primary font-bold underline"
        : "text-neutral-dark"
    }`;

  return (
    <nav className="bg-white border-b shadow">
      <div className="container flex justify-between items-center py-4">
        {/* Left: public pages */}
        <div className="flex items-center space-x-6 text-sm font-medium">
          <Link href="/" className={linkClass("/")}>
            Home
          </Link>
          <Link href="/bills" className={linkClass("/bills")}>
            Bills
          </Link>
          <Link href="/politicians" className={linkClass("/politicians")}>
            Politicians
          </Link>
          <Link href="/tags" className={linkClass("/tags")}>
            Tags
          </Link>
        </div>

        {/* Right: user pages */}
        <div className="flex items-center space-x-4 text-sm relative">
          {!isDashboardPage && (
            <Link
              href="/user/dashboard"
              className={linkClass("/user/dashboard")}
            >
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
            <button className="text-neutral-dark hover:text-primary font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 rounded">
              Tracker ▾
            </button>

            <div
              className={`absolute right-0 top-full w-48 bg-white border shadow-lg z-10 rounded-md overflow-hidden transition-opacity duration-200 ${
                isTrackerOpen ? "opacity-100 visible" : "opacity-0 invisible"
              }`}
            >
              <Link
                href="/user/tracker"
                className="block px-4 py-2 hover:bg-neutral-light text-sm text-neutral-dark"
              >
                Overview
              </Link>
              <Link
                href="/user/tracker/bills"
                className="block px-4 py-2 hover:bg-neutral-light text-sm text-neutral-dark"
              >
                Tracked Bills
              </Link>
              <Link
                href="/user/tracker/politicians"
                className="block px-4 py-2 hover:bg-neutral-light text-sm text-neutral-dark"
              >
                Tracked Politicians
              </Link>
              <Link
                href="/user/tracker/tags"
                className="block px-4 py-2 hover:bg-neutral-light text-sm text-neutral-dark"
              >
                Tracked Tags
              </Link>
            </div>
          </div>

          {/* Replace raw red with a token. If you want “danger”, add it to theme later; for now use accent or neutral */}
          <button
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
            className="text-accent hover:underline"
          >
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
}
