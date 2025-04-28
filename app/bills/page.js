// app/bills/page.js
"use client";

import { useEffect, useState } from "react";
import BillCard from "@/components/bills/BillCard";
import Button from "@/components/ui/Button";
import Link from "next/link";

export default function BillListPage() {
  const [bills, setBills] = useState([]);
  const [filters, setFilters] = useState({
    title: "",
    tag: "",
    status: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allBills, setAllBills] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const query = new URLSearchParams();

        if (filters.title) query.append("title", filters.title);
        if (filters.tag) query.append("tag", filters.tag);
        if (filters.status) query.append("status", filters.status);

        const url = `/api/bills${
          query.toString() ? `?${query.toString()}` : ""
        }`;
        const res = await fetch(url);

        if (!res.ok) throw new Error("Failed to fetch bills");

        const data = await res.json();
        console.log(data);
        setBills(data);
        setAllBills(data);
        setLoading(false);
      } catch (err) {
        setError(err.message || "Something went wrong");
        setLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  const handleResetFilters = () => {
    setFilters({
      title: "",
      tag: "",
      status: "",
    });
  };

  return (
    <div className="w-full max-w-none px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-6">
        Browse Florida Bills
      </h1>

      {/* Filter panel */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-12">
        {/* Temporary Filter Inputs */}
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search by Title"
            value={filters.title}
            onChange={(e) => setFilters({ ...filters, title: e.target.value })}
            className="border border-gray-300 rounded-md px-4 py-2 w-full"
          />
          <input
            type="text"
            placeholder="Filter by Tag"
            value={filters.tag}
            onChange={(e) => setFilters({ ...filters, tag: e.target.value })}
            className="border border-gray-300 rounded-md px-4 py-2 w-full"
          />
          <input
            type="text"
            placeholder="Filter by Status"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="border border-gray-300 rounded-md px-4 py-2 w-full"
          />
        </div>

        <div className="flex justify-between items-center mt-4">
          <button
            onClick={handleResetFilters}
            className="text-sm text-gray-700 hover:text-black border border-gray-300 rounded-md px-4 py-2"
          >
            Reset Filters
          </button>

          <Link href="/bills/new">
            <Button>Add New Bill</Button>
          </Link>
        </div>
      </div>

      <hr className="border-t border-gray-300 mb-12" />

      {loading && <p className="text-gray-600">Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          {bills.length > 0 ? (
            bills.map((bill) => (
              <Link key={bill._id} href={`/bills/${bill._id}`}>
                <BillCard
                  bill={{
                    id: bill._id,
                    title: bill.title,
                    summary: bill.summary,
                    tags: bill.tags,
                    current_stage: bill.status.current_stage,
                  }}
                />
              </Link>
            ))
          ) : (
            <p className="text-gray-500">No bills match your filters.</p>
          )}
        </div>
      )}
    </div>
  );
}
