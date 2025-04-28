// components/bills/BillCard.js
"use client";

export default function BillCard({ bill }) {
  return (
    <div className="border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition">
      <div className="flex flex-col gap-2">
        {/* Bill Title (highlighted) */}
        <h2 className="text-xl font-bold text-blue-700">{bill.title}</h2>

        {/* Bill ID */}
        <p className="text-sm text-gray-600">
          <span className="font-semibold">Bill ID:</span> {bill.id}
        </p>

        {/* Summary */}
        <p className="text-sm text-gray-700">
          <span className="font-semibold text-gray-600">Summary:</span>{" "}
          {bill.summary}
        </p>

        {/* Tags */}
        {bill.tags && bill.tags.length > 0 && (
          <p className="text-sm text-gray-700">
            <span className="font-semibold text-gray-600">Tags:</span>{" "}
            {bill.tags.join(", ")}
          </p>
        )}

        {/* Current Status */}
        {bill.current_stage && (
          <p className="text-sm text-gray-700">
            <span className="font-semibold text-gray-600">Current Status:</span>{" "}
            {bill.current_stage}
          </p>
        )}
      </div>
    </div>
  );
}
