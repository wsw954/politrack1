//components/PoliticianCard.js
"use client";

import Image from "next/image";

export default function PoliticianCard({ politician }) {
  const { name, party, district, chamber, photo } = politician;

  return (
    <div className="w-full border border-gray-200 rounded-lg bg-white px-6 py-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-6">
        {/* Photo */}
        <div className="flex-shrink-0">
          <Image
            src={photo}
            alt={name}
            width={72}
            height={72}
            className="rounded-full object-cover"
          />
        </div>

        {/* Info */}
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">{name}</h2>
          <p className="text-sm text-gray-600">
            {chamber} • {district}
          </p>
          <p className="text-sm text-gray-700">{party}</p>
        </div>
      </div>
    </div>
  );
}
