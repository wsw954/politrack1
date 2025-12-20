//app/user/tracker/bills/[id]/provisions/[pid]/page.js
"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import LegalTextItem from "@/components/provisions/LegalTextItem";
import { useUserId } from "@/lib/useUserId";
import useAnnotationsDrawer from "@/lib/hooks/useAnnotationsDrawer";
import ProvisionAnnotationsCard from "@/components/annotation/ProvisionAnnotationsCard";
import AnnotationsDrawer from "@/components/annotation/AnnotationsDrawer";

export default function TrackedProvisionDetailPage() {
  const { id, pid } = useParams();
  const { userId, status } = useUserId();
  const [reloadTick, setReloadTick] = useState(0);

  // --- Provision state (same feel as untracked version) ---
  const [prov, setProv] = useState(null);
  const [loadingProv, setLoadingProv] = useState(true);
  const [errorProv, setErrorProv] = useState(null);

  const { openProvision } = useAnnotationsDrawer();
  const [showLegalText, setShowLegalText] = useState(false);
  const [hasLoadedLT, setHasLoadedLT] = useState(false);
  const [loadingLT, setLoadingLT] = useState(false);

  // --- Annotations state (provision-level) ---
  const [annotations, setAnnotations] = useState(null);
  const [loadingAnn, setLoadingAnn] = useState(true);
  const [errorAnn, setErrorAnn] = useState(null);

  // --- Fetch provision details (reuse public bill/provision API) ---
  useEffect(() => {
    if (!id || !pid) return;

    let cancelled = false;

    (async () => {
      setLoadingProv(true);
      setErrorProv(null);

      try {
        const res = await fetch(`/api/bills/${id}/provisions/${pid}`);
        if (!res.ok) throw new Error("Failed to fetch provision");
        const data = await res.json();
        if (!cancelled) setProv(data);
      } catch (e) {
        console.error(e);
        if (!cancelled) setErrorProv(e.message || "Something went wrong");
      } finally {
        if (!cancelled) setLoadingProv(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, pid]);

  // --- Lazy-load full legal_text once, same as untracked page ---
  const toggleLegalText = async () => {
    const next = !showLegalText;
    setShowLegalText(next);

    if (next && prov && !hasLoadedLT) {
      setLoadingLT(true);
      try {
        const res = await fetch(
          `/api/bills/${id}/provisions/${pid}?with=legalText`
        );
        if (!res.ok) throw new Error("Failed to load legal text");
        const full = await res.json();
        setProv((prev) => ({
          ...(prev || {}),
          legal_text: full.legal_text || [],
        }));
        setHasLoadedLT(true);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingLT(false);
      }
    }
  };

  // --- Fetch provision-level annotations for this tracked bill ---
  //  - This IS auth-protected (user-specific annotations)
  useEffect(() => {
    if (!id || !pid) return;
    if (status === "loading") return;

    if (!userId) {
      setErrorAnn("You must be signed in to view provision annotations.");
      setLoadingAnn(false);
      return;
    }

    let cancelled = false;

    (async () => {
      setLoadingAnn(true);
      setErrorAnn(null);
      try {
        const res = await fetch(
          `/api/users/${userId}/tracker/bills/${id}/provisions/${pid}/annotations`
        );

        if (res.status === 404) {
          // No tracked bill or no annotations yet; treat as empty
          if (!cancelled) setAnnotations(null);
        } else {
          if (!res.ok) throw new Error("Failed to fetch annotations");
          const payload = await res.json();
          const ann = payload.annotations || payload;
          if (!cancelled) setAnnotations(ann || null);
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setErrorAnn(e.message || "Something went wrong");
        }
      } finally {
        if (!cancelled) setLoadingAnn(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, status, id, pid, reloadTick]);

  // --- High-level auth/session handling (match Tracked Bill page style) ---
  if (status === "loading") {
    return (
      <section className="py-6">
        <p className="text-sm text-gray-600">Checking your session…</p>
      </section>
    );
  }

  if (!userId) {
    return (
      <section className="py-6">
        <p className="text-sm text-gray-600">
          Please sign in to view this page.
        </p>
      </section>
    );
  }

  return (
    <section className="w-full py-6 space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Tracked Provision Detail</h1>
        <div className="flex gap-2">
          <Link
            href={`/user/tracker/bills/${id}/provisions`}
            className="inline-block px-3 py-2 rounded border border-neutral-light hover:bg-neutral-light"
          >
            ← Back to Tracked Provisions
          </Link>
          <Link
            href={`/user/tracker/bills/${id}`}
            className="inline-block px-3 py-2 rounded border border-neutral-light hover:bg-neutral-light"
          >
            Tracked Bill Overview
          </Link>
        </div>
      </div>

      {/* Provision content (same layout as untracked page) */}
      {loadingProv && <p className="text-neutral-muted">Loading provision…</p>}
      {errorProv && <p className="text-danger">{errorProv}</p>}

      {!loadingProv && !errorProv && prov && (
        <div className="border border-neutral-light rounded-lg p-6 shadow-sm space-y-6">
          {/* Section + Heading */}
          <div>
            <h2 className="text-xl font-bold text-primary">
              Section {prov.section_number}
            </h2>
            {prov.heading && (
              <p className="text-sm text-neutral-dark">{prov.heading}</p>
            )}
          </div>

          {/* Summary */}
          {prov.summary && (
            <div>
              <p className="text-sm font-semibold text-neutral-muted">
                Summary
              </p>
              <p className="text-sm text-neutral-dark">{prov.summary}</p>
            </div>
          )}

          {/* Why it matters */}
          {prov.why_it_matters && (
            <div>
              <p className="text-sm font-semibold text-neutral-muted">
                Why It Matters
              </p>
              <p className="text-sm text-neutral-dark">{prov.why_it_matters}</p>
            </div>
          )}

          {/* Tags (names) */}
          {Array.isArray(prov.tags) && prov.tags.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-neutral-muted">Tags</p>
              <p className="text-sm text-neutral-dark">
                {prov.tags
                  .map((t) => (typeof t === "string" ? t : t?.name))
                  .join(", ")}
              </p>
            </div>
          )}

          {/* Type */}
          {prov.type && (
            <div>
              <p className="text-sm font-semibold text-neutral-muted">Type</p>
              <p className="text-sm text-neutral-dark">{prov.type}</p>
            </div>
          )}

          {/* Legal text expandable (lazy-loaded) */}
          <div className="pt-2 border-t border-neutral-light">
            <button
              onClick={toggleLegalText}
              className="w-full flex items-center justify-between px-4 py-2 bg-neutral-light rounded hover:bg-neutral-dark/10"
            >
              <span className="text-sm font-semibold text-neutral-dark">
                Legal Text Items (
                {prov.legalTextCount ?? prov.legal_text?.length ?? 0})
              </span>
              <span className="text-sm text-primary">
                {showLegalText ? "▲ Hide" : "▼ Show"}
              </span>
            </button>

            {showLegalText && (
              <div className="mt-4 space-y-4">
                {loadingLT && (
                  <p className="text-neutral-muted">Loading legal text…</p>
                )}
                {!loadingLT &&
                  (prov.legal_text ?? []).map((item) => (
                    <LegalTextItem key={item._id} item={item} />
                  ))}
                {!loadingLT && (prov.legal_text ?? []).length === 0 && (
                  <p className="text-neutral-muted">No legal text items.</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Provision-level annotations card (like BillAnnotationsCard) */}
      <section className="mt-8">
        <ProvisionAnnotationsCard
          annotations={annotations}
          loading={loadingAnn}
          error={errorAnn}
          onEdit={() => openProvision(pid)} // hook up later when you have a provision-level drawer
          // editHref={`/user/tracker/bills/${id}/provisions/${pid}/edit`}
        />
      </section>
      {/* Drawer mounted (inert until ?panel=annotations… is in URL) */}
      <AnnotationsDrawer
        userId={userId}
        billId={id}
        onSaved={() => setReloadTick((t) => t + 1)}
      />
    </section>
  );
}
