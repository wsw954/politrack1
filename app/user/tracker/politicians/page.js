// app/user/tracker/politicians/page.js
"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "@/lib/axiosInstance";
import SectionWrapper from "@/components/ui/SectionWrapper";
import Spinner from "@/components/ui/Spinner";
import TrackedPoliticianCard from "@/components/user/TrackedPoliticianCard";
import Link from "next/link";

export default function TrackedPoliticiansPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tracked, setTracked] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchTracked = async () => {
      try {
        const res = await axios.get(
          `/api/users/${session.user.id}/tracker/politicians`
        );
        setTracked(res.data || []);
      } catch (err) {
        console.error("Failed to fetch tracked politicians:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTracked();
  }, [session]);

  if (status === "loading" || loading) return <Spinner />;
  if (!session) return <p className="text-red-600">You must be logged in.</p>;

  return (
    <SectionWrapper>
      <h1 className="text-2xl font-bold mb-6">Tracked Politicians</h1>

      {tracked.length === 0 ? (
        <p className="text-gray-600">
          You aren't tracking any politicians yet.
        </p>
      ) : (
        <div className="space-y-6">
          {tracked.map(({ itemId, note }, index) => {
            const politician = itemId; // clarity alias
            const id = itemId?._id || `fallback-${index}`;

            const name =
              politician?.first_name && politician?.last_name
                ? `${politician.first_name} ${politician.last_name}`
                : "Unknown Politician";

            const photo = politician?.photo_url
              ? politician.photo_url.replace("/app/public", "")
              : "/politicians/images/default.jpg";

            return (
              <div key={id} className="space-y-2">
                <Link href={`/user/tracker/politicians/${id}`}>
                  <TrackedPoliticianCard
                    politician={{
                      name,
                      party: politician?.party,
                      district: politician?.district,
                      chamber: politician?.chamber,
                      photo,
                    }}
                    note={note}
                  />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </SectionWrapper>
  );
}
