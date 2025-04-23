//components/ui/FlexRow.js
"use client";

export default function FlexRow({ children }) {
  return (
    <div className="flex flex-col md:flex-row flex-wrap gap-6 justify-center items-start">
      {children}
    </div>
  );
}
