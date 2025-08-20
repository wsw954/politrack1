// components/tags/TagCard.js
"use client";

export default function TagCard({ tag }) {
  const {
    name,
    keywords = [],
    isTracked = false,
    // Optional: if you later store a UI color on the tag doc (e.g., "bg-primary-light text-primary-dark")
    color,
  } = tag;

  return (
    <div className="bg-white border border-neutral-light rounded-xl shadow-sm p-6 hover:shadow-md transition w-full">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold text-neutral-dark">{name}</h2>

        {isTracked && (
          <span className="w-fit max-w-max bg-accent-light text-accent-dark text-xs font-medium px-2 py-1 rounded-full">
            Tracked
          </span>
        )}

        {Array.isArray(keywords) && keywords.length > 0 ? (
          <ul className="text-sm text-neutral-muted list-disc list-inside">
            {keywords.map((kw, i) => (
              <li key={i}>{kw}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-neutral-muted">No keywords provided.</p>
        )}
      </div>
    </div>
  );
}
