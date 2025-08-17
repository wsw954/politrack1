//components/politicians/ContactInfo.js
"use client";

export default function ContactInfo({ contact }) {
  if (!contact) return null;

  const xHandle = contact.social_media?.X || null;
  const xHandleClean =
    typeof xHandle === "string" ? xHandle.replace(/^@/, "") : null;

  return (
    <section>
      <div className="bg-white border border-neutral-light rounded-xl shadow-sm p-6">
        <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
        {contact.email && (
          <p className="text-neutral-dark">
            <span className="text-neutral-muted">Email: </span>
            <a
              href={`mailto:${contact.email}`}
              className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary/30 rounded"
            >
              {contact.email}
            </a>
          </p>
        )}

        {contact.phone && (
          <p className="text-neutral-dark">
            <span className="text-neutral-muted">Phone: </span>
            <a
              href={`tel:${contact.phone}`}
              className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary/30 rounded"
            >
              {contact.phone}
            </a>
          </p>
        )}

        {xHandleClean && (
          <p className="text-neutral-dark">
            <span className="text-neutral-muted">X: </span>
            <a
              href={`https://x.com/${encodeURIComponent(xHandleClean)}`}
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary/30 rounded"
            >
              @{xHandleClean}
            </a>
          </p>
        )}
      </div>
    </section>
  );
}
