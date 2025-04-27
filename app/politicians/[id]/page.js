// /app/politicians/[id]/page.js
import PoliticianCard from "@/components/politicians/PoliticianCard";
import ContactInfo from "@/components/politicians/ContactInfo";
import CommitteeList from "@/components/politicians/CommitteeList";
import VotingHistory from "@/components/politicians/VotingHistory";
import ConsistencyMeter from "@/components/politicians/ConsistencyMeter";
import { notFound } from "next/navigation";

export default async function PoliticianDetailPage({ params }) {
  const awaitedParams = await params;
  const { id } = awaitedParams;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/politicians/${id}`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) {
    notFound();
  }

  const politician = await res.json();

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8">
      {/* Name */}
      <h1 className="text-3xl font-bold mb-8 text-center">
        {politician.first_name} {politician.last_name}
      </h1>

      {/* Politician Card */}
      <PoliticianCard
        politician={{
          name: `${politician.first_name} ${politician.last_name}`,
          party: politician.party,
          district: politician.district,
          chamber: politician.chamber,
          photo: politician.photo_url.replace("/app/public", ""),
        }}
      />

      {/* Sections */}
      <hr className="my-8" />
      <ContactInfo contact={politician.contact} />
      <CommitteeList committees={politician.committee_assignments} />
      <VotingHistory votingHistory={politician.voting_history} />
      <ConsistencyMeter consistency={politician.consistency_meter} />

      {/* Footer */}
      <p className="text-sm text-gray-500 text-center mt-8">
        Last updated: {politician.last_updated}
      </p>
    </div>
  );
}
