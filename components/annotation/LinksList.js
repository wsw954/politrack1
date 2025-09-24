//ccomponents/annotation/LinkList.js
"use client";
import { useState } from "react";

/**
 * Props:
 * - items: [{ _id?, url, title?, note? }]
 * - onAdd: (link) => void  // link = { url, title?, note? }
 * - onRemove: (id) => void
 * - readOnly?: boolean
 */
export default function LinksList({
  items = [],
  onAdd,
  onRemove,
  readOnly = false,
}) {
  const [row, setRow] = useState({ url: "", title: "", note: "" });

  return (
    <div className="space-y-4">
      {!readOnly && (
        <div className="grid gap-2 md:grid-cols-3">
          <input
            className="border rounded-md p-2"
            placeholder="URL"
            value={row.url}
            onChange={(e) => setRow({ ...row, url: e.target.value })}
          />
          <input
            className="border rounded-md p-2"
            placeholder="Title (optional)"
            value={row.title}
            onChange={(e) => setRow({ ...row, title: e.target.value })}
          />
          <input
            className="border rounded-md p-2"
            placeholder="Mini note (optional)"
            value={row.note}
            onChange={(e) => setRow({ ...row, note: e.target.value })}
          />
          <div className="md:col-span-3 flex justify-end">
            <button
              className="rounded-lg border px-3 py-1 text-sm"
              onClick={() => {
                if (!row.url) return;
                onAdd({ url: row.url, title: row.title, note: row.note });
                setRow({ url: "", title: "", note: "" });
              }}
            >
              Add link
            </button>
          </div>
        </div>
      )}

      <ul className="space-y-3">
        {items.map((l) => (
          <li key={l._id || l.url} className="rounded-lg border p-3">
            <div className="flex justify-between items-start gap-3">
              <div>
                <a
                  className="text-sm underline break-all"
                  href={l.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {l.title || l.url}
                </a>
                {l.note ? (
                  <p className="text-xs text-gray-600 mt-1">{l.note}</p>
                ) : null}
              </div>
              {!readOnly && l._id ? (
                <button
                  className="text-xs text-red-600"
                  onClick={() => onRemove(l._id)}
                >
                  Remove
                </button>
              ) : null}
            </div>
          </li>
        ))}
        {items.length === 0 && (
          <li className="text-sm text-gray-500">No links yet.</li>
        )}
      </ul>
    </div>
  );
}
