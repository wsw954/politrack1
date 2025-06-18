//app/user/tracker/tags/[id]/page.js
"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "@/lib/axiosInstance";

import Spinner from "@/components/ui/Spinner";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import SectionWrapper from "@/components/ui/SectionWrapper";

export default function TrackedTagPage() {
  const { data: session, status } = useSession();
  const { id } = useParams(); // This is [tagId]
  const router = useRouter();

  const [trackedTag, setTrackedTag] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrackedTag = async () => {
      if (!session?.user?.id || !id) return;

      try {
        const res = await axios.get(
          `/api/users/${session.user.id}/tracker/tags/${id}`
        );
        setTrackedTag(res.data);
      } catch (err) {
        console.error("Failed to fetch tracked tag:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrackedTag();
  }, [session, id]);

  if (status === "loading" || loading) return <Spinner />;
  if (!session) return <p className="text-red-600">You must be logged in.</p>;
  if (!trackedTag)
    return <p className="text-gray-600">Tag not found or not tracked.</p>;

  const { tagId, note } = trackedTag;

  return (
    <SectionWrapper>
      <h1 className="text-2xl font-bold mb-6">Tracked Tag: {tagId.name}</h1>

      <Card>
        <p className="text-lg font-semibold mb-2">Tag Info</p>
        <ul className="mb-4 text-gray-700">
          <li>
            <strong>Name:</strong> {tagId.name}
          </li>
          {tagId.keywords?.length > 0 && (
            <li>
              <strong>Keywords:</strong> {tagId.keywords.join(", ")}
            </li>
          )}
          {tagId.color && (
            <li>
              <strong>Color Class:</strong>{" "}
              <code className="bg-gray-100 px-1 py-0.5 rounded text-sm">
                {tagId.color}
              </code>
            </li>
          )}
        </ul>

        <p className="text-lg font-semibold mb-2">Note</p>
        <p className="italic">{note || "No note added."}</p>

        <div className="mt-6 flex gap-4">
          <Button onClick={() => router.push(`/user/tracker/tags/${id}/edit`)}>
            Edit Note
          </Button>
          <Button
            variant="destructive"
            onClick={async () => {
              const confirmed = confirm(
                `Are you sure you want to untrack "${tagId.name}"?`
              );
              if (!confirmed) return;

              try {
                await axios.delete(
                  `/api/users/${session.user.id}/tracker/tags/${id}`
                );
                router.push("/user/tracker/tags");
              } catch (err) {
                alert("Failed to untrack tag.");
                console.error(err);
              }
            }}
          >
            Untrack Tag
          </Button>
        </div>
      </Card>
    </SectionWrapper>
  );
}
