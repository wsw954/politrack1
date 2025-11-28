// components/user/AddToTrackerButton.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import axios from "@/lib/axiosInstance";

// Reuse your existing dialog (unchanged)
import AddAnnotationsDialog from "./AddAnnotationsDialog";

// Annotations API helpers (bill-level)
import {
  putBillAnnotations,
  // If you later support politicians/tags annotations, add their helpers here
} from "@/lib/api/annotations";

/**
 * AddToTrackerButton
 * ------------------
 * Props:
 *  - itemId (ObjectId string of the thing to track)
 *  - itemType: "Bill" | "Politician" | "Tag"
 *  - redirectTo: path to navigate after success (e.g., "/user/tracker/bills")
 *
 * Behavior:
 *  - "Track" click opens the AddAnnotationsDialog.
 *  - "Skip & Save" -> POST tracked shell only, then redirect.
 *  - "Save with Annotations" -> POST tracked shell, THEN PUT annotations (bill-level).
 *
 * Notes:
 *  - The POST route remains minimal and does not accept annotations.
 *  - Annotations are saved via dedicated PUT endpoint for clean API boundaries.
 */
export default function AddToTrackerButton({ itemId, itemType, redirectTo }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  const disabled = status === "loading" || !session?.user?.id;

  // --- Internal: POST to create tracked shell (no annotations here) ---
  async function postTrackShell(payload, { skipRedirect = false } = {}) {
    setPosting(true);
    setError("");
    try {
      const userId = session.user.id;

      const endpoint =
        itemType === "Bill"
          ? `/api/users/${userId}/tracker/bills`
          : itemType === "Politician"
          ? `/api/users/${userId}/tracker/politicians`
          : `/api/users/${userId}/tracker/tags`;

      await axios.post(endpoint, payload);

      if (!skipRedirect) {
        router.push(redirectTo);
      }
    } catch (e) {
      console.error(e);
      setError("Failed to track item. Please try again.");
      throw e;
    } finally {
      setPosting(false);
    }
  }

  // --- CTA click: open dialog or send to sign-in ---
  const onTrackClick = () => {
    if (!session?.user?.id) {
      // Not logged in: show link to sign-in
      setError("Please sign in to track items.");
      return;
    }

    setOpen(true);
  };

  // --- Dialog: Skip & Save (no annotations) ---
  const handleSkipAndSave = async () => {
    try {
      await postTrackShell({ itemId });
      setOpen(false);
    } catch {
      // error already handled by postTrackShell
    }
  };

  // --- Dialog: Save with annotations (POST shell, then PUT annotations) ---
  const handleSaveWithAnnotations = async (formValues) => {
    try {
      const userId = session.user.id;

      // 1) Create the tracked shell (no redirect yet)
      await postTrackShell({ itemId }, { skipRedirect: true });

      // 2) Convert dialog form values into annotations payload
      // formValues shape expected from your dialog:
      // { generalNotes?: string, labels?: [{label, note?}], links?: [{url, title?, note?}], attachments?: [...] }
      const payload = {
        generalNotes: formValues?.generalNotes || "",
        labels: Array.isArray(formValues?.labels) ? formValues.labels : [],
        links: Array.isArray(formValues?.links) ? formValues.links : [],
        attachments: Array.isArray(formValues?.attachments)
          ? formValues.attachments
          : [],
      };

      // 3) Save annotations via dedicated endpoint (bill-level here)
      if (itemType === "Bill") {
        await putBillAnnotations(userId, itemId, payload);
      } else {
        // For Politician/Tag, wire their annotation endpoints here when ready.
        // For now we silently ignore to keep behavior consistent with current API surface.
      }

      // 4) Close dialog and navigate
      setOpen(false);
      router.push(redirectTo);
    } catch {
      // post/put errors show via setError or console
    }
  };

  // --- Render ---
  if (!session && status !== "loading") {
    // Not logged in: nudge sign-in (matches your existing UX approach)
    return (
      <div className="inline-flex items-center gap-2">
        <Link
          className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
          href="/api/auth/signin"
        >
          Sign in to Track
        </Link>
      </div>
    );
  }

  return (
    <>
      <button
        className="bg-accent text-white px-4 py-2 rounded
                   hover:bg-accent-dark disabled:opacity-50 disabled:cursor-not-allowed
                   focus:outline-none focus:ring-2 focus:ring-primary/30"
        onClick={onTrackClick}
        disabled={disabled || posting}
      >
        {posting ? "Saving…" : "Track " + itemType}
      </button>

      {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}

      {/* Dialog mounts only when open */}
      {open && (
        <AddAnnotationsDialog
          isOpen={open}
          onClose={() => setOpen(false)}
          onSkipAndSave={handleSkipAndSave}
          onSaveWithAnnotations={handleSaveWithAnnotations}
          // Optional: pass initial values if you want the dialog to remember state
          initialValue={{
            generalNotes: "",
            labels: [],
            links: [],
            attachments: [],
          }}
        />
      )}
    </>
  );
}
