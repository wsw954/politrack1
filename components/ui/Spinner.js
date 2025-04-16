//components/ui/Spinner.js
"use client";

export default function Spinner() {
  return (
    <div className="flex items-center justify-center">
      <div className="h-5 w-5 border-4 border-t-transparent border-blue-600 rounded-full animate-spin"></div>
    </div>
  );
}
