// /app/user/tracker/tags/page.js
"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import axios from "@/lib/axiosInstance";
import { useRouter } from "next/navigation";
import Link from "next/link";

import Spinner from "@/components/ui/Spinner";
import Card from "@/components/ui/Card";
import SectionWrapper from "@/components/ui/SectionWrapper";

export default function TrackedTagsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrackedTags = async () => {
      if (!session?.user?.id) return;

      try {
        const res = await axios.get(
          `/api/users/${session.user.id}/tracker/tags`
        );
        console.log(res.data);
        setTags(res.data || []);
        console.log(tags);
      } catch (err) {
        console.error("Failed to fetch tracked tags:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrackedTags();
  }, [session]);

  if (status === "loading" || loading) return <Spinner />;
  if (!session) return <p className="text-red-600">You must be logged in.</p>;

  return (
    <SectionWrapper>
      <h1 className="text-2xl font-semibold mb-6">Tracked Tags</h1>

      {tags.length === 0 ? (
        <p className="text-gray-600">You haven't tracked any tags yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tags.map(({ itemId, note }) => (
            <Link key={itemId._id} href={`/user/tracker/tags/${itemId._id}`}>
              <Card>
                <h2 className="text-xl font-bold">{itemId.name}</h2>
                {itemId.keywords?.length > 0 && (
                  <p className="text-sm text-gray-600">
                    Keywords: {itemId.keywords.join(", ")}
                  </p>
                )}
                {note && (
                  <p className="mt-2 text-sm italic text-gray-700">
                    Note: {note}
                  </p>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </SectionWrapper>
  );
}
