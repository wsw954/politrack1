// /app/tags/[id]/page.js

import { notFound } from "next/navigation";
import { normalizeId } from "@/utils/normalizeId";
import AddToTrackerButton from "@/components/user/AddToTrackerButton";
import UnloggedTrackerPrompt from "@/components/user/UnloggedTrackerPrompt";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export default async function TagDetailPage({ params }) {
  const session = await getServerSession(authOptions);
  const awaitedParams = await params;
  const { id } = awaitedParams;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/tags/${normalizeId(id)}`
  );
  if (!res.ok) return notFound();

  const tag = await res.json();

  // optional: whitelist tag.color to known safe classes
  const allowedChipClasses = new Set([
    "bg-primary-dark",
    "bg-primary",
    "bg-accent-dark",
    "bg-accent",
  ]);
  const chipClass =
    (typeof tag.color === "string" && allowedChipClasses.has(tag.color)
      ? tag.color
      : "bg-primary-dark") + " text-white";

  return (
    <section className="py-8 space-y-6">
      {/* Tag Name */}
      <h1 className="text-3xl font-bold">
        Tag:{" "}
        <span
          className={`inline-block px-3 py-1 rounded-full font-semibold ${chipClass}`}
        >
          {tag.name}
        </span>
      </h1>

      {/* Track Button */}
      <div className="mt-2">
        {session ? (
          <AddToTrackerButton
            itemId={tag._id}
            itemType="Tag"
            redirectTo="/user/tracker/tags"
          />
        ) : (
          <UnloggedTrackerPrompt label="Tag" />
        )}
      </div>

      {/* Keywords */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Keywords</h2>
        {Array.isArray(tag.keywords) && tag.keywords.length > 0 ? (
          <ul className="list-disc list-inside text-neutral-dark">
            {tag.keywords.map((kw) => (
              <li key={kw}>{kw}</li>
            ))}
          </ul>
        ) : (
          <p className="text-neutral-muted">No keywords listed.</p>
        )}
      </div>

      <hr className="my-8 border-t border-neutral-light" />

      {/* Coming Soon */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Coming Soon</h2>
        <ul className="list-disc list-inside text-neutral-muted">
          <li>List of related bills</li>
          <li>Politicians who voted on those bills</li>
          <li>User tracker status for this tag</li>
        </ul>
      </div>
    </section>
  );
}
