//components/annotation/LabelsChips.js
"use client";
import { useState } from "react";

/**
 * Props:
 * - items: [{ _id?, label, note? }]
 * - onAdd: ({ label, note? }) => void
 * - onRemove: (id) => void
 * - onEditNote: (id, note) => void
 * - readOnly?: boolean
 */
export default function LabelsChips({
  items = [],
  onAdd,
  onRemove,
  onEditNote,
  readOnly = false,
}) {
  const [label, setLabel] = useState("");

  return (
    <div className="space-y-3">
      {!readOnly && (
        <div className="flex gap-2">
          <input
            className="border rounded-md p-2"
            placeholder="Add a label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
          <button
            className="rounded-lg border px-3 py-1 text-sm"
            onClick={() => {
              if (!label) return;
              onAdd({ label });
              setLabel("");
            }}
          >
            Add
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {items.map((it) => (
          <div
            key={it._id || it.label}
            className="px-2 py-1 rounded-full border text-xs bg-white flex items-center gap-2"
          >
            <span>{it.label}</span>
            {!readOnly && it._id && (
              <>
                <button
                  className="underline"
                  onClick={() => {
                    const note = prompt("Label note", it.note || "");
                    if (note !== null) onEditNote(it._id, note);
                  }}
                >
                  note
                </button>
                <button
                  className="text-red-600"
                  onClick={() => onRemove(it._id)}
                >
                  ×
                </button>
              </>
            )}
          </div>
        ))}
        {items.length === 0 && (
          <span className="text-sm text-gray-500">No labels yet.</span>
        )}
      </div>
    </div>
  );
}
