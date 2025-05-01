// components/bills/BillCard.js
"use client";

export default function BillCard({ bill }) {
  const getStatusBadgeStyle = (status) => {
    if (!status) return "bg-gray-100 text-gray-700"; // fallback

    const normalizedStatus = status.toLowerCase();

    if (normalizedStatus.includes("committee"))
      return "bg-yellow-100 text-yellow-800";
    if (normalizedStatus.includes("passed"))
      return "bg-green-100 text-green-800";
    if (normalizedStatus.includes("governor"))
      return "bg-blue-100 text-blue-800";
    if (normalizedStatus.includes("law")) return "bg-green-200 text-green-900";
    if (normalizedStatus.includes("veto")) return "bg-red-100 text-red-800";

    return "bg-gray-100 text-gray-700"; // default
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition">
      <div className="flex flex-col gap-2">
        {/* Bill Title */}
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

        {/* Current Status with Badge */}
        {bill.current_stage && (
          <div className="mt-2">
            <span className="text-sm font-semibold text-gray-600">
              Current Status:
            </span>{" "}
            <span
              className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeStyle(
                bill.current_stage
              )}`}
            >
              {bill.current_stage}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
