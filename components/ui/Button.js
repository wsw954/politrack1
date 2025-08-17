// components/ui/Button.js
"use client";

export default function Button({ children, onClick, type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="inline-block w-full bg-primary text-white text-sm font-medium py-2 px-4 rounded
           hover:bg-primary-dark transition
           focus:outline-none focus:ring-2 focus:ring-primary/50
           disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
}
