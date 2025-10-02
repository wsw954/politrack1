// components/provisions/ViewProvisionsButton.js
"use client";

import Link from "next/link";

export default function ViewProvisionsButton({ billId, provisionCount }) {
  if (!provisionCount || provisionCount === 0) {
    return (
      <p className="text-sm text-neutral-muted">
        No provisions available for this bill.
      </p>
    );
  }

  return (
    <Link
      href={`/bills/${billId}/provisions`}
      className="inline-block bg-primary text-white px-4 py-2 rounded
                 hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/30"
    >
      View All Provisions ({provisionCount})
    </Link>
  );
}
