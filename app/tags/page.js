// app/tags/page.js
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Link from "next/link";
import { fetchTrackedIds } from "@/utils/fetchTrackedIds";

export default function TagListPage() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { data: session, status } = useSession();
  const router = useRouter();

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

  const handleTagClick = (tag) => {
    const id = encodeURIComponent(tag._id);
    if (tag.isTracked && session?.user) {
      router.push(`/user/tracker/tags/${id}`);
    } else {
      router.push(`/tags/${id}`);
    }
  };

  return (
    <div className="w-full max-w-none px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-6">
        Browse Tags (Issues)
      </h1>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-12">
        <p className="text-gray-700 text-sm">
          Tags represent major issue areas like Education, Housing, or the
          Environment. Use them to explore related bills and see how politicians
          vote on the issues you care about.
        </p>
      </div>

      <hr className="border-t border-neutral-light mb-12" />

      {loading && <p className="text-neutral-muted">Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {tags.map((tag) => (
            <div
              key={tag._id}
              onClick={() => handleTagClick(tag)}
              className="cursor-pointer"
            >
              <Card className="hover:shadow-md transition-shadow">
                <div className="flex flex-col gap-2">
                  <h2 className="text-xl font-semibold text-neutral-dark">
                    {tag.name}
                  </h2>
                  {tag.isTracked && (
                    <span className="w-fit max-w-max bg-accent-light text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                      Tracked
                    </span>
                  )}
                  {tag.keywords?.length > 0 && (
                    <ul className="text-sm text-neutral-muted list-disc list-inside">
                      {tag.keywords.map((kw, i) => (
                        <li key={i}>{kw}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
