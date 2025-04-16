//components/ui/Dropdown.js
"use client";

export default function Dropdown({ label, options = [], value, onChange }) {
  return (
    <div className="flex flex-col space-y-1">
      {label && <label className="text-sm font-medium">{label}</label>}
      <select
        className="border rounded-md px-3 py-2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
