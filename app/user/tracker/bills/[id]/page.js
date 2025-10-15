//app/user/tracker/bills/[id]/page.js

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUserId } from "@/lib/useUserId";
import { getTrackedBill } from "@/lib/trackerClient";
import BillCard from "@/components/bills/BillCard";
import ViewProvisionsButton from "@/components/provisions/ViewProvisionsButton";
import SponsorCard from "@/components/bills/SponsorCard";
import Section from "@/components/annotation/Section";
import AnchorJumpBar from "@/components/ui/AnchorJumpBar";
import ProvisionSummary from "@/components/provisions/ProvisionSummary";
import BillAnnotationsCard from "@/components/annotation/BillAnnotationsCard";

export default function ViewTrackedBillPage() {
  const params = useParams();
  const router = useRouter();
  const billId = params?.id;
  const { userId, status } = useUserId();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!userId || !billId) {
      setLoading(false);
      return;
    }
    let abort = false;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        // includeProvisions so ProvisionSummary can show names/sections
        const res = await getTrackedBill(userId, billId, {
          includeProvisions: true,
        });
        if (!abort) setData(res);
      } catch (e) {
        if (!abort) setErr(e.message || "Failed to load tracked bill");
      } finally {
        if (!abort) setLoading(false);
      }
    })();
    return () => {
      abort = true;
    };
  }, [userId, status, billId]);

  // Derived (safe) values
  const bill = data?.itemId || {};
  const notes = data?.generalNotes || "";
  const links = data?.links || [];
  const attachments = data?.attachments || [];
  const labels = data?.labels || [];
  const provisionAnns = data?.provisionAnnotations || [];

  // Render states
  if (status === "loading") {
    return (
      <div className="p-4 text-sm text-gray-600">Checking your session…</div>
    );
  }
  if (!userId) {
    return (
      <div className="p-4 text-sm text-gray-600">
        Please sign in to view this page.
      </div>
    );
  }
  if (loading) {
    return <div className="p-4 text-sm text-gray-600">Loading bill…</div>;
  }
  if (err) {
    return <div className="p-4 text-sm text-red-600">{err}</div>;
  }
  if (!data) {
    return <div className="p-4 text-sm text-gray-600">Bill not found.</div>;
  }

  return (
    <section className="py-8 space-y-6">
      {/* Header card with bill meta */}
      <div className="rounded-2xl border p-4 bg-white">
        <BillCard
          bill={{
            id: billId,
            number: bill?.number,
            title: bill?.title || "Untitled Bill",
            summary: bill?.summary,
            tags: Array.isArray(bill?.tags)
              ? bill.tags.map((t) => t.name || t)
              : [],
            current_stage: bill?.status?.current_stage,
            isTracked: true,
            provisionCount: bill?.provisions?.length,
          }}
        />
        <div className="mt-4">
          <ViewProvisionsButton
            billId={bill._id}
            provisionCount={bill?.provisions?.length}
          />
        </div>

        {/* Sponsor (compact) */}
        <section className="mt-6">
          <h2 className="text-lg font-semibold">Sponsor</h2>
          <SponsorCard sponsor={bill.sponsor} />
        </section>
      </div>

      {/* Jump bar to sections inside the annotations card & provisions summary */}
      <AnchorJumpBar
        items={[
          { id: "notes", label: "Notes" },
          { id: "links", label: "Links" },
          { id: "labels", label: "Labels" },
          { id: "attachments", label: "Attachments" },
          { id: "provisions", label: "Provisions" },
        ]}
      />

      {/* Whole-bill Annotations, wrapped in a card with its own Edit button */}
      <BillAnnotationsCard
        notes={notes}
        links={links}
        labels={labels}
        attachments={attachments}
        editHref={`/user/tracker/bills/${billId}/edit`}
      />

      {/* Provision summary + CTA */}
      <Section title="">
        <ProvisionSummary bill={bill} provisionAnns={provisionAnns} />
        <div className="mt-3">
          <button
            className="rounded-lg border px-3 py-1 text-sm"
            onClick={() =>
              router.push(`/user/tracker/bills/${billId}/provisions`)
            }
          >
            Annotated Provisions
          </button>
        </div>
      </Section>
    </section>
  );
}
