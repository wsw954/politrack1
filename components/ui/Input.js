//components/ui/Input.js
"use client";

export default function Input({ label, ...props }) {
  return (
    <div className="flex flex-col space-y-1">
      {label && <label className="text-sm font-medium">{label}</label>}
      <input {...props} className="border rounded-md px-3 py-2" />
    </div>
  );
}
