//components/politicians/CommitteeList.js
"use client";

export default function CommitteeList({ committees }) {
  if (!committees) return null;

  const hasItems = Array.isArray(committees) && committees.length > 0;

  return (
    <section>
      <div className="bg-white border border-neutral-light rounded-xl shadow-sm p-6">
        <h2 className="text-2xl font-semibold mb-4">Committee Assignments</h2>
        {hasItems ? (
          <ul className="list-disc list-inside text-neutral-dark">
            {committees.map((committee, index) => (
              <li key={index}>{committee}</li>
            ))}
          </ul>
        ) : (
          <p className="text-neutral-muted">No committee assignments listed.</p>
        )}
      </div>
    </section>
  );
}
