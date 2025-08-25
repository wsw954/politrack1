// app/user/tracker/politicians/page.js
"use client";

import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "@/lib/axiosInstance";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { normalizeId } from "@/utils/normalizeId";
import TrackedPoliticianCard from "@/components/user/tracker/politicians/TrackedPoliticianCard";
import TrackedPoliticiansFilterBar from "@/components/user/tracker/politicians/FilterBar";

export default function TrackedPoliticiansPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [allTrackedPoliticians, setAllTrackedPoliticians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Mirrors /app/politicians/page.js
  const [filters, setFilters] = useState({
    name: "",
    chamber: "",
    party: "",
    district: "",
    sort: "", // "name-asc" | "name-desc" | "party" | ""
    // hasNote: "any" // tracker-only (enable later if needed)
  });

  useEffect(() => {
    if (!session?.user?.id) return;

    (async () => {
      setLoading(true);
      setError("");
      try {
        // API returns only tracked politicians:
        // [{ itemId: <Politician>, note: string, ... }, ...]
        const res = await axios.get(
          `/api/users/${session.user.id}/tracker/politicians`
        );
        const items = Array.isArray(res.data) ? res.data : [];

        const merged = items
          .map((it) => {
            const p = it?.itemId;
            if (!p) return null;
            return {
              ...p,
              isTracked: true,
              _track: { note: it.note || "" }, // tracker metadata bucket
            };
          })
          .filter(Boolean);

        setAllTrackedPoliticians(merged);
      } catch (err) {
        console.error("Failed to fetch tracked politicians:", err);
        setError("Failed to load tracked politicians.");
      } finally {
        setLoading(false);
      }
    })();
  }, [session?.user?.id]);

  const filteredSorted = useMemo(() => {
    const next = (allTrackedPoliticians || []).filter((p) => {
      if (filters.name && p.name !== filters.name) return false;
      if (filters.chamber && p.chamber !== filters.chamber) return false;
      if (filters.party && p.party !== filters.party) return false;
      if (filters.district && p.district !== filters.district) return false;

      // Tracker-only example:
      // if (filters.hasNote === "yes" && !p._track?.note?.trim()) return false;
      // if (filters.hasNote === "no" && p._track?.note?.trim()) return false;

      return true;
    });

    next.sort((a, b) => {
      switch (filters.sort) {
        case "name-asc":
          return (a.last_name || "").localeCompare(b.last_name || "");
        case "name-desc":
          return (b.last_name || "").localeCompare(a.last_name || "");
        case "party":
          return (a.party || "").localeCompare(b.party || "");
        default:
          return 0;
      }
    });

    return next;
  }, [allTrackedPoliticians, filters]);

  const handleResetFilters = () =>
    setFilters({ name: "", chamber: "", party: "", district: "", sort: "" });

  const handleCardClick = (p) => {
    const id = normalizeId(p._id);
    router.push(`/user/tracker/politicians/${id}`);
  };

  if (status === "loading" || loading) return <Spinner />;
  if (!session) return <p className="text-danger">You must be logged in.</p>;
  if (error) return <p className="text-danger">{error}</p>;

  return (
    <section className="py-8 space-y-6">
      <h1 className="text-3xl font-bold text-center mb-6">
        Your Tracked Politicians
      </h1>

      {/* Filter panel (mirrors public list) */}
      <div className="bg-white border border-neutral-light rounded-xl shadow-sm p-6 mb-12">
        <TrackedPoliticiansFilterBar
          allPoliticians={allTrackedPoliticians}
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

          {/* Useful shortcuts identical to public list */}
          <div className="flex gap-2">
            <Link href="/politicians">
              <Button variant="secondary">Browse All Politicians</Button>
            </Link>
            <Link href="/politicians/advancedSearch">
              <Button>Advanced Search</Button>
            </Link>
          </div>
        </div>
      </div>

      <hr className="border-t border-neutral-light mb-12" />

      {/* Results (use your tracked card) */}
      {filteredSorted.length > 0 ? (
        <div className="space-y-6">
          {filteredSorted.map((p, idx) => (
            <div
              key={p?._id || `tracked-${idx}`}
              onClick={() => handleCardClick(p)}
              className="cursor-pointer"
            >
              <TrackedPoliticianCard
                politician={p} // pass the full doc
                tracked={{ note: p._track?.note }}
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-neutral-muted">
          No tracked politicians match your filters.
        </p>
      )}
    </section>
  );
}
