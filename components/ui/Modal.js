//components/ui/Modal.js
"use client";

import { useState } from "react";

export default function Modal({ trigger, children }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div onClick={() => setOpen(true)}>{trigger}</div>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <button
              className="absolute top-4 right-4 text-neutral-muted"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
            {children}
          </div>
        </div>
      )}
    </>
  );
}
