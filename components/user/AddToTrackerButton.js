//components/user/AddToTrackerButton.js

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "@/lib/axiosInstance";
import Link from "next/link";
import { isHTTPMethod } from "next/dist/server/web/http";

export default function AddToTrackerButton({ itemId, itemType, redirectTo }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Not authenticated → show sign in link
  if (status === "unauthenticated") {
    return (
      <Link
        href="/auth/login"
        className="inline-block bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark"
      >
        Sign in to Track This Bill
      </Link>
    );
  }

  const handleTrack = async () => {
    setLoading(true);
    setError(null);

    try {
      const userId = session.user.id;

      const endpoint =
        itemType === "Bill"
          ? `/api/users/${userId}/tracker/bills`
          : itemType === "Politician"
          ? `/api/users/${userId}/tracker/politicians`
          : `/api/users/${userId}/tracker/tags`;

      const payload = { itemId, itemType };

      await axios.post(endpoint, payload);
      router.push(redirectTo);
    } catch (err) {
      console.error(err);
      setError("Failed to track item. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Auth still loading
  if (status === "loading") {
    return <p className="text-sm text-gray-500">Checking user status...</p>;
  }

  // Authenticated → show functional track button
  return (
    <div>
      <button
        onClick={handleTrack}
        disabled={loading}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? "Tracking..." : "Track " + itemType}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
