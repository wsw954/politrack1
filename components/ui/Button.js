// components/ui/Button.js
"use client";

export default function Button({ children, onClick, type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="inline-block w-full bg-primary text-white text-sm font-medium py-2 px-4 rounded hover:bg-primary-dark transition"
    >
      {children}
    </button>
  );
}
