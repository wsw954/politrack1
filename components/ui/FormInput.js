// components/ui/FormInput.js
"use client";

export default function FormInput({
  label,
  name,
  type = "text", // or "textarea"
  value,
  onChange,
  required = false,
  rows = 4,
  placeholder = "",
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-neutral-dark mb-1"
      >
        {label}
      </label>

      {type === "textarea" ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          rows={rows}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-neutral-light rounded-md shadow-sm focus:outline-none focus:ring focus:border-primary"
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-neutral-light rounded-md shadow-sm focus:outline-none focus:ring focus:border-primary"
        />
      )}
    </div>
  );
}
