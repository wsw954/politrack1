//components/layouts/GuestNavBar.js

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function GuestNavBar() {
  const pathname = usePathname();
  const isAuthPage =
    pathname === "/auth/login" || pathname === "/auth/register";

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
      {!isAuthPage && (
        <div className="flex items-center space-x-4 text-sm">
          <Link href="/auth/login" className={linkClass("/auth/login")}>
            Sign In
          </Link>
          <Link href="/auth/register" className={linkClass("/auth/register")}>
            Register
          </Link>
        </div>
      )}
    </nav>
  );
}
