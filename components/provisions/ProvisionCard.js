// components/provisions/ProvisionCard.js
"use client";

export default function ProvisionCard({ provision }) {
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

  return (
    <div className="border border-neutral-light rounded-lg p-6 shadow-sm hover:shadow-md transition">
      {/* Section Number + Heading */}
      <h2 className="text-lg font-bold text-primary">
        Section {section_number || "—"}
      </h2>
      {heading && <p className="text-sm text-neutral-dark mt-1">{heading}</p>}

      {/* Legal text count */}
      <div className="mt-2">
        <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold bg-info-light text-info-dark">
          Legal Text Items: {legalTextCount ?? 0}
        </span>
      </div>

      {/* Summary */}
      <p className="mt-3 text-sm text-neutral-dark">
        <span className="font-semibold text-neutral-muted">Summary:</span>{" "}
        {truncate(summary)}
      </p>

      {/* Why it Matters */}
      <p className="mt-2 text-sm text-neutral-dark">
        <span className="font-semibold text-neutral-muted">
          Why It Matters:
        </span>{" "}
        {truncate(why_it_matters)}
      </p>

      {/* Tags */}
      {tags && tags.length > 0 && (
        <p className="mt-2 text-sm text-neutral-dark">
          <span className="font-semibold text-neutral-muted">Tags:</span>{" "}
          {tags.join(", ")}
        </p>
      )}

      {/* Type */}
      {type && (
        <p className="mt-2 text-sm text-neutral-dark">
          <span className="font-semibold text-neutral-muted">Type:</span> {type}
        </p>
      )}
    </div>
  );
}
