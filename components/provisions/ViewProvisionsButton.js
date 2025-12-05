// components/provisions/ViewProvisionsButton.js
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ViewProvisionsButton({
  billId,
  provisionCount,
  isTracked = false,
}) {
  const href = isTracked
    ? `/user/tracker/bills/${billId}/provisions`
    : `/bills/${billId}/provisions`;

  if (!provisionCount || provisionCount === 0) {
    return (
      <p className="text-sm text-neutral-muted">
        No provisions available for this bill.
      </p>
    );
  }

  return (
    <Link
      href={href}
      className="inline-block bg-primary text-white px-4 py-2 rounded
                 hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/30"
    >
      View All Provisions ({provisionCount})
    </Link>
  );
}
