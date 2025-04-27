//components/politicians/ConsistencyMeter.js
"use client";

export default function ConsistencyMeter({ consistency }) {
  if (!consistency) return null;

  const { party_alignment, topic_consistency } = consistency;

  return (
    <section className="mb-8">
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">Consistency Meter</h2>
        <p>
          <strong>Party Alignment:</strong> {party_alignment}%
        </p>

        {topic_consistency && Object.keys(topic_consistency).length > 0 && (
          <div className="mt-4">
            <h3 className="text-xl font-semibold mb-2">Topic Consistency:</h3>
            <ul className="list-disc list-inside">
              {Object.entries(topic_consistency).map(
                ([topic, consistency], index) => (
                  <li key={index}>
                    {topic}: {consistency}%
                  </li>
                )
              )}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
