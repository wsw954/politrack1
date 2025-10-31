// app/bills/[id]/provisions/page.js
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import ProvisionCard from "@/components/provisions/ProvisionCard";

function parseMeta(meta, fallbackLimit = 50) {
  return {
    page: meta?.page ?? 1,
    pages: meta?.pages ?? 1,
    total: meta?.total ?? 0,
    limit: meta?.limit ?? fallbackLimit,
  };
}

export default function ProvisionsListPage() {
  const { id } = useParams();
  const router = useRouter();

  // paging & sorting (API supports "page", "limit", "sort")
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [sort, setSort] = useState("section_number"); // default aligns with API
  // data/ui
  const [provisions, setProvisions] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0, limit: 50 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const canPrev = useMemo(() => meta.page > 1, [meta.page]);
  const canNext = useMemo(
    () => meta.page < meta.pages,
    [meta.page, meta.pages]
  );

  useEffect(() => {
    if (!id) return;
    const fetchProvisions = async () => {
      setLoading(true);
      setError(null);
      try {
        const qs = new URLSearchParams({
          page: String(page),
          limit: String(limit),
          sort,
        });

        const res = await fetch(`/api/bills/${id}/provisions?` + qs.toString());
        if (!res.ok) throw new Error("Failed to fetch provisions");

        const payload = await res.json(); // { meta, data }
        const list = Array.isArray(payload?.data) ? payload.data : [];

        setProvisions(list);
        setMeta(parseMeta(payload?.meta, limit));
      } catch (err) {
        console.error(err);
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchProvisions();
  }, [id, page, limit, sort]);

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold text-center mb-6">
        Provisions for Bill
      </h1>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center justify-between bg-white border border-neutral-light rounded-xl shadow-sm p-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-muted">
            {meta.total} total • Page {meta.page} of {meta.pages}
          </span>

          <button
            disabled={!canPrev}
            onClick={() => canPrev && setPage((p) => p - 1)}
            className={`text-sm border rounded-md px-3 py-2 ${
              canPrev ? "hover:bg-neutral-50" : "opacity-50 cursor-not-allowed"
            }`}
            aria-label="Previous page"
          >
            Prev
          </button>

          <button
            disabled={!canNext}
            onClick={() => canNext && setPage((p) => p + 1)}
            className={`text-sm border rounded-md px-3 py-2 ${
              canNext ? "hover:bg-neutral-50" : "opacity-50 cursor-not-allowed"
            }`}
            aria-label="Next page"
          >
            Next
          </button>

          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value) || 50);
              setPage(1);
            }}
            className="text-sm border rounded-md px-2 py-2"
            aria-label="Page size"
          >
            {[20, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n} / page
              </option>
            ))}
          </select>

          {/* Optional: sort control */}
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            className="text-sm border rounded-md px-2 py-2"
            aria-label="Sort"
            title="Sort"
          >
            <option value="section_number">Section (Asc)</option>
            <option value="-section_number">Section (Desc)</option>
            <option value="type">Type (Asc)</option>
            <option value="-type">Type (Desc)</option>
          </select>
        </div>

        <Link
          href={`/bills/${id}`}
          className="text-sm text-primary hover:underline"
        >
          ← Back to Bill
        </Link>
      </div>

      {loading && <p className="mt-6 text-neutral-muted">Loading...</p>}
      {error && <p className="mt-6 text-danger">{error}</p>}

      {!loading && !error && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {provisions.length > 0 ? (
            provisions.map((prov) => (
              <Link
                key={prov._id}
                className="cursor-pointer"
                href={`/bills/${id}/provisions/${prov._id}`}
              >
                <ProvisionCard provision={prov} />
              </Link>
            ))
          ) : (
            <p className="text-neutral-muted">
              No provisions found for this bill.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
