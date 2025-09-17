//components/annotation/AttachmentGallery.js
"use client";

/**
 * Props:
 * - items: [{ _id?, kind:"image", url, filename?, note? }]
 * - onAdd: (attachment) => void
 * - onRemove: (id) => void
 * - readOnly?: boolean
 */
export default function AttachmentGallery({
  items = [],
  onAdd,
  onRemove,
  readOnly = false,
}) {
  return (
    <div className="space-y-3">
      {!readOnly && (
        <div className="flex gap-2">
          {/* TODO: Replace prompt with your uploader. */}
          <button
            className="rounded-lg border px-3 py-1 text-sm"
            onClick={() => {
              const url = prompt("Paste image URL"); // placeholder flow
              if (url) onAdd({ kind: "image", url, note: "" });
            }}
          >
            Add image by URL
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {items.map((a) => (
          <figure
            key={a._id || a.url}
            className="rounded-lg border overflow-hidden bg-white"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={a.url}
              alt={a.filename || ""}
              className="w-full h-32 object-cover"
            />
            {a.note ? (
              <figcaption className="p-2 text-xs text-gray-600">
                {a.note}
              </figcaption>
            ) : null}
            {!readOnly && a._id ? (
              <div className="p-2">
                <button
                  className="text-xs text-red-600"
                  onClick={() => onRemove(a._id)}
                >
                  Remove
                </button>
              </div>
            ) : null}
          </figure>
        ))}
      </div>

      {items.length === 0 && (
        <p className="text-sm text-gray-500">No images yet.</p>
      )}
    </div>
  );
}
