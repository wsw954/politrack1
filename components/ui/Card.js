// components/ui/Card.js
"use client";

export default function Card({ children }) {
  return (
    <div className="bg-white rounded-xl shadow p-6 hover:shadow-md transition w-full md:w-80">
      {children}
    </div>
  );
}
