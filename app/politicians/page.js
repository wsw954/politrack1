// app/politicians/page.js
"use client";

import { useEffect, useState } from "react";
import PoliticianCard from "@/components/politicians/PoliticianCard";
import FilterBar from "@/components/politicians/FilterBar";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { fetchTrackedIds } from "@/utils/fetchTrackedIds";

export default function PoliticianListPage() {
  const [politicians, setPoliticians] = useState([]);
  const [filters, setFilters] = useState({
    chamber: "",
    name: "",
    party: "",
    district: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allPoliticians, setAllPoliticians] = useState([]);

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
        const merged = politicianData.map((p) => ({
          ...p,
          isTracked: trackedIds.has(p._id),
        }));

        setPoliticians(merged);
        setAllPoliticians(merged);
        console.log(merged);
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

  return (
    <div className="w-full max-w-none px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-6">
        Browse Florida Politicians
      </h1>

      {/* Filter panel */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-12">
        <FilterBar
          allPoliticians={allPoliticians}
          filters={filters}
          setFilters={setFilters}
        />

        <div className="flex justify-between items-center mt-4">
          <button
            onClick={handleResetFilters}
            className="text-sm text-gray-700 hover:text-black border border-gray-300 rounded-md px-4 py-2"
          >
            Reset Filters
          </button>
          <Link href="/politicians/advancedSearch">
            <Button>Advanced Search</Button>
          </Link>
        </div>
      </div>

      <hr className="border-t border-gray-300 mb-12" />

      {loading && <p className="text-gray-600">Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="mt-12 flex flex-col gap-4">
          {politicians.length > 0 ? (
            politicians.map((p) => (
              <div key={p._id}>
                <Link href={`/politicians/${p._id}`}>
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
                </Link>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No politicians match your filters.</p>
          )}
        </div>
      )}
    </div>
  );
}
