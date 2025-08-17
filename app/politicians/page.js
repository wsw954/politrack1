// app/politicians/page.js
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import PoliticianCard from "@/components/politicians/PoliticianCard";
import FilterBar from "@/components/politicians/FilterBar";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { fetchTrackedIds } from "@/utils/fetchTrackedIds";

export default function PoliticianListPage() {
  const [politicians, setPoliticians] = useState([]);
  const [filters, setFilters] = useState({
    name: "",
    chamber: "",
    party: "",
    sort: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allPoliticians, setAllPoliticians] = useState([]);

  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1. Build filter query
        const query = new URLSearchParams();
        if (filters.chamber) query.append("chamber", filters.chamber);
        if (filters.name) query.append("name", filters.name);
        if (filters.party) query.append("party", filters.party);
        if (filters.district) query.append("district", filters.district);

        const url = `/api/politicians${
          query.toString() ? `?${query.toString()}` : ""
        }`;
        //2. Get all Politicians
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch politicians");
        const politicianData = await res.json();

        // 3. Get tracked politicians
        const trackedIds = await fetchTrackedIds("politicians");

        // 4. Merge `isTracked` status
        const merged = politicianData.map((politician) => ({
          ...politician,
          isTracked: trackedIds.has(politician._id),
        }));
        //Apply client-side sorting based on filters.sort
        const sorted = [...merged].sort((a, b) => {
          switch (filters.sort) {
            case "name-asc":
              return a.last_name.localeCompare(b.last_name);
            case "name-desc":
              return b.last_name.localeCompare(a.last_name);
            case "party":
              return a.party.localeCompare(b.party);
            default:
              return 0; // no sorting
          }
        });

        setPoliticians(sorted); //Final sorted & merged list
        setAllPoliticians(merged);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  const handleResetFilters = () => {
    setFilters({
      chamber: "",
      name: "",
      party: "",
      district: "",
    });
  };

  const handleCardClick = (politician) => {
    const id = politician._id;
    if (politician.isTracked && session?.user) {
      router.push(`/user/tracker/politicians/${id}`);
    } else {
      router.push(`/politicians/${id}`);
    }
  };

  return (
    <section className="py-8 space-y-6">
      <h1 className="text-3xl font-bold text-center mb-6">
        Browse Florida Politicians
      </h1>

      {/* Filter panel */}
      <div className="bg-white border border-neutral-light rounded-xl shadow-sm p-6 mb-12">
        <FilterBar
          allPoliticians={allPoliticians}
          filters={filters}
          setFilters={setFilters}
        />

        <div className="flex justify-between items-center mt-4">
          <button
            onClick={handleResetFilters}
            className="text-sm text-neutral-dark hover:text-primary border border-neutral-light rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            Reset Filters
          </button>
          <Link href="/politicians/advancedSearch">
            <Button>Advanced Search</Button>
          </Link>
        </div>
      </div>

      <hr className="border-t border-neutral-light mb-12" />

      {loading && <p className="text-neutral-muted">Loading...</p>}
      {error && <p className="text-danger">{error}</p>}

      {!loading && !error && (
        <div className="mt-12 flex flex-col gap-4">
          {politicians.length > 0 ? (
            politicians.map((p) => (
              <div
                key={p._id}
                onClick={() => handleCardClick(p)}
                className="cursor-pointer"
              >
                <PoliticianCard
                  politician={{
                    name: `${p.first_name} ${p.last_name}`,
                    party: p.party,
                    district: p.district,
                    chamber: p.chamber,
                    photo: p.photo_url.replace("/app/public", ""),
                    isTracked: p.isTracked,
                  }}
                />
              </div>
            ))
          ) : (
            <p className="text-neutral-muted">
              No politicians match your filters.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
