//app/user/tracker/bills/[id]edit/page.js
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useUserId } from "@/lib/useUserId";
import { getTrackedBill, patchTrackedBill } from "@/lib/trackerClient";

import PageHeader from "@/components/ui/PageHeader";
import Section from "@/components/annotation/Section";
import GeneralNotesEditor from "@/components/annotation/GeneralNotesEditor";
import LinksList from "@/components/annotation/LinksList";
import LabelsChips from "@/components/annotation/LabelsChips";

// small helpers
const byId = (x) => String(x._id);
const hasId = (x) => !!x && !!x._id;

export default function EditTrackedBillPage() {
  const params = useParams();
  const billId = params?.id;
  const { userId, status } = useUserId();

  // server data
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // local editable state
  const [generalNotes, setGeneralNotes] = useState("");
  const [links, setLinks] = useState([]); // [{_id?, url, title?, note?}]
  const [labels, setLabels] = useState([]); // [{_id?, label, note?}]

  // save state
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // baseline for diffing
  const [baseline, setBaseline] = useState({
    generalNotes: "",
    links: [],
    labels: [],
  });

  // load
  useEffect(() => {
    if (status === "loading") return;
    if (!userId || !billId) {
      setLoading(false);
      return;
    }

    let cancel = false;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await getTrackedBill(
          userId,
          billId /* { includeProvisions: false }*/
        );
        if (cancel) return;
        setData(res);

        const bn = res.generalNotes || "";
        const blinks = Array.isArray(res.links) ? res.links : [];
        const blabels = Array.isArray(res.labels) ? res.labels : [];

        setGeneralNotes(bn);
        setLinks(blinks);
        setLabels(blabels);

        setBaseline({ generalNotes: bn, links: blinks, labels: blabels });
      } catch (e) {
        if (!cancel) setErr(e.message || "Failed to load bill");
      } finally {
        if (!cancel) setLoading(false);
      }
    })();

    return () => {
      cancel = true;
    };
  }, [userId, status, billId]);

  // computed bits
  const bill = data?.itemId || {};
  const provisionsCount = Array.isArray(data?.provisionAnnotations)
    ? data.provisionAnnotations.length
    : 0;

  // diff helpers (add/remove only; editing existing notes is a remove+add in this MVP)
  const computeDiffs = () => {
    const baseLinkIds = new Set((baseline.links || []).filter(hasId).map(byId));
    const curLinkIds = new Set((links || []).filter(hasId).map(byId));
    const removeLinkIds = [...baseLinkIds].filter((id) => !curLinkIds.has(id));
    const addLinks = (links || [])
      .filter((l) => !hasId(l))
      .map((l) => ({ url: l.url, title: l.title, note: l.note }));

    const baseLabelIds = new Set(
      (baseline.labels || []).filter(hasId).map(byId)
    );
    const curLabelIds = new Set((labels || []).filter(hasId).map(byId));
    const removeLabelIds = [...baseLabelIds].filter(
      (id) => !curLabelIds.has(id)
    );
    const addLabels = (labels || [])
      .filter((l) => !hasId(l))
      .map((l) => ({ label: l.label, note: l.note }));

    // If you later support editing notes on existing labels/links, either:
    // - extend PATCH to support updates, or
    // - detect changed items and treat them as remove+add here.

    const generalNotesChanged =
      (generalNotes ?? "") !== (baseline.generalNotes ?? "");

    const payload = {};
    if (generalNotesChanged) payload.generalNotes = generalNotes;
    if (addLinks.length) payload.addLinks = addLinks;
    if (removeLinkIds.length) payload.removeLinkIds = removeLinkIds;
    if (addLabels.length) payload.addLabels = addLabels;
    if (removeLabelIds.length) payload.removeLabelIds = removeLabelIds;

    return payload;
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg("");
    try {
      const payload = computeDiffs();
      if (Object.keys(payload).length === 0) {
        setSaveMsg("No changes to save.");
      } else {
        await patchTrackedBill(userId, billId, payload);
        setSaveMsg("Saved.");
        // refresh baseline so further edits compute correct diffs
        setBaseline({ generalNotes, links, labels });
      }
    } catch (e) {
      setSaveMsg(e.message || "Failed to save changes.");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(""), 2000);
    }
  };

  // handlers passed to child components
  const handleAddLink = (l) => setLinks((arr) => [...arr, l]);
  const handleRemoveLink = (id) =>
    setLinks((arr) => arr.filter((x) => byId(x) !== String(id)));

  const handleAddLabel = (lbl) => setLabels((arr) => [...arr, lbl]);
  const handleRemoveLabel = (id) =>
    setLabels((arr) => arr.filter((x) => byId(x) !== String(id)));
  const handleEditLabelNote = (id, note) =>
    setLabels((arr) =>
      arr.map((x) => (byId(x) === String(id) ? { ...x, note } : x))
    );

  // render
  if (status === "loading")
    return (
      <div className="p-4 text-sm text-gray-600">Checking your session…</div>
    );
  if (!userId)
    return (
      <div className="p-4 text-sm text-gray-600">
        Please sign in to edit this bill.
      </div>
    );
  if (loading) return <div className="p-4 text-sm text-gray-600">Loading…</div>;
  if (err) return <div className="p-4 text-sm text-red-600">{err}</div>;
  if (!data) return <div className="p-4 text-sm text-gray-600">Not found.</div>;

  return (
    <section className="py-8 space-y-6">
      <PageHeader
        title={bill.title || "Edit Tracked Bill"}
        subtitle={[bill.number, bill.session].filter(Boolean).join(" • ")}
        right={
          <a
            className="rounded-lg border px-3 py-1 text-sm"
            href={`/user/tracker/bills/${billId}`}
          >
            View
          </a>
        }
      />

      <div className="grid gap-6">
        <Section title="General Notes">
          {/* autosave-on-change for a nicer edit experience */}
          <GeneralNotesEditor
            value={generalNotes}
            onChange={setGeneralNotes}
            autoSave
          />
        </Section>

        <Section title="Links" hint="Add links related to this bill.">
          <LinksList
            items={links}
            onAdd={handleAddLink}
            onRemove={handleRemoveLink}
          />
        </Section>

        <Section title="Attachments" hint="Images or media (coming soon).">
          <div className="text-sm text-gray-500">
            Attachment editing will be added later.
          </div>
        </Section>

        <Section
          title="Labels"
          hint="Short tags with optional notes for quick filtering."
        >
          <LabelsChips
            items={labels}
            onAdd={handleAddLabel}
            onRemove={handleRemoveLabel}
            onEditNote={handleEditLabelNote}
          />
          <p className="mt-2 text-xs text-gray-500">
            Editing a note on an existing label counts as remove+add when saving
            (MVP).
          </p>
        </Section>

        <div className="flex items-center justify-end gap-2">
          <button
            className="rounded-lg border px-3 py-1 text-sm"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
          {saveMsg ? (
            <span className="text-sm text-gray-600">{saveMsg}</span>
          ) : null}
        </div>

        <Section
          title="Provision Annotations"
          hint="You can annotate specific provisions (sections) of this bill."
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {provisionsCount} provision{provisionsCount === 1 ? "" : "s"}{" "}
              currently annotated.
            </p>
            <a
              href={`/user/tracker/bills/${billId}/provisions`}
              className="rounded-lg border px-3 py-1 text-sm"
            >
              Browse provisions
            </a>
          </div>
        </Section>
      </div>
    </section>
  );
}
