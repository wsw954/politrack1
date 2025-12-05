// components/provisions/ProvisionCard.js
"use client";

import InlineCountBadges from "@/components/annotation/InlineCountBadges";

export default function ProvisionCard({ provision, annotationSummary }) {
  const {
    section_number,
    heading,
    summary,
    why_it_matters,
    tags,
    type,
    legalTextCount,
  } = provision;

  // Truncate helper
  const truncate = (text, len = 120) =>
    text && text.length > len ? text.slice(0, len) + "…" : text || "";

  const hasAnnotations =
    annotationSummary &&
    (annotationSummary.hasNotes ||
      annotationSummary.linksCount ||
      annotationSummary.attachmentsCount ||
      annotationSummary.labelsCount);

  return (
    <div className="border border-neutral-light rounded-lg p-6 shadow-sm hover:shadow-md transition">
      <h2 className="text-lg font-bold text-primary">
        Section {section_number || "—"}
      </h2>
      {heading && <p className="text-sm text-neutral-dark mt-1">{heading}</p>}

      <p className="mt-3 text-sm text-neutral-dark">
        <span className="font-semibold text-neutral-muted">Summary:</span>{" "}
        {truncate(summary)}
      </p>

      <p className="mt-2 text-sm text-neutral-dark">
        <span className="font-semibold text-neutral-muted">
          Why It Matters:
        </span>{" "}
        {truncate(why_it_matters)}
      </p>

      {tags && tags.length > 0 && (
        <p className="mt-2 text-sm text-neutral-dark">
          <span className="font-semibold text-neutral-muted">Tags:</span>{" "}
          {tags.join(", ")}
        </p>
      )}

      {type && (
        <p className="mt-2 text-sm text-neutral-dark">
          <span className="font-semibold text-neutral-muted">Type:</span> {type}
        </p>
      )}

      <div className="mt-2 flex items-center justify-between">
        <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold bg-info-light text-info-dark">
          Legal Text Items: {legalTextCount ?? 0}
        </span>

        {hasAnnotations && (
          <InlineCountBadges
            links={annotationSummary.linksCount}
            attachments={annotationSummary.attachmentsCount}
            labels={annotationSummary.labelsCount}
          />
        )}
      </div>
    </div>
  );
}
