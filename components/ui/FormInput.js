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
  const baseField =
    "w-full px-3 py-2 border border-neutral-light rounded-md " +
    "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary";

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
          className={baseField}
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
          className={baseField}
        />
      )}
    </div>
  );
}
