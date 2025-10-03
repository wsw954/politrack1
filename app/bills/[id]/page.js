// /app/bills/[id]/page.js
import StatusTimeline from "@/components/bills/StatusTimeline";
import TagList from "@/components/bills/TagList";
import SponsorCard from "@/components/bills/SponsorCard";
import { notFound } from "next/navigation";
import { normalizeId } from "@/utils/normalizeId";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import Link from "next/link";
import AddToTrackerButton from "@/components/user/AddToTrackerButton";
import ViewProvisionsButton from "@/components/provisions/ViewProvisionsButton";
import UnloggedTrackerPrompt from "@/components/user/UnloggedTrackerPrompt";

export default async function BillDetailPage({ params }) {
  const session = await getServerSession(authOptions);
  const awaitedParams = await params;
  const { id } = awaitedParams;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/bills/${normalizeId(id)}`
  );

  if (!res.ok) return notFound();

  const bill = await res.json();
  return (
    <section className="py-6 space-y-6">
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

      {/* === TRACK BUTTON === */}
      <div className="mt-4">
        {session ? (
          <AddToTrackerButton
            itemId={bill._id}
            itemType="Bill"
            redirectTo="/user/tracker/bills"
          />
        ) : (
          <UnloggedTrackerPrompt label="Bill" />
        )}
      </div>
      <div className="mt-4">
        <ViewProvisionsButton
          billId={bill._id}
          provisionCount={bill.provisionCount}
        />
      </div>

      <section className="mt-6">
        <h2 className="text-xl font-semibold">Summary</h2>
        <p className="mt-2">{bill.summary || "No summary available."}</p>
      </section>

      <section className="mt-6">
        <h2 className="text-xl font-semibold">Why It Matters</h2>
        <p className="mt-2">{bill.why_it_matters || "No information."}</p>
      </section>

      <section className="mt-6">
        <h2 className="text-xl font-semibold">Tags</h2>
        <TagList tags={bill.tags.map((tag) => tag.name)} />
      </section>

      <section className="mt-6">
        <h2 className="text-xl font-semibold">Status Timeline</h2>
        <StatusTimeline
          timeline={bill.status?.timeline || []}
          current={bill.status?.current_stage}
        />
      </section>

      <section className="mt-6">
        <h2 className="text-xl font-semibold">Sponsor</h2>
        <SponsorCard sponsor={bill.sponsor} />
      </section>
    </section>
  );
}
