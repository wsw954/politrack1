//app/bills/page.js
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import BillCard from "@/components/bills/BillCard";
import FilterBar from "@/components/bills/FilterBar";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { normalizeId } from "@/utils/normalizeId";
import { fetchTrackedIds } from "@/utils/fetchTrackedIds";

export default function BillListPage() {
  const [bills, setBills] = useState([]);
  const [filters, setFilters] = useState({
    title: "",
    tag: "",
    status: "",
    sort: "none",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allBills, setAllBills] = useState([]);

  const { data: session } = useSession();
  const router = useRouter();

  // Fetch full bill list once for filter dropdowns
  useEffect(() => {
    const fetchAllBills = async () => {
      try {
        const res = await fetch("/api/bills");
        const data = await res.json();
        const trackedIds = await fetchTrackedIds("bills");
        const merged = data.map((bill) => ({
          ...bill,
          isTracked: trackedIds.has(bill._id), //Mark the users tracked bills
        }));

        setAllBills(merged);
      } catch (err) {
        console.error("Failed to fetch all bills", err);
      }
    };

    fetchAllBills();
  }, []);

  // Main useEffect for handling filters
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Build bill filter query
        const query = new URLSearchParams();
        if (filters.title) query.append("title", filters.title);
        if (filters.tag) query.append("tag", filters.tag); // Tag now sends _id
        if (filters.status) query.append("status", filters.status);

        const queryString = query.toString();
        const billsUrl = `/api/bills${queryString ? `?${queryString}` : ""}`;

        //2. Get all bills
        const billsRes = await fetch(billsUrl);

        if (!billsRes.ok) throw new Error("Failed to fetch bills");
        const billsData = await billsRes.json();

        // 3. Get tracked bills
        const trackedIds = await fetchTrackedIds("bills");

        // 4. Merge tracked info into bills
        const mergedBills = billsData.map((bill) => ({
          ...bill,
          isTracked: trackedIds.has(bill._id),
        }));

        setBills(mergedBills); // store filtered result
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters]); // watch the entire filters object:

  const handleBillClick = (bill) => {
    const id = normalizeId(bill._id);
    if (bill.isTracked && session?.user) {
      router.push(`/user/tracker/bills/${id}`);
    } else {
      router.push(`/bills/${id}`);
    }
  };

  const handleResetFilters = () => {
    setFilters({
      title: "",
      tag: "",
      status: "",
      sort: "none",
    });
  };

  const sortedBills = [...bills].sort((a, b) => {
    switch (filters.sort) {
      case "title-asc":
        return a.title.localeCompare(b.title);
      case "title-desc":
        return b.title.localeCompare(a.title);
      case "date-asc":
        return new Date(a.createdAt) - new Date(b.createdAt);
      case "date-desc":
        return new Date(b.createdAt) - new Date(a.createdAt);
      case "none":
      default:
        return 0; // no sorting
    }
  });

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold text-center mb-6">
        Browse Florida Bills
      </h1>

      <div className="bg-white border border-neutral-light rounded-xl shadow-sm p-6 mb-12">
        <FilterBar
          allBills={allBills}
          filters={filters}
          setFilters={setFilters}
        />
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={handleResetFilters}
            className="text-sm text-neutral-dark hover:text-primary border border-neutral-light rounded-md px-4 py-2"
          >
            Reset Filters
          </button>
          <Link href="/bills/advancedSearch">
            <Button>Advanced Search</Button>
          </Link>
        </div>
      </div>

      <hr className="border-t border-neutral-light mb-12" />

      {loading && <p className="text-neutral-muted">Loading...</p>}
      {error && <p className="text-danger">{error}</p>}

      {!loading && !error && (
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedBills.length > 0 ? (
            sortedBills.map((bill) => (
              <div
                key={normalizeId(bill._id)}
                onClick={() => handleBillClick(bill)}
                className="cursor-pointer"
              >
                <BillCard
                  bill={{
                    id: normalizeId(bill._id),
                    number: bill.number,
                    title: bill.title,
                    summary: bill.summary,
                    tags: bill.tags.map((tag) => tag.name),
                    current_stage: bill.status?.current_stage,
                    isTracked: bill.isTracked,
                  }}
                />
              </div>
            ))
          ) : (
            <p className="text-neutral-muted">No bills match your filters.</p>
          )}
        </div>
      )}
    </div>
  );
}
