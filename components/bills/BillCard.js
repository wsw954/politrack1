// components/bills/BillCard.js
"use client";

import { normalizeId } from "@/utils/normalizeId";

export default function BillCard({ bill }) {
  const isTracked = bill.isTracked || false;

  const getStatusBadgeStyle = (status) => {
    if (!status) return "bg-neutral-light text-neutral-dark";
    const s = status.toLowerCase();
    if (s.includes("committee")) return "bg-warning-light text-warning-dark";
    if (s.includes("passed")) return "bg-success-light text-success-dark";
    if (s.includes("governor")) return "bg-info-light text-info-dark";
    if (s.includes("law")) return "bg-success-light text-success-dark";
    if (s.includes("veto")) return "bg-danger-light text-danger-dark";
    return "bg-neutral-light text-neutral-dark";
  };

  // ✅ Normalize bill._id inside the component
  const billId = normalizeId(bill._id || bill.id);

  return (
    <div className="border border-neutral-light rounded-lg p-6 shadow-sm hover:shadow-md transition">
      <div className="flex flex-col gap-2">
        {/* Bill Title */}
        <h2 className="text-xl font-bold text-primary">{bill.title}</h2>
        {isTracked && (
          <span className="mt-2 w-fit max-w-max bg-accent-light text-accent-dark text-xs font-medium px-2 py-1 rounded-full">
            Tracked
          </span>
        )}

        {/* Bill ID */}
        <p className="text-sm text-neutral-muted">
          <span className="font-semibold">Bill Number:</span> {bill.number}
        </p>

        {/* Summary */}
        <p className="text-sm text-neutral-dark">
          <span className="font-semibold text-neutral-muted">Summary:</span>{" "}
          {bill.summary?.trim() ? bill.summary : "No summary available."}
        </p>

        {/* Tags */}
        {bill.tags && bill.tags.length > 0 && (
          <p className="text-sm text-neutral-dark">
            <span className="font-semibold text-neutral-muted">Tags:</span>{" "}
            {bill.tags.map(normalizeId).join(", ")}
          </p>
        )}

        {/* Current Status with Badge */}
        {bill.current_stage && (
          <div className="mt-2">
            <span className="text-sm font-semibold text-neutral-muted">
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
