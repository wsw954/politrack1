// components/annotations/BillAnnotationsCard.js

"use client";

import { useState, useMemo } from "react";
import Section from "@/components/annotation/Section";
import GeneralNotesEditor from "@/components/annotation/GeneralNotesEditor";
import LinksList from "@/components/annotation/LinksList";
import AttachmentGallery from "@/components/annotation/AttachmentGallery";
import LabelsChips from "@/components/annotation/LabelsChips";
import Accordion from "@/components/ui/Accordion";

export default function BillAnnotationsCard({
  notes = "",
  links = [],
  labels = [],
  attachments = [],
  editHref = "#",
}) {
  const counts = useMemo(
    () => ({
      links: links.length,
      attachments: attachments.length,
      labels: labels.length,
    }),
    [links, attachments, labels]
  );

  // Clamp long notes with a simple expand toggle
  const [notesExpanded, setNotesExpanded] = useState(false);
  const MAX_PREVIEW_CHARS = 1200;
  const notesPreview =
    !notesExpanded && notes.length > MAX_PREVIEW_CHARS
      ? notes.slice(0, MAX_PREVIEW_CHARS) + "…"
      : notes;

  return (
    <div className="rounded-2xl border p-4 bg-white">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Annotations</h2>
        <a href={editHref} className="rounded-lg border px-3 py-1 text-sm">
          Edit annotations
        </a>
      </div>

      <div className="mt-4 grid gap-6">
        {/* Notes */}
        <Section id="notes" title="General Notes">
          {notes ? (
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
          id="links"
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
          id="labels"
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
          id="attachments"
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
    </div>
  );
}
