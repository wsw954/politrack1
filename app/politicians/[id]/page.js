// /app/politicians/[id]/page.js

import PoliticianCard from "@/components/politicians/PoliticianCard";
import ContactInfo from "@/components/politicians/ContactInfo";
import CommitteeList from "@/components/politicians/CommitteeList";
import VotingHistory from "@/components/politicians/VotingHistory";
import ConsistencyMeter from "@/components/politicians/ConsistencyMeter";
import AddToTrackerButton from "@/components/user/AddToTrackerButton";
import UnloggedTrackerPrompt from "@/components/user/UnloggedTrackerPrompt";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { notFound } from "next/navigation";

export default async function PoliticianDetailPage({ params }) {
  const session = await getServerSession(authOptions);
  const awaitedParams = await params;
  const { id } = awaitedParams;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/politicians/${id}`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) return notFound();

  const politician = await res.json();

  return (
    <section className="py-8 space-y-6">
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

      {/* Track Button */}
      <div className="mt-4 flex justify-center">
        {session ? (
          <AddToTrackerButton
            itemId={politician._id}
            itemType="Politician"
            redirectTo="/user/tracker/politicians"
          />
        ) : (
          <UnloggedTrackerPrompt label="politician" />
        )}
      </div>

      {/* Sections */}
      <hr className="my-8 border-t border-neutral-light" />
      <ContactInfo contact={politician.contact} />
      <CommitteeList committees={politician.committee_assignments} />
      <VotingHistory votingHistory={politician.voting_history} />
      <ConsistencyMeter consistency={politician.consistency_meter} />

      {/* Footer */}
      <p className="text-sm text-neutral-muted text-center mt-8">
        Last updated: {politician.last_updated}
      </p>
    </section>
  );
}
