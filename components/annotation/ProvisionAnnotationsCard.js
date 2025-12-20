// components/annotation/ProvisionAnnotationsCard.js
"use client";

import { useMemo, useState } from "react";
import Section from "@/components/annotation/Section";
import GeneralNotesEditor from "@/components/annotation/GeneralNotesEditor";
import LinksList from "@/components/annotation/LinksList";
import AttachmentGallery from "@/components/annotation/AttachmentGallery";
import LabelsChips from "@/components/annotation/LabelsChips";
import Accordion from "@/components/ui/Accordion";

/**
 * Provision-level annotations card, modeled after BillAnnotationsCard.
 *
 * Props:
 *  - annotations: {
 *      generalNotes?: string,
 *      links?: [],
 *      attachments?: [],
 *      labels?: []
 *    } | null
 *  - loading: boolean
 *  - error: string | null
 *  - onEdit?: () => void        // optional, for future drawer integration
 *  - editHref?: string          // optional legacy link
 */
export default function ProvisionAnnotationsCard({
  annotations,
  loading = false,
  error = null,
  onEdit,
  editHref = "#",
}) {
  if (loading) {
    return (
      <div className="rounded-2xl border p-4 bg-white">
        <h2 className="text-lg font-semibold mb-2">
          Your Annotations for This Provision
        </h2>
        <p className="text-sm text-gray-600">Loading annotations…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border p-4 bg-white">
        <h2 className="text-lg font-semibold mb-2">
          Your Annotations for This Provision
        </h2>
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  const notes = annotations?.generalNotes || "";
  const links = Array.isArray(annotations?.links) ? annotations.links : [];
  const attachments = Array.isArray(annotations?.attachments)
    ? annotations.attachments
    : [];
  const labels = Array.isArray(annotations?.labels) ? annotations.labels : [];

  const counts = useMemo(
    () => ({
      links: links.length,
      attachments: attachments.length,
      labels: labels.length,
    }),
    [links, attachments, labels]
  );

  const hasNotes = !!(notes && notes.trim());
  const hasAny =
    hasNotes || counts.links > 0 || counts.attachments > 0 || counts.labels > 0;

  const buttonText = hasAny ? "Edit annotations" : "Add annotations";

  const [notesExpanded, setNotesExpanded] = useState(false);
  const MAX_PREVIEW_CHARS = 1200;
  const notesPreview =
    !notesExpanded && notes.length > MAX_PREVIEW_CHARS
      ? notes.slice(0, MAX_PREVIEW_CHARS) + "…"
      : notes;

  return (
    <div className="rounded-2xl border p-4 bg-white">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          Your Annotations for This Provision
        </h2>

        {onEdit ? (
          <button
            type="button"
            onClick={onEdit}
            className="rounded-lg border px-3 py-1 text-sm"
          >
            {buttonText}
          </button>
        ) : (
          <a href={editHref} className="rounded-lg border px-3 py-1 text-sm">
            {buttonText}
          </a>
        )}
      </div>

      {!hasAny ? (
        <p className="mt-4 text-sm text-gray-600">
          You haven&apos;t added any annotations to this provision yet.
        </p>
      ) : (
        <div className="mt-4 grid gap-6">
          {/* Notes */}
          <Section id="prov-notes" title="General Notes">
            {hasNotes ? (
              <>
                <GeneralNotesEditor
                  value={notesPreview}
                  readOnly
                  onChange={() => {}}
                />
                {notes.length > MAX_PREVIEW_CHARS && (
                  <button
                    type="button"
                    className="mt-2 text-sm underline"
                    onClick={() => setNotesExpanded((v) => !v)}
                  >
                    {notesExpanded ? "Show less" : "Show more"}
                  </button>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-600">No notes yet.</p>
            )}
          </Section>

          {/* Links */}
          <Accordion
            id="prov-links"
            title="Links"
            count={counts.links}
            defaultOpen={false}
          >
            {counts.links ? (
              <LinksList items={links} readOnly />
            ) : (
              <p className="text-sm text-gray-600">No links yet.</p>
            )}
          </Accordion>

          {/* Labels */}
          <Accordion
            id="prov-labels"
            title="Labels"
            count={counts.labels}
            defaultOpen={false}
          >
            {counts.labels ? (
              <LabelsChips items={labels} readOnly />
            ) : (
              <p className="text-sm text-gray-600">No labels yet.</p>
            )}
          </Accordion>

          {/* Attachments */}
          <Accordion
            id="prov-attachments"
            title="Attachments"
            count={counts.attachments}
            defaultOpen={false}
          >
            {counts.attachments ? (
              <AttachmentGallery items={attachments} readOnly />
            ) : (
              <p className="text-sm text-gray-600">No attachments yet.</p>
            )}
          </Accordion>
        </div>
      )}
    </div>
  );
}
