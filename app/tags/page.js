// app/tags/page.js
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import TagCard from "@/components/tags/TagCard";
import Link from "next/link";
import { fetchTrackedIds } from "@/utils/fetchTrackedIds";

export default function TagListPage() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { data: session } = useSession();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/tags");
        if (!res.ok) throw new Error("Failed to fetch tags");
        const tagData = await res.json();

        const trackedIds = await fetchTrackedIds("tags");
        const mergedTags = tagData.map((tag) => ({
          ...tag,
          isTracked: trackedIds.has(tag._id),
        }));

        setTags(mergedTags);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <section className="py-8 space-y-6">
      <h1 className="text-3xl font-bold text-center">Browse Tags (Issues)</h1>

      <div className="bg-white border border-neutral-light rounded-xl shadow-sm p-6">
        <p className="text-neutral-dark text-sm">
          Tags represent major issue areas like Education, Housing, or the
          Environment. Use them to explore related bills and see how politicians
          vote on the issues you care about.
        </p>
      </div>

      <hr className="border-t border-neutral-light" />

      {loading && <p className="text-neutral-muted">Loading...</p>}
      {error && <p className="text-danger">{error}</p>}

      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {tags.map((tag) => {
            const id = encodeURIComponent(tag._id);
            const href =
              tag.isTracked && session?.user
                ? `/user/tracker/tags/${id}`
                : `/tags/${id}`;

            return (
              <Link
                key={tag._id}
                href={href}
                className="block focus:outline-none focus:ring-2 focus:ring-primary/30 rounded"
              >
                <TagCard tag={tag} />
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
