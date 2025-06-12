// app/tags/[id]/page.js
import { notFound } from "next/navigation";
import { normalizeId } from "@/utils/normalizeId";

export default async function TagDetailPage({ params }) {
  const awaitedParams = await params;
  const { id } = awaitedParams;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/tags/${normalizeId(id)}`
  );
  if (!res.ok) return notFound();

  const tag = await res.json();

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-4">
        Tag:{" "}
        <span
          className={`inline-block px-3 py-1 rounded-full font-semibold text-white ${
            tag.color || "bg-gray-600"
          }`}
        >
          {tag.name}
        </span>
      </h1>

      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Keywords</h2>
        {tag.keywords && tag.keywords.length > 0 ? (
          <ul className="list-disc pl-6 text-gray-700">
            {tag.keywords.map((kw) => (
              <li key={kw}>{kw}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No keywords listed.</p>
        )}
      </div>

      <hr className="border-t border-gray-300 my-8" />

      {/* Future enhancements */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Coming Soon
        </h2>
        <ul className="list-disc pl-6 text-gray-500">
          <li>List of related bills</li>
          <li>Politicians who voted on those bills</li>
          <li>User tracker status for this tag</li>
        </ul>
      </div>
    </div>
  );
}
