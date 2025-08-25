// /app/politicians/[id]/page.js

import PoliticianCard from "@/components/politicians/PoliticianCard";
import ContactInfo from "@/components/politicians/ContactInfo";
import CommitteeList from "@/components/politicians/CommitteeList";
import VotingHistory from "@/components/politicians/VotingHistory";
import ConsistencyMeter from "@/components/politicians/ConsistencyMeter";
import AddToTrackerButton from "@/components/user/AddToTrackerButton";
import UnloggedTrackerPrompt from "@/components/user/UnloggedTrackerPrompt";
import { normalizeId } from "@/utils/normalizeId";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export default async function PoliticianDetailPage({ params }) {
  const session = await getServerSession(authOptions);
  // const awaitedParams = await params;
  // const { id } = params;
  const { id } = await params;

  // Build a safe base URL for SSR (no NEXT_PUBLIC_BASE_URL dependency)
  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = process.env.VERCEL ? "https" : "http";
  const url = `${protocol}://${host}/api/politicians/${normalizeId(id)}`;

  // const res = await fetch(
  //   `${process.env.NEXT_PUBLIC_BASE_URL}/api/politicians/${normalizeId(id)}`
  // );

  // if (!res.ok) return notFound();

  // one-shot fetch with a tiny retry for transient 5xx
  const fetchOnce = () => fetch(url, { cache: "no-store" });
  let res = await fetchOnce();
  if (!res.ok && res.status >= 500) {
    await new Promise((r) => setTimeout(r, 120));
    res = await fetchOnce();
  }

  if (res.status === 404) return notFound();
  if (!res.ok) throw new Error(`Failed to load politician: ${res.status}`);

  const politician = await res.json();

  const safePhoto =
    (politician.photo_url || "").replace?.("/app/public", "") ||
    "/politicians/images/default.jpg";

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
          photo: safePhoto,
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
