//components/politicians/CommitteeList.js
"use client";

export default function CommitteeList({ committees }) {
  if (!committees) return null;

  return (
    <section className="mb-8">
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">Committee Assignments</h2>
        {committees.length > 0 ? (
          <ul className="list-disc list-inside">
            {committees.map((committee, index) => (
              <li key={index}>{committee}</li>
            ))}
          </ul>
        ) : (
          <p>No committee assignments listed.</p>
        )}
      </div>
    </section>
  );
}
