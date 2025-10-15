//components/ui/Accordion.js

"use client";
import { useState } from "react";

export default function Accordion({
  id,
  title,
  count,
  defaultOpen = false,
  children,
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div id={id} className="rounded-xl border">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3"
        aria-expanded={open}
        aria-controls={`${id}-panel`}
      >
        <span className="font-medium">
          {title}
          {typeof count === "number" ? ` (${count})` : ""}
        </span>
        <span className="text-sm text-gray-600">{open ? "Hide" : "Show"}</span>
      </button>
      {open && (
        <div id={`${id}-panel`} className="px-4 pb-4">
          {children}
        </div>
      )}
    </div>
  );
}
