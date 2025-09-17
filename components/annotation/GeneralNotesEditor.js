//components/annotation/GeneralNotesEditor.js
"use client";
import { useEffect, useState } from "react";

/**
 * Props:
 * - value: string
 * - onChange: (newText) => void
 * - readOnly?: boolean
 * - maxLength?: number
 */
export default function GeneralNotesEditor({
  value,
  onChange,
  readOnly = false,
  maxLength = 10000,
}) {
  const [text, setText] = useState(value || "");
  useEffect(() => {
    setText(value || "");
  }, [value]);

  if (readOnly) {
    return <div className="whitespace-pre-wrap text-sm">{text || "—"}</div>;
  }

  return (
    <div className="space-y-2">
      <textarea
        className="w-full min-h-[140px] rounded-xl border p-3"
        value={text}
        maxLength={maxLength}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add your context, reminders, or takeaways…"
      />
      <div className="text-xs text-gray-500">
        {text.length}/{maxLength}
      </div>
      <div className="flex justify-end">
        <button
          className="rounded-lg border px-3 py-1 text-sm"
          onClick={() => onChange(text)}
        >
          Save
        </button>
      </div>
    </div>
  );
}
