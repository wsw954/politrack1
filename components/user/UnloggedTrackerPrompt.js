//components/user/UnloggedTrackerPrompt.js
"use client";
import { useState } from "react";
import Link from "next/link";

export default function UnloggedTrackerPrompt({ label = "this item" }) {
  const [showOptions, setShowOptions] = useState(false);

  return (
    <div className="mt-4">
      {!showOptions ? (
        <button
          onClick={() => setShowOptions(true)}
          className="bg-accent text-white px-4 py-2 rounded
                     hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          Track {label}
        </button>
      ) : (
        <>
          <p className="text-sm text-neutral-dark mb-2">
            Want to track {label}?
          </p>
          <div className="flex gap-4">
            <Link
              href="/auth/login"
              className="bg-primary text-white px-4 py-2 rounded
                         hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="bg-neutral-light text-neutral-dark px-4 py-2 rounded border border-neutral-light
                         hover:bg-neutral-light focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              Register
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
