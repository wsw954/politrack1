//components/politicians/ConsistencyMeter.js
"use client";

export default function ConsistencyMeter({ consistency }) {
  if (!consistency) return null;

  const { party_alignment, topic_consistency } = consistency;

  return (
    <section>
      <div className="bg-white border border-neutral-light rounded-xl shadow-sm p-6">
        <h2 className="text-2xl font-semibold mb-4">Consistency Meter</h2>
        <p>
          <strong>Party Alignment:</strong> {party_alignment}%
        </p>

        {topic_consistency && Object.keys(topic_consistency).length > 0 && (
          <div className="mt-4">
            <h3 className="text-xl font-semibold mb-2">Topic Consistency:</h3>
            <ul className="list-disc list-inside text-neutral-dark">
              {Object.entries(topic_consistency).map(([topic, value], i) => (
                <li key={i}>
                  {topic}: {value}%
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
