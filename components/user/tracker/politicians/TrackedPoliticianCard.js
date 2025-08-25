// components/user/tracker/politicians/TrackedPoliticianCard.js
"use client";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function TrackedPoliticianCard({
  politician, // populated politician doc
  tracked, // { note, createdAt, updatedAt, ... }
  onEditNote, // () => void
  onUntrack, // () => void
}) {
  if (!politician) return null;

  const name = [politician.first_name, politician.last_name]
    .filter(Boolean)
    .join(" ");
  const photo =
    politician.photo_url?.replace?.("/app/public", "") ||
    "/politicians/images/default.jpg";

  return (
    <Card className="p-6 overflow-hidden">
      {/* Summary (photo + basics) */}
      <div className="flex items-start gap-4">
        <img
          src={photo}
          alt={name}
          className="w-24 h-24 object-cover rounded-xl border border-neutral-light shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h2
            className="text-2xl font-bold leading-snug whitespace-normal break-words"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {name}
          </h2>
          <p className="text-neutral-dark whitespace-normal break-words">
            {politician.party} • {politician.chamber}
            {politician.district ? ` • District ${politician.district}` : ""}
          </p>
          {/* email may be a single long token: force breaks */}
          {politician.contact?.email && (
            <p className="text-sm text-neutral-muted mt-1">
              <a
                href={`mailto:${politician.contact.email}`}
                className="text-primary hover:underline break-all inline-block max-w-full"
              >
                {politician.contact.email}
              </a>
            </p>
          )}
        </div>
      </div>

      {/* Tracking panel */}
      <div className="mt-6 bg-neutral-50 border border-neutral-light rounded-xl p-4">
        {/* Note box */}
        <div className="bg-white border border-neutral-light rounded-lg p-3 mb-3">
          <p className="text-xs text-neutral-muted mb-1">Note</p>
          <p className="text-sm italic whitespace-pre-wrap break-words">
            {tracked?.note?.trim() ? tracked.note : "No note added."}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <Button onClick={onEditNote}>Edit Note</Button>
          <Button variant="destructive" onClick={onUntrack}>
            Untrack
          </Button>
        </div>

        {tracked?.updatedAt && (
          <p className="text-xs text-neutral-muted mt-3">
            Updated {new Date(tracked.updatedAt).toLocaleDateString()}
          </p>
        )}
      </div>
    </Card>
  );
}
