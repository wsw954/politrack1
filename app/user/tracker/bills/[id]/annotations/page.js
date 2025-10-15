//app/user/tracker/bill/[id]/annotations/page.js

"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUserId } from "@/lib/useUserId";
import { getTrackedBill } from "@/lib/trackerClient";

import Section from "@/components/annotation/Section";
import GeneralNotesEditor from "@/components/annotation/GeneralNotesEditor";
import LinksList from "@/components/annotation/LinksList";
import AttachmentGallery from "@/components/annotation/AttachmentGallery";
import LabelsChips from "@/components/annotation/LabelsChips";
import BillCard from "@/components/bills/BillCard";
import ViewProvisionsButton from "@/components/provisions/ViewProvisionsButton";

function JumpBar() {
  const items = [
    { id: "general-notes", label: "General Notes" },
    { id: "links", label: "Links" },
    { id: "attachments", label: "Attachments" },
    { id: "labels", label: "Labels" },
    { id: "provisions", label: "Provision Annotations" },
  ];
  return (
    <nav className="sticky top-16 z-10 bg-white/80 backdrop-blur border rounded-xl px-2 py-2">
      <ul className="flex flex-wrap gap-2">
        {items.map((it) => (
          <li key={it.id}>
            <a
              href={`#${it.id}`}
              className="text-sm px-3 py-1 rounded-lg border hover:bg-gray-50"
            >
              {it.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function ProvisionAnnotations({ billId, provisionAnnotations = [], bill }) {
  if (!provisionAnnotations.length)
    return (
      <p className="text-sm text-gray-600">No provision annotations yet.</p>
    );

  // Build a quick lookup for bill provisions by _id to show headings
  const provById = new Map(
    (bill?.provisions || []).map((p) => [String(p._id), p])
  );

  return (
    <div className="space-y-4">
      {provisionAnnotations.map((ann) => {
        const pid = String(ann.provisionId);
        const pv = provById.get(pid);
        return (
          <div key={ann._id} className="rounded-xl border p-4">
            <div className="mb-3">
              <div className="text-sm text-gray-500">
                {ann.anchorPath || pv?.section_number || "Provision"}
              </div>
              <div className="font-medium">
                {pv?.heading || "Untitled provision"}
              </div>
            </div>

            {ann.generalNotes && (
              <div className="mb-3">
                <div className="text-xs font-semibold mb-1">Notes</div>
                <div className="whitespace-pre-wrap text-sm">
                  {ann.generalNotes}
                </div>
              </div>
            )}

            {!!ann.labels?.length && (
              <div className="mb-3">
                <div className="text-xs font-semibold mb-1">Labels</div>
                <LabelsChips items={ann.labels} readOnly />
              </div>
            )}

            {!!ann.links?.length && (
              <div className="mb-3">
                <div className="text-xs font-semibold mb-1">Links</div>
                <LinksList items={ann.links} readOnly />
              </div>
            )}

            {!!ann.attachments?.length && (
              <div>
                <div className="text-xs font-semibold mb-1">Attachments</div>
                <AttachmentGallery items={ann.attachments} readOnly />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function ViewAllAnnotationsPage() {
  const params = useParams();
  const billId = params?.id;
  const { userId, status } = useUserId();
  const router = useRouter();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!userId) {
      setLoading(false);
      return;
    }
    let abort = false;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        // include bill provisions so provision annotations can show headings
        const res = await getTrackedBill(userId, billId, {
          includeProvisions: true,
        });
        if (!abort) setData(res);
      } catch (e) {
        if (!abort) setErr(e.message || "Failed to load annotations");
      } finally {
        if (!abort) setLoading(false);
      }
    })();
    return () => {
      abort = true;
    };
  }, [userId, status, billId]);

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
    return (
      <div className="p-4 text-sm text-gray-600">Loading annotations…</div>
    );
  if (err) return <div className="p-4 text-sm text-red-600">{err}</div>;
  if (!data) return <div className="p-4 text-sm text-gray-600">Not found.</div>;

  const bill = data?.itemId || {};
  const notes = data?.generalNotes || "";
  const links = data?.links || [];
  const attachments = data?.attachments || [];
  const labels = data?.labels || [];
  const provisionAnns = data?.provisionAnnotations || [];

  const counts = {
    links: links?.length ?? 0,
    attachments: attachments?.length ?? 0,
    labels: labels?.length ?? 0,
    provisions: provisionAnns?.length ?? 0,
  };

  return (
    <section className="py-8 space-y-6">
      {/* Header card */}
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
        <div className="mt-4 flex gap-3">
          <button
            onClick={() => router.push(`/user/tracker/bills/${billId}`)}
            className="rounded-lg border px-3 py-1 text-sm"
          >
            Back to Tracked Bill
          </button>
          <a
            href={`/user/tracker/bills/${billId}/edit`}
            className="rounded-lg border px-3 py-1 text-sm"
          >
            Edit annotations
          </a>
          <ViewProvisionsButton
            billId={billId}
            provisionCount={bill?.provisions?.length ?? counts.provisions}
          />
        </div>
      </div>

      <JumpBar />

      <div className="grid gap-6">
        <Section id="general-notes" title="General Notes">
          {notes ? (
            <GeneralNotesEditor value={notes} readOnly onChange={() => {}} />
          ) : (
            <p className="text-sm text-gray-600">No general notes yet.</p>
          )}
        </Section>

        <Section id="links" title={`Links (${counts.links})`}>
          {counts.links ? (
            <LinksList items={links} readOnly />
          ) : (
            <p className="text-sm text-gray-600">No links yet.</p>
          )}
        </Section>

        <Section id="attachments" title={`Attachments (${counts.attachments})`}>
          {counts.attachments ? (
            <AttachmentGallery items={attachments} readOnly />
          ) : (
            <p className="text-sm text-gray-600">No attachments yet.</p>
          )}
        </Section>

        <Section id="labels" title={`Labels (${counts.labels})`}>
          {counts.labels ? (
            <LabelsChips items={labels} readOnly />
          ) : (
            <p className="text-sm text-gray-600">No labels yet.</p>
          )}
        </Section>

        <Section
          id="provisions"
          title={`Provision Annotations (${counts.provisions})`}
        >
          <ProvisionAnnotations
            billId={billId}
            provisionAnnotations={provisionAnns}
            bill={bill}
          />
        </Section>
      </div>
    </section>
  );
}
