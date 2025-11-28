//components/user/AddAnnotationsDialog.js
"use client";

import { useEffect, useState } from "react";
import Section from "@/components/annotation/Section";
import GeneralNotesEditor from "@/components/annotation/GeneralNotesEditor";
import LabelsChips from "@/components/annotation/LabelsChips";
import LinksList from "@/components/annotation/LinksList";

/**
 * Props:
 * - isOpen: boolean
 * - onClose: () => void
 * - onSkipAndSave: () => Promise<void> | void
 * - onSaveWithAnnotations: ({ generalNotes, labels, links }) => Promise<void> | void
 * - billId?: string  // optional, for context in header
 */
export default function AddAnnotationsDialog({
  isOpen,
  onClose,
  onSkipAndSave,
  onSaveWithAnnotations,
  billId,
}) {
  const [generalNotes, setGeneralNotes] = useState("");
  const [labels, setLabels] = useState([]); // [{ label, note? }]
  const [links, setLinks] = useState([]); // [{ url, title?, note? }]
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // reset on isOpen/close
  useEffect(() => {
    if (!isOpen) {
      setGeneralNotes("");
      setLabels([]);
      setLinks([]);
      setBusy(false);
      setError("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddLabel = (lbl) => {
    // lbl = { label, note? }
    if (!lbl?.label) return;
    if (labels.length >= 50) {
      setError("Maximum 50 labels.");
      return;
    }
    setLabels((arr) => [...arr, lbl]);
  };
  const handleRemoveLabel = (id) => {
    // during pre-save, items have no _id yet; remove by index/label
    setLabels((arr) => arr.filter((x) => x._id !== id && x.label !== id));
  };
  const handleEditLabelNote = (id, note) => {
    setLabels((arr) =>
      arr.map((x) =>
        (x._id && x._id === id) || (!x._id && x.label === id)
          ? { ...x, note }
          : x
      )
    );
  };

  const handleAddLink = (link) => {
    // link = { url, title?, note? }
    if (!link?.url) return;
    try {
      // basic url sanity
      // eslint-disable-next-line no-new
      new URL(link.url);
    } catch {
      setError("Please enter a valid URL (e.g., https://example.com).");
      return;
    }
    setLinks((arr) => [...arr, link]);
    setError("");
  };
  const handleRemoveLink = (id) => {
    setLinks((arr) =>
      arr.filter((x, idx) => x._id !== id && String(idx) !== String(id))
    );
  };

  const handleSave = async () => {
    try {
      setBusy(true);
      setError("");

      await onSaveWithAnnotations({
        generalNotes,
        labels,
        links,
      });
    } catch (e) {
      setError(e?.message || "Failed to save with annotations.");
    } finally {
      setBusy(false);
    }
  };

  const handleSkip = async () => {
    try {
      setBusy(true);
      setError("");
      await onSkipAndSave();
    } catch (e) {
      setError(e?.message || "Failed to save.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => !busy && onClose()}
      />
      {/* panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-xl bg-white shadow-xl overflow-y-auto">
        <div className="p-5 border-b flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">
              Add annotations before tracking
            </h2>
            <p className="text-xs text-gray-600">
              {billId
                ? `Bill: ${billId}`
                : "Optional: add context now; you can always edit later."}
            </p>
          </div>
          <button
            className="text-sm text-gray-600 hover:text-gray-900"
            onClick={() => !busy && onClose()}
          >
            Close
          </button>
        </div>

        <div className="p-5 space-y-6">
          <Section
            title="General Notes"
            hint="Capture why you’re tracking this bill."
          >
            <GeneralNotesEditor
              value={generalNotes}
              onChange={setGeneralNotes}
              readOnly={false}
              maxLength={10000}
              autoSave
            />
          </Section>

          <Section
            title="Labels"
            hint="Quick tags for filtering later (e.g., Follow-up, Budget Risk)."
          >
            <LabelsChips
              items={labels}
              readOnly={false}
              onAdd={handleAddLabel}
              onRemove={handleRemoveLabel}
              onEditNote={handleEditLabelNote}
            />
          </Section>

          <Section
            title="Links"
            hint="Add up to a few sources now; expand later if needed."
          >
            <LinksList
              items={links}
              readOnly={false}
              onAdd={handleAddLink}
              onRemove={handleRemoveLink}
            />
          </Section>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </div>

        {/* footer actions */}
        <div className="p-5 border-t flex items-center justify-end gap-2">
          <button
            className="rounded-lg border px-3 py-1 text-sm"
            onClick={handleSkip}
            disabled={busy}
          >
            {busy ? "Saving…" : "Skip & Save"}
          </button>
          <button
            className="rounded-lg border px-3 py-1 text-sm"
            onClick={handleSave}
            disabled={busy}
          >
            {busy ? "Saving…" : "Save with Annotations"}
          </button>
        </div>
      </div>
    </div>
  );
}
