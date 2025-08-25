//app/user/tracker/politicians/[id]/page.js
"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "@/lib/axiosInstance";

import Spinner from "@/components/ui/Spinner";
import ContactInfo from "@/components/politicians/ContactInfo";
import CommitteeList from "@/components/politicians/CommitteeList";
import VotingHistory from "@/components/politicians/VotingHistory";
import ConsistencyMeter from "@/components/politicians/ConsistencyMeter";
import TrackedPoliticianCard from "@/components/user/tracker/politicians/TrackedPoliticianCard";

export default function TrackedPoliticianPage() {
  const { data: session, status } = useSession();
  const { id } = useParams();
  const router = useRouter();
  const [payload, setPayload] = useState(null); // { politician, tracked? or note? }

  const [data, setData] = useState(null); // { politician, note }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session?.user?.id || !id) return;
    let ignore = false;

    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(
          `/api/users/${session.user.id}/tracker/politicians/${id}`
        );
        if (!ignore) setPayload(res.data);
      } catch (err) {
        console.error("Failed to fetch tracked politician:", err);
        if (!ignore) setError("Failed to load tracked politician.");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [session?.user?.id, id]);

  if (status === "loading" || loading) return <Spinner />;
  if (!session) return <p className="text-danger">You must be logged in.</p>;
  if (error) return <p className="text-danger">{error}</p>;
  if (!payload) return <p className="text-neutral-muted">Not found.</p>;

  const { politician } = payload;
  const name = `${politician.first_name} ${politician.last_name}`;

  const tracked = payload.tracked ?? {
    note: payload.note ?? "",
    // If your endpoint doesn’t return tracked timestamps yet, omit them
    // and the card will just show the note.
    createdAt: payload.createdAt, // optional, if provided
    updatedAt: payload.updatedAt, // optional, if provided
  };

  const handleEditNote = () => {
    router.push(`/user/tracker/politicians/${id}/edit`);
  };

  const handleUntrack = async () => {
    if (!confirm(`Untrack "${name}"?`)) return;
    try {
      await axios.delete(
        `/api/users/${session.user.id}/tracker/politicians/${id}`
      );
      router.push("/user/tracker/politicians");
    } catch (err) {
      console.error(err);
      alert("Failed to untrack politician.");
    }
  };

  return (
    <section className="py-8 space-y-6">
      <h1 className="text-3xl font-bold text-center">{name}</h1>

      <TrackedPoliticianCard
        politician={politician}
        tracked={tracked}
        onEditNote={handleEditNote}
        onUntrack={handleUntrack}
      />

      <hr className="my-4 border-t border-neutral-light" />

      <ContactInfo contact={politician.contact} />
      <CommitteeList committees={politician.committee_assignments} />
      <VotingHistory votingHistory={politician.voting_history} />
      <ConsistencyMeter consistency={politician.consistency_meter} />
    </section>
  );
}
