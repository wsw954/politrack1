// components/bills/SponsorCard.js
"use client";

import Link from "next/link";

export default function SponsorCard({ sponsor }) {
  if (!sponsor) {
    return (
      <p className="text-sm text-danger">Sponsor information not available.</p>
    );
  }

  const imageFileName =
    `${sponsor.first_name}_${sponsor.last_name}`.toLowerCase();
  const imageSrc = `/politicians/images/${imageFileName}.jpg`;
  const fallbackSrc = "/politicians/images/default.jpg"; // state flag or placeholder

  return (
    <Link
      href={`/politicians/${sponsor._id}`}
      className="flex items-center gap-4 mt-2 hover:bg-neutral-light p-2 rounded transition focus:outline-none focus:ring-2 focus:ring-primary/30"
    >
      <img
        src={imageSrc}
        alt={`${sponsor.first_name} ${sponsor.last_name}`}
        className="w-12 h-12 rounded-full object-cover border border-neutral-light"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = fallbackSrc;
        }}
      />
      <div>
        <h3 className="text-lg font-semibold text-neutral-dark">
          {sponsor.first_name} {sponsor.last_name}
        </h3>
        <p className="text-sm text-neutral-muted">
          {sponsor.chamber} • {sponsor.party}
        </p>
      </div>
    </Link>
  );
}
