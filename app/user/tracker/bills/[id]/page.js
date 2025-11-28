// app/user/tracker/bills/[id]/page.js
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getTrackedBill } from "@/lib/trackerClient";
import { useUserId } from "@/lib/useUserId";
import useAnnotationsDrawer from "@/lib/hooks/useAnnotationsDrawer";
import StatusTimeline from "@/components/bills/StatusTimeline";
import TagList from "@/components/bills/TagList";
import SponsorCard from "@/components/bills/SponsorCard";
import ViewProvisionsButton from "@/components/provisions/ViewProvisionsButton";
import BillAnnotationsCard from "@/components/annotation/BillAnnotationsCard";
import AnnotationsDrawer from "@/components/annotation/AnnotationsDrawer";

export default function TrackedBillDetailPage() {
  const params = useParams();
  const billId = params?.id;
  const [reloadTick, setReloadTick] = useState(0);
  const { openBill } = useAnnotationsDrawer();

  const { userId, status } = useUserId();
  const [tracked, setTracked] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (status === "loading") return;
    if (!userId || !billId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        // includeProvisions optional; not required for this page markup
        const data = await getTrackedBill(userId, billId, {
          includeAnnotations: true,
        });
        if (!cancelled) setTracked(data);
      } catch (e) {
        if (!cancelled) setErr(e?.message || "Failed to load tracked bill.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, status, billId, reloadTick]);

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

  if (loading) {
    return (
      <section className="py-6">
        <p className="text-sm text-gray-600">Loading bill…</p>
      </section>
    );
  }

  if (err) {
    return (
      <section className="py-6">
        <p className="text-sm text-red-600">{err}</p>
      </section>
    );
  }

  if (!tracked?.itemId?._id) {
    return (
      <section className="py-6">
        <p className="text-sm text-gray-600">Bill not found.</p>
      </section>
    );
  }

  // Bill doc (populated on tracked record)
  const bill = tracked.itemId;

  // Match the Untracked view’s layout/sections:
  const title = bill.title || "Untitled Bill";
  const billNumber = bill.number;
  const updatedAt = bill.updatedAt || "Unknown";
  const sourceUrl = bill.source_url || null;
  const summary = bill.summary || "No summary available.";
  const why = bill.why_it_matters || "No information.";
  const tagNames = Array.isArray(bill.tags)
    ? bill.tags
        .map((t) => (typeof t === "string" ? t : t?.name))
        .filter(Boolean)
    : [];
  const timeline = bill.status?.timeline || [];
  const currentStage = bill.status?.current_stage;
  const provisionCount =
    typeof bill.provisionCount === "number"
      ? bill.provisionCount
      : Array.isArray(bill.provisions)
      ? bill.provisions.length
      : 0;

  // Whole-bill annotations from tracked record
  const notes = tracked.generalNotes || "";
  const links = Array.isArray(tracked.links) ? tracked.links : [];
  const attachments = Array.isArray(tracked.attachments)
    ? tracked.attachments
    : [];
  const labels = Array.isArray(tracked.labels) ? tracked.labels : [];

  return (
    <section className="py-6 space-y-6">
      {/* Header (same look as Untracked page) */}
      <h3 className="text-3xl font-bold mb-2">{title}</h3>

      <p className="text-sm text-gray-800">
        <span className="font-medium">Bill Number:</span> {billNumber}
      </p>

      <p className="text-neutral-muted text-sm mb-1">
        Last Updated: {updatedAt}
      </p>

      {sourceUrl ? (
        <a
          href={sourceUrl}
          className="text-primary underline text-sm"
          target="_blank"
          rel="noopener noreferrer"
        >
          View Official Source
        </a>
      ) : null}

      {/* Summary */}
      <section className="mt-6">
        <h2 className="text-xl font-semibold">Summary</h2>
        <p className="mt-2">{summary}</p>
      </section>

      {/* Tags */}
      {!!tagNames.length && (
        <section className="mt-6">
          <h2 className="text-xl font-semibold">Tags</h2>
          <TagList tags={tagNames} />
        </section>
      )}

      {/* Status timeline */}
      <section className="mt-6">
        <h2 className="text-xl font-semibold">Status Timeline</h2>
        <StatusTimeline timeline={timeline} current={currentStage} />
      </section>

      {/* Sponsor */}
      <section className="mt-6">
        <h2 className="text-xl font-semibold">Sponsor</h2>
        <SponsorCard sponsor={bill.sponsor} />
      </section>

      {/* View provisions */}
      <div className="mt-4">
        <ViewProvisionsButton
          billId={bill._id}
          provisionCount={provisionCount}
        />
      </div>

      {/* Tracked-view extra: annotations card at the end (no "Track Bill" CTA) */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold">Your Annotations</h2>
        <BillAnnotationsCard
          notes={notes}
          links={links}
          labels={labels}
          attachments={attachments}
          // Legacy edit page link stays for now (Section 7 will replace with drawer)
          editHref={`/user/tracker/bills/${bill._id}/edit`}
          onEdit={() => openBill({ scope: "bill" })}
        />
      </section>

      {/* Drawer mounted (inert until ?panel=annotations… is in URL) */}
      <AnnotationsDrawer
        userId={userId}
        billId={bill._id}
        onSaved={() => setReloadTick((t) => t + 1)}
      />
    </section>
  );
}
