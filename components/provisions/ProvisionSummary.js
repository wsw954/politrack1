//components/provisions/ProvisionSummary.js

export default function ProvisionSummary({ bill, provisionAnns = [] }) {
  const provMap = new Map(
    (bill?.provisions || []).map((p) => [String(p._id), p])
  );
  const sample = provisionAnns.slice(0, 3).map((ann) => {
    const pv = provMap.get(String(ann.provisionId));
    return {
      id: String(ann._id || ann.provisionId),
      heading: pv?.heading || "Untitled provision",
      section: pv?.section_number || ann.anchorPath || "",
    };
  });

  return (
    <div className="rounded-xl border p-4" id="provisions">
      <div className="flex items-center justify-between">
        <div className="font-medium">
          Provision Annotations ({provisionAnns.length})
        </div>
      </div>
      {provisionAnns.length === 0 ? (
        <p className="mt-2 text-sm text-gray-600">
          No provision annotations yet.
        </p>
      ) : (
        <ul className="mt-3 list-disc pl-5 text-sm">
          {sample.map((s) => (
            <li key={s.id}>
              <span className="font-medium">{s.heading}</span>
              {s.section ? (
                <span className="text-gray-600"> — {s.section}</span>
              ) : null}
            </li>
          ))}
          {provisionAnns.length > 3 && (
            <li className="text-gray-600">…and more</li>
          )}
        </ul>
      )}
    </div>
  );
}
