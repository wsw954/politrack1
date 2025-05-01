// /components/bills/SponsorCard.js
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function SponsorCard({ sponsorId }) {
  const [sponsor, setSponsor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSponsor() {
      try {
        console.log("Sponsor ID:", sponsorId);
        const res = await fetch(`/api/politicians/${sponsorId}`);
        if (!res.ok) throw new Error("Failed to fetch sponsor");
        const data = await res.json();
        console.log(data);
        setSponsor(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load sponsor information.");
      } finally {
        setLoading(false);
      }
    }

    if (sponsorId) fetchSponsor();
  }, [sponsorId]);

  if (loading) return <p>Loading sponsor info...</p>;
  if (error || !sponsor)
    return <p className="text-red-500">{error || "Sponsor not found."}</p>;

  // After this, sponsor is guaranteed to exist:
  const imageFileName =
    `${sponsor.first_name}_${sponsor.last_name}`.toLowerCase();
  const imageSrc = `/politicians/images/${imageFileName}.jpg`;

  return (
    <Link
      href={`/politicians/${sponsor._id}`}
      className="flex items-center gap-4 mt-2 hover:bg-gray-50 p-2 rounded transition"
    >
      <img
        src={imageSrc}
        alt={sponsor.name}
        className="w-12 h-12 rounded-full object-cover border"
        onError={(e) => {
          e.target.onerror = null; // prevent infinite loop
          e.target.src = "/politicians/images/default.jpg";
        }}
      />{" "}
      <div>
        <h3 className="text-lg font-semibold">
          {sponsor.first_name + " " + sponsor.last_name}
        </h3>
        <p className="text-sm text-gray-600">
          {sponsor.chamber} • {sponsor.party}
        </p>
      </div>
    </Link>
  );
}
