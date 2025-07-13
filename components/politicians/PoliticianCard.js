//components/PoliticianCard.js
"use client";

import Image from "next/image";

export default function PoliticianCard({ politician }) {
  const {
    name,
    party,
    district,
    chamber,
    photo,
    // contact,
    committee_assignments = [],
    voting_history = [],
    consistency_meter = {},
  } = politician;

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

      {/* Optional Fields */}
      {committee_assignments.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-1">
            Committees:
          </h3>
          <ul className="list-disc list-inside text-sm text-gray-700">
            {committee_assignments.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      )}

      {voting_history.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-1">
            Voting History:
          </h3>
          <ul className="text-sm text-gray-700">
            {voting_history.map((v) => (
              <li key={`${v.bill_id}-${v.session}`}>
                {v.topic}: {v.vote} ({v.session})
              </li>
            ))}
          </ul>
        </div>
      )}

      {consistency_meter?.party_alignment !== undefined && (
        <div className="mt-4 text-sm text-gray-800">
          <strong>Party Alignment:</strong> {consistency_meter.party_alignment}%
        </div>
      )}
      {politician.isTracked && (
        <span className="mt-2 w-fit max-w-max bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
          Tracked
        </span>
      )}
    </div>
  );
}
