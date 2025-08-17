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
    contact,
    committee_assignments = [],
    voting_history = [],
    consistency_meter = {},
  } = politician;

  // Normalize X handle (may be "@Handle" or null)
  const xHandle = contact?.social_media?.X || null;
  const xHandleClean =
    typeof xHandle === "string" ? xHandle.replace(/^@/, "") : null;

  return (
    <div className="w-full border border-neutral-light rounded-lg bg-white px-6 py-4 shadow-sm hover:shadow-md transition-shadow">
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
          <h2 className="text-xl font-semibold text-neutral-dark mb-1">
            {name}
          </h2>
          <p className="text-sm text-neutral-muted">
            {chamber} • {district}
          </p>
          <p className="text-sm text-neutral-dark">{party}</p>
        </div>
      </div>
      {/* Contact */}
      {contact && (
        <div className="mt-4 text-sm">
          <h3 className="text-sm font-semibold text-neutral-dark mb-1">
            Contact
          </h3>
          <ul className="space-y-1 text-neutral-dark">
            {contact.email && (
              <li>
                <span className="text-neutral-muted">Email: </span>
                <a
                  href={`mailto:${contact.email}`}
                  className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary/30 rounded"
                >
                  {contact.email}
                </a>
              </li>
            )}
            {contact.phone && (
              <li>
                <span className="text-neutral-muted">Phone: </span>
                <a
                  href={`tel:${contact.phone}`}
                  className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary/30 rounded"
                >
                  {contact.phone}
                </a>
              </li>
            )}
            {xHandleClean && (
              <li>
                <span className="text-neutral-muted">X: </span>
                <a
                  href={`https://x.com/${encodeURIComponent(xHandleClean)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary/30 rounded"
                >
                  @{xHandleClean}
                </a>
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Optional Fields */}
      {committee_assignments.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-neutral-dark mb-1">
            Committees:
          </h3>
          <ul className="list-disc list-inside text-sm text-neutral-dark">
            {committee_assignments.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      )}

      {voting_history.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-neutral-dark mb-1">
            Voting History:
          </h3>
          <ul className="text-sm text-neutral-dark">
            {voting_history.map((v) => (
              <li key={`${v.bill_id}-${v.session}`}>
                {v.topic}: {v.vote} ({v.session})
              </li>
            ))}
          </ul>
        </div>
      )}

      {consistency_meter?.party_alignment !== undefined && (
        <div className="mt-4 text-sm text-neutral-dark">
          <strong>Party Alignment:</strong> {consistency_meter.party_alignment}%
        </div>
      )}
      {politician.isTracked && (
        <span className="mt-2 w-fit max-w-max bg-accent-light text-accent-dark text-xs font-medium px-2 py-1 rounded-full">
          Tracked
        </span>
      )}
    </div>
  );
}
