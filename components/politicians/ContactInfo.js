//components/politicians/ContactInfo.js
"use client";

export default function ContactInfo({ contact }) {
  if (!contact) return null;

  return (
    <section className="mb-8">
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
        <p>
          <strong>Email:</strong> {contact.email}
        </p>
        <p>
          <strong>Phone:</strong> {contact.phone}
        </p>
        {contact.social_media?.twitter && (
          <p>
            <strong>Twitter:</strong> @{contact.social_media.twitter}
          </p>
        )}
      </div>
    </section>
  );
}
