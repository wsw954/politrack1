// /app/bills/[id]/page.js
import StatusTimeline from "@/components/bills/StatusTimeline";
import TagList from "@/components/bills/TagList";
import SponsorCard from "@/components/bills/SponsorCard";
import { notFound } from "next/navigation";

export default async function BillDetailPage({ params }) {
  const awaitedParams = await params;
  const { id } = awaitedParams;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/bills/${id}`
  );
  if (!res.ok) return notFound();

  const bill = await res.json();

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">{bill.title}</h1>

      <p className="text-gray-600 text-sm mb-1">
        Last Updated: {bill.last_updated}
      </p>

      <a
        href={bill.source_url}
        className="text-blue-600 underline text-sm"
        target="_blank"
        rel="noopener noreferrer"
      >
        View Official Source
      </a>

      <section className="mt-6">
        <h2 className="text-xl font-semibold">Summary</h2>
        <p className="mt-2">{bill.summary}</p>
      </section>

      <section className="mt-6">
        <h2 className="text-xl font-semibold">Key Provisions</h2>
        <ul className="list-disc list-inside mt-2 space-y-1">
          {bill.key_provisions.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="mt-6">
        <h2 className="text-xl font-semibold">Why It Matters</h2>
        <p className="mt-2">{bill.why_it_matters}</p>
      </section>

      <section className="mt-6">
        <h2 className="text-xl font-semibold">Tags</h2>
        <TagList tags={bill.tags} />
      </section>

      <section className="mt-6">
        <h2 className="text-xl font-semibold">Status Timeline</h2>
        <StatusTimeline
          timeline={bill.status.timeline}
          current={bill.status.current_stage}
        />
      </section>

      <section className="mt-6">
        <h2 className="text-xl font-semibold">Sponsor</h2>
        <SponsorCard sponsorId={bill.sponsor} />
      </section>
    </main>
  );
}
