// /app/tags/page.js
"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Link from "next/link";

export default function TagListPage() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await fetch("/api/tags");
        if (!res.ok) throw new Error("Failed to fetch tags");
        const data = await res.json();
        setTags(data);
        setLoading(false);
      } catch (err) {
        setError(err.message || "Something went wrong");
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

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

      <hr className="border-t border-gray-300 mb-12" />

      {loading && <p className="text-gray-600">Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {tags.map((tag) => (
            <Link key={tag._id} href={`/tags/${encodeURIComponent(tag.name)}`}>
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <div className="flex flex-col gap-2">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {tag.name}
                  </h2>
                  {tag.keywords?.length > 0 && (
                    <ul className="text-sm text-gray-600 list-disc list-inside">
                      {tag.keywords.map((kw, i) => (
                        <li key={i}>{kw}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
