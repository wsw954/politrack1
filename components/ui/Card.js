// components/ui/Card.js
"use client";

export default function Card({ children, className = "" }) {
  return (
    <div className={`bg-white shadow-md rounded-2xl p-6 ${className}`}>
      {children}
    </div>
  );
}
