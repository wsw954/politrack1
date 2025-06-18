//app/user/tracker/politicians/[id]/page.js
"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "@/lib/axiosInstance";

import Spinner from "@/components/ui/Spinner";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import SectionWrapper from "@/components/ui/SectionWrapper";

import PoliticianCard from "@/components/politicians/PoliticianCard";
import ContactInfo from "@/components/politicians/ContactInfo";
import CommitteeList from "@/components/politicians/CommitteeList";
import VotingHistory from "@/components/politicians/VotingHistory";
import ConsistencyMeter from "@/components/politicians/ConsistencyMeter";

export default function TrackedPoliticianPage() {
  const { data: session, status } = useSession();
  const { id } = useParams(); // [politicianId]
  const router = useRouter();

  const [tracked, setTracked] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id || !id) return;

    const fetchTracked = async () => {
      try {
        const res = await axios.get(
          `/api/users/${session.user.id}/tracker/politicians/${id}`
        );
        setTracked(res.data);
      } catch (err) {
        console.error("Failed to fetch tracked politician:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTracked();
  }, [session, id]);

  if (status === "loading" || loading) return <Spinner />;
  if (!session) return <p className="text-red-600">You must be logged in.</p>;
  if (!tracked)
    return (
      <p className="text-gray-600">Politician not found or not tracked.</p>
    );

  const { politician, note } = tracked;
  const name = `${politician.first_name} ${politician.last_name}`;
  const photo =
    politician.photo_url?.replace("/app/public", "") ||
    "/politicians/images/default.jpg";

  return (
    <SectionWrapper>
      {/* Name */}
      <h1 className="text-3xl font-bold mb-8 text-center">
        Tracked Politician: {name}
      </h1>

      {/* Profile Overview */}
      <PoliticianCard
        politician={{
          name,
          party: politician.party,
          district: politician.district,
          chamber: politician.chamber,
          photo,
          contact: politician.contact,
          committee_assignments: politician.committee_assignments,
          voting_history: politician.voting_history,
          consistency_meter: politician.consistency_meter,
        }}
      />

      {/* Profile Details */}
      <hr className="my-10" />
      <ContactInfo contact={politician.contact} />
      <CommitteeList committees={politician.committee_assignments} />
      <VotingHistory votingHistory={politician.voting_history} />
      <ConsistencyMeter consistency={politician.consistency_meter} />

      {/* Tracker Note Section (moved to bottom) */}
      <Card className="mt-12">
        <p className="text-lg font-semibold mb-2">Tracker Note</p>
        <p className="italic text-gray-700">{note || "No note added."}</p>

        <div className="mt-6 flex gap-4">
          <Button
            onClick={() => router.push(`/user/tracker/politicians/${id}/edit`)}
          >
            Edit Note
          </Button>
          <Button
            variant="destructive"
            onClick={async () => {
              const confirmed = confirm(
                `Are you sure you want to untrack "${name}"?`
              );
              if (!confirmed) return;

              try {
                await axios.delete(
                  `/api/users/${session.user.id}/tracker/politicians/${id}`
                );
                router.push("/user/tracker/politicians");
              } catch (err) {
                alert("Failed to untrack politician.");
                console.error(err);
              }
            }}
          >
            Untrack Politician
          </Button>
        </div>
      </Card>

      <p className="text-sm text-gray-500 text-center mt-8">
        Last updated: {new Date(politician.updatedAt).toLocaleDateString()}
      </p>
    </SectionWrapper>
  );
}
