//app/user/tracker/bills/[id]/page.js
"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "@/lib/axiosInstance";
import Spinner from "@/components/ui/Spinner";
import SectionWrapper from "@/components/ui/SectionWrapper";
import TagList from "@/components/bills/TagList";
import SponsorCard from "@/components/bills/SponsorCard";
import StatusTimeline from "@/components/bills/StatusTimeline";
import Button from "@/components/ui/Button";

export default function TrackedBillPage() {
  const { data: session, status } = useSession();
  const { id } = useParams();

  const router = useRouter();

  const [tracked, setTracked] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id || !id) return;

    const fetchTracked = async () => {
      try {
        const res = await axios.get(
          `/api/users/${session.user.id}/tracker/bills/${id}`
        );
        setTracked(res.data);
        console.log(res.data);
      } catch (err) {
        console.error("Error fetching tracked bill:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTracked();
  }, [session, id]);

  if (status === "loading" || loading) return <Spinner />;
  if (!tracked)
    return <p className="text-red-600">Bill not found or not tracked.</p>;

  const { bill, note } = tracked;
  console.log("line 49 in app/user/tracker/bills/[id]/page.js ");

  return (
    <SectionWrapper>
      <h1 className="text-3xl font-bold mb-2">{bill.title}</h1>

      <p className="text-neutral-muted text-sm mb-1">
        Last Updated: {bill.updatedAt || "Unknown"}
      </p>

      <a
        href={bill.source_url}
        className="text-primary underline text-sm"
        target="_blank"
        rel="noopener noreferrer"
      >
        View Official Source
      </a>

      {/* Summary */}
      <section className="mt-6">
        <h2 className="text-xl font-semibold">Summary</h2>
        <p className="mt-2">{bill.summary || "No summary available."}</p>
      </section>

      {/* Provisions */}
      <section className="mt-6">
        <h2 className="text-xl font-semibold">Key Provisions</h2>
        <ul className="list-disc list-inside mt-2 space-y-1">
          {bill.provisions?.map((prov, index) => (
            <li key={index}>
              <strong>{prov.heading}</strong>: {prov.summary || "No summary."}
            </li>
          ))}
        </ul>
      </section>

      {/* Why It Matters */}
      <section className="mt-6">
        <h2 className="text-xl font-semibold">Why It Matters</h2>
        <p className="mt-2">{bill.why_it_matters || "No information."}</p>
      </section>

      {/* Tags */}
      <section className="mt-6">
        <h2 className="text-xl font-semibold">Tags</h2>
        <TagList tags={bill.tags?.map((tag) => tag.name)} />
      </section>

      {/* Status Timeline */}
      <section className="mt-6">
        <h2 className="text-xl font-semibold">Status Timeline</h2>
        <StatusTimeline
          timeline={bill.status?.timeline || []}
          current={bill.status?.current_stage}
        />
      </section>

      {/* Sponsor */}
      <section className="mt-6">
        <h2 className="text-xl font-semibold">Sponsor</h2>
        <SponsorCard sponsor={bill.sponsor} />
      </section>

      {/* Tracker Note */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold">Your Tracker Note</h2>
        <p className="italic text-gray-700 border-l-4 border-blue-400 pl-4 mt-2">
          {note || "No note added."}
        </p>

        <div className="flex gap-4 mt-4">
          <Button onClick={() => router.push(`/user/tracker/bills/${id}/edit`)}>
            Edit Note
          </Button>
          <Button
            variant="destructive"
            onClick={async () => {
              const confirmed = confirm(
                "Are you sure you want to untrack this bill?"
              );
              if (!confirmed) return;

              try {
                await axios.delete(
                  `/api/users/${session.user.id}/tracker/bills/${id}`
                );
                router.push("/user/tracker/bills");
              } catch (err) {
                console.error("Untrack failed:", err);
                alert("Failed to untrack bill.");
              }
            }}
          >
            Untrack Bill
          </Button>
        </div>
      </section>
    </SectionWrapper>
  );
}
