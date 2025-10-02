//components/user/AddToTrackerButton.js

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "@/lib/axiosInstance";
import Link from "next/link";
import AddAnnotationsDialog from "./AddAnnotationsDialog";

export default function AddToTrackerButton({ itemId, itemType, redirectTo }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);

  // Not authenticated → show sign in link
  if (status === "unauthenticated") {
    return (
      <Link
        href="/auth/login"
        className="inline-block bg-primary text-white px-4 py-2 rounded
                   hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/30"
      >
        {`Sign in to Track This ${itemType}`}
      </Link>
    );
  }

  // Auth still loading
  if (status === "loading") {
    return (
      <p className="text-sm text-neutral-muted">Checking user status...</p>
    );
  }

  // ---- POST helper (uses your axios + redirectTo) ----
  async function postTrack(payload) {
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

      await axios.post(endpoint, payload);
      router.push(redirectTo);
    } catch (err) {
      console.error(err);
      setError("Failed to track item. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ---- Button click → open dialog (new) ----
  const handleOpenDialog = () => setOpen(true);

  // ---- Dialog actions ----
  const handleSkipAndSave = async () => {
    await postTrack({ itemId }); // itemId only (fast path)
    setOpen(false);
  };

  const handleSaveWithAnnotations = async (formValues) => {
    console.log(formValues);
    // formValues expected from dialog:
    // { generalNotes?: string, labels?: [{label, note?}], links?: [{url, title?, note?}] }
    const annotations = {
      generalNotes: formValues?.generalNotes || "",
      addLabels: Array.isArray(formValues?.labels) ? formValues.labels : [],
      addLinks: Array.isArray(formValues?.links) ? formValues.links : [],
    };
    await postTrack({ itemId, annotations });
    setOpen(false);
  };

  // Authenticated → show functional track button
  return (
    <div>
      <button
        onClick={handleOpenDialog}
        disabled={loading}
        className="bg-accent text-white px-4 py-2 rounded
                   hover:bg-accent-dark disabled:opacity-50 disabled:cursor-not-allowed
                   focus:outline-none focus:ring-2 focus:ring-primary/30"
      >
        {loading ? "Saving…" : "Track " + itemType}
      </button>

      {error && (
        <p className="mt-2 text-sm text-danger" role="alert" aria-live="polite">
          {error}
        </p>
      )}

      {/* Modal we’ll implement in Step 3 */}
      <AddAnnotationsDialog
        open={open}
        onClose={() => !loading && setOpen(false)}
        onSkipAndSave={handleSkipAndSave}
        onSaveWithAnnotations={handleSaveWithAnnotations}
        // (Optional) pass billId to show context in the dialog header
        billId={itemId}
      />
    </div>
  );
}
