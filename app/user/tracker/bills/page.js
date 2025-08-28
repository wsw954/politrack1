// app/user/tracker/bills/page.js
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import axios from "@/lib/axiosInstance";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import BillCard from "@/components/bills/BillCard";
import { normalizeId } from "@/utils/normalizeId";
import TrackerBillsFilterBar from "@/components/user/tracker/bills/FilterBar";

export default function TrackedBillsIndexPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [allTrackedBills, setAllTrackedBills] = useState(null); // single source of truth
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Mirrors /app/bills/page.js, plus tracker-only "hasNote"
  const [filters, setFilters] = useState({
    title: "",
    tag: "",
    status: "",
    hasNote: "any", // "any" | "yes" | "no"
    sort: "none",
  });

  useEffect(() => {
    if (!session?.user?.id) return;
    const controller = new AbortController();

    (async () => {
      setLoading(true);
      setError(null);
      try {
        // Only tracked bills; API now returns itemId.tags as [{ _id, name }]
        const res = await axios.get(
          `/api/users/${session.user.id}/tracker/bills`,
          { signal: controller.signal }
        );

        const items = Array.isArray(res.data) ? res.data : [];

        // Flatten into bill objects and attach tracker metadata (note)
        const merged = items
          .map((it) => {
            const bill = it?.itemId;
            if (!bill) return null;
            return {
              ...bill,
              note: it.note || "",
              // no need to compute isTracked — this page is ONLY tracked
            };
          })
          .filter(Boolean);

        setAllTrackedBills(merged);
      } catch (err) {
        if (err?.code !== "ERR_CANCELED" && err?.name !== "CanceledError") {
          console.error("Error fetching tracked bills:", err);
          setError("Failed to load tracked bills.");
          setAllTrackedBills([]);
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [session?.user?.id]);

  // Compute filtered+sorted list without extra state/effect
  const filteredSorted = useMemo(() => {
    const next = (allTrackedBills || []).filter((b) => {
      if (filters.title && b.title !== filters.title) return false;

      if (filters.tag) {
        const hasTag =
          Array.isArray(b.tags) &&
          b.tags.some(
            (t) => t && (t._id?.toString?.() || t._id) === filters.tag
          );
        if (!hasTag) return false;
      }

      if (filters.status && b.status?.current_stage !== filters.status)
        return false;

      if (filters.hasNote === "yes" && !b.note?.trim()) return false;
      if (filters.hasNote === "no" && b.note?.trim()) return false;

      return true;
    });

    next.sort((a, b) => {
      switch (filters.sort) {
        case "title-asc":
          return (a.title || "").localeCompare(b.title || "");
        case "title-desc":
          return (b.title || "").localeCompare(a.title || "");
        case "date-asc":
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        case "date-desc":
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case "none":
        default:
          return 0;
      }
    });

    return next;
  }, [filters, allTrackedBills]);

  const handleResetFilters = () =>
    setFilters({
      title: "",
      tag: "",
      status: "",
      hasNote: "any",
      sort: "none",
    });

  const handleBillClick = (bill) => {
    const id = normalizeId(bill._id);
    router.push(`/user/tracker/bills/${id}`);
  };

  if (status === "loading" || loading || allTrackedBills === null)
    return <Spinner />;
  if (!session) return <p className="text-danger">You must be logged in.</p>;
  if (error) return <p className="text-danger">{error}</p>;

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold text-center mb-6">
        Your Tracked Bills
      </h1>

      <div className="bg-white border border-neutral-light rounded-xl shadow-sm p-6 mb-12">
        <TrackerBillsFilterBar
          allBills={allTrackedBills}
          filters={filters}
          setFilters={setFilters}
        />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-4">
          <button
            onClick={handleResetFilters}
            className="text-sm text-neutral-dark hover:text-primary border border-neutral-light rounded-md px-4 py-2"
          >
            Reset Filters
          </button>

          <div className="flex gap-2">
            <Link href="/bills">
              <Button variant="secondary">Browse All Bills</Button>
            </Link>
            <Link href="/bills/advancedSearch">
              <Button>Advanced Search</Button>
            </Link>
          </div>
        </div>
      </div>

      <hr className="border-t border-neutral-light mb-12" />

      {filteredSorted.length > 0 ? (
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredSorted.map((bill) => {
            const id = normalizeId(bill._id);
            return (
              <div
                key={id}
                onClick={() => handleBillClick(bill)}
                className="cursor-pointer"
              >
                <BillCard
                  bill={{
                    id,
                    number: bill.number,
                    title: bill.title,
                    summary: bill.summary,
                    tags: bill.tags?.map((t) => t.name),
                    current_stage: bill.status?.current_stage,
                    isTracked: true, // purely for consistent Card UI
                  }}
                />
                {bill.note?.trim() && (
                  <p className="mt-2 italic text-sm text-neutral-dark border-l-4 border-blue-400 pl-4">
                    {bill.note}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-neutral-muted">
          No tracked bills match your filters.
        </p>
      )}
    </div>
  );
}
