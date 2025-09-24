//app/user/tracker/bills/[id]/page.js
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useUserId } from "@/lib/useUserId";
import { getTrackedBill } from "@/lib/trackerClient";
import SponsorCard from "@/components/bills/SponsorCard";
import BillCard from "@/components/bills/BillCard";
import PageHeader from "@/components/ui/PageHeader";
import Section from "@/components/annotation/Section";
import GeneralNotesEditor from "@/components/annotation/GeneralNotesEditor";
import InlineCountBadges from "@/components/annotation/InlineCountBadges";

export default function ViewTrackedBillPage() {
  const params = useParams();
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

  // ---- derive values with safe defaults (so hooks can run every render) ----
  const bill = data?.itemId || {};
  const notes = data?.generalNotes || "";
  const links = data?.links || [];
  const attachments = data?.attachments || [];
  const labels = data?.labels || [];
  const provisionAnns = data?.provisionAnnotations || [];

  // ✅ useMemo is now called on EVERY render (even while loading)
  const summary = useMemo(() => {
    return {
      linksCount: links.length,
      attachmentsCount: attachments.length,
      labelsCount: labels.length,
      provisionsAnnotatedCount: provisionAnns.length,
    };
  }, [links, attachments, labels, provisionAnns]);

  // ---- render states (these are fine AFTER all hooks above) ----
  if (status === "loading")
    return (
      <div className="p-4 text-sm text-gray-600">Checking your session…</div>
    );
  if (!userId)
    return (
      <div className="p-4 text-sm text-gray-600">
        Please sign in to view this page.
      </div>
    );
  if (loading)
    return <div className="p-4 text-sm text-gray-600">Loading bill…</div>;
  if (err) return <div className="p-4 text-sm text-red-600">{err}</div>;
  if (!data)
    return <div className="p-4 text-sm text-gray-600">Bill not found.</div>;

  return (
    <section className="py-8 space-y-6">
      <PageHeader
        title={bill.title || "Tracked Bill"}
        subtitle={[bill.number, bill.session].filter(Boolean).join(" • ")}
      />

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
          }}
        />
        <section className="mt-6">
          <h2 className="text-xl font-semibold">Sponsor</h2>
          <SponsorCard sponsor={bill.sponsor} />
        </section>
      </div>

      <div className="grid gap-6">
        <Section
          title="General Notes"
          hint="Your overall thoughts or reminders about this bill."
        >
          <GeneralNotesEditor value={notes} readOnly onChange={() => {}} />
        </Section>

        <Section
          title="Annotations Summary"
          hint="A quick snapshot of your saved context for this bill."
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <InlineCountBadges
              links={summary.linksCount}
              attachments={summary.attachmentsCount}
              labels={summary.labelsCount}
            />
            <div className="text-xs text-gray-600">
              {summary.provisionsAnnotatedCount} provision
              {summary.provisionsAnnotatedCount === 1 ? "" : "s"} annotated
            </div>
          </div>

          <div className="mt-3">
            <a
              href={`/user/tracker/bills/${billId}/edit`}
              className="inline-block rounded-lg border px-3 py-1 text-sm"
            >
              Manage annotations
            </a>
          </div>
        </Section>
      </div>
    </section>
  );
}
