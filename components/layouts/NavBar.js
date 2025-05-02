//components/layouts/NavBar.js
"use client";

import { useSession } from "next-auth/react";
import GuestNavBar from "./GuestNavBar";
import UserNavBar from "./UserNavBar";
import AdminNavBar from "./AdminNavBar";

export default function Navbar() {
  const { data: session, status } = useSession();

  if (status === "loading") return null;

  if (!session) return <GuestNavBar />;
  if (session.user.role === "admin") return <AdminNavBar />;
  return <UserNavBar />;
}
