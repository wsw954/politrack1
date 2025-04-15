// components/ui/PasswordInput.js
import { useState } from "react";

export default function PasswordInput({
  label,
  name,
  value,
  onChange,
  required = false,
}) {
  const [show, setShow] = useState(false);

  return (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          required={required}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-500"
        />
        <button
          type="button"
          onClick={() => setShow((prev) => !prev)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-blue-600"
        >
          {show ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
}
