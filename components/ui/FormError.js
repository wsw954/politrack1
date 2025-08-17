// components/ui/FormError.js
"use client";

export default function FormError({ message }) {
  if (!message) return null;
  return <p className="text-danger text-sm mt-1">{message}</p>;
}
