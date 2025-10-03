// components/provisions/LegalTextItem.js
"use client";

export default function LegalTextItem({ item }) {
  const { section, title, statute_ref, text, source_page, extras } = item || {};

  return (
    <article
      id={`lt-${item?._id}`}
      className="border border-neutral-light rounded p-4"
    >
      {/* Line 1: section + optional title */}
      <div className="flex flex-wrap items-baseline gap-2">
        <h4 className="font-semibold text-primary">{section || "—"}</h4>
        {title && <span className="text-sm text-neutral-muted">— {title}</span>}
      </div>

      {/* Statute ref + source page */}
      <div className="mt-1 text-xs text-neutral-muted">
        {statute_ref && <span>Ref: {statute_ref}</span>}
        {Number.isFinite(source_page) && (
          <span className={statute_ref ? "ml-3" : ""}>Page: {source_page}</span>
        )}
      </div>

      {/* Main text */}
      {text && (
        <p className="mt-3 text-sm text-neutral-dark whitespace-pre-wrap">
          {text}
        </p>
      )}

      {/* Extras (key/value map of strings) */}
      {extras &&
        typeof extras === "object" &&
        Object.keys(extras).length > 0 && (
          <div className="mt-3 text-xs text-neutral-muted">
            {Object.entries(extras).map(([k, v]) => (
              <div key={k}>
                <span className="font-semibold">{k}:</span> {String(v)}
              </div>
            ))}
          </div>
        )}
    </article>
  );
}
