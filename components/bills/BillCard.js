// components/bills/BillCard.js
"use client";

import { normalizeId } from "@/utils/normalizeId";

export default function BillCard({ bill }) {
  const isTracked = bill.isTracked || false;
  const provisionCount = bill.provisionCount ?? 0;

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
      {/* Title */}
      <h2 className="text-xl font-bold text-primary">{bill.title}</h2>

      {/* Tracked (own line under title) */}
      {isTracked && (
        <div className="mt-2">
          <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-accent-light text-accent-dark">
            Tracked
          </span>
        </div>
      )}

      {/* Bill number */}
      <p className="mt-2 text-sm text-neutral-muted">
        <span className="font-semibold">Bill Number:</span> {bill.number}
      </p>

      {/* Summary */}
      <p className="mt-2 text-sm text-neutral-dark">
        <span className="font-semibold text-neutral-muted">Summary:</span>{" "}
        {bill.summary?.trim() ? bill.summary : "No summary available."}
      </p>

      {/* Tags */}
      {bill.tags && bill.tags.length > 0 && (
        <p className="mt-2 text-sm text-neutral-dark">
          <span className="font-semibold text-neutral-muted">Tags:</span>{" "}
          {bill.tags.join(", ")}
        </p>
      )}

      {/* Provisions badge (below Tags, above Current Status) */}
      <div className="mt-2">
        <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold bg-info-light text-info-dark">
          Provisions: {provisionCount}
        </span>
      </div>

      {/* Current Status */}
      {bill.current_stage && (
        <div className="mt-3">
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
  );
}
