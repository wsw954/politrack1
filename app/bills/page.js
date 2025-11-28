//app/bills/page.js
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import BillCard from "@/components/bills/BillCard";
import FilterBar from "@/components/bills/FilterBar";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { normalizeId } from "@/utils/normalizeId";
import { fetchTrackedIds } from "@/utils/fetchTrackedIds";

// Map UI sort keys -> API sort string (comma-separated keys; prepend "-" for desc)
const SORT_MAP = {
  none: "-updatedAt",
  "title-asc": "title",
  "title-desc": "-title",
  "date-asc": "createdAt",
  "date-desc": "-createdAt",
};

export default function BillListPage() {
  const [bills, setBills] = useState([]); // current page data
  const [meta, setMeta] = useState({
    page: 1,
    pages: 1,
    limit: 20,
    total: 0,
    sort: {},
  });
  const [filters, setFilters] = useState({
    title: "",
    tag: "",
    status: "",
    sort: "none",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // For FilterBar dropdowns (if it needs a broad list)
  const [allBills, setAllBills] = useState([]);

  const { data: session } = useSession();
  const router = useRouter();

  // Build API params for the main list fetch
  const apiParams = useMemo(() => {
    const params = new URLSearchParams();
    // NOTE: current /api/bills implementation ignores these filters for now,
    // but we keep them wired so when you add filter logic, the UI "just works".
    if (filters.title) params.set("title", filters.title);
    if (filters.tag) params.set("tag", filters.tag);
    if (filters.status) params.set("status", filters.status);

    const sortStr = SORT_MAP[filters.sort] || SORT_MAP["none"];
    params.set("sort", sortStr);

    params.set("page", meta.page || 1);
    params.set("limit", meta.limit || 20);
    return params.toString();
  }, [filters, meta.page, meta.limit]);

  // 1) One-time fetch for FilterBar options (if needed)
  useEffect(() => {
    let ignore = false;

    async function fetchAllForFilters() {
      try {
        // Pull a larger slice solely for FilterBar (titles/tags etc.)
        const res = await fetch(`/api/bills?limit=1000&sort=title`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to fetch all bills");
        const payload = await res.json();
        // Payload may be envelope {meta,data} or legacy array.
        const list = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
          ? payload.data
          : [];
        if (!ignore) setAllBills(list);
      } catch (e) {
        console.warn("FilterBar bootstrap failed:", e);
        if (!ignore) setAllBills([]);
      }
    }

    fetchAllForFilters();
    return () => {
      ignore = true;
    };
  }, []);

  // 2) Main fetch: bills list (paged) + merge tracked flags
  useEffect(() => {
    let ignore = false;

    async function fetchPage() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/bills?${apiParams}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to fetch bills");

        const payload = await res.json();
        const list = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
          ? payload.data
          : [];
        const metaObj = payload?.meta ?? {
          page: 1,
          pages: 1,
          limit: 20,
          total: list.length,
        };

        // Get tracked IDs and merge
        const trackedIds = await fetchTrackedIds("bills");
        const merged = list.map((bill) => ({
          ...bill,
          isTracked: trackedIds.has(bill._id),
        }));

        if (!ignore) {
          setBills(merged);
          setMeta((m) => ({
            ...m,
            page: metaObj.page,
            pages: metaObj.pages,
            limit: metaObj.limit,
            total: metaObj.total,
          }));
        }
      } catch (e) {
        if (!ignore) {
          setError(e.message || "Something went wrong");
          setBills([]);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    fetchPage();
    return () => {
      ignore = true;
    };
  }, [apiParams]);

  // Handlers
  const handleBillClick = (bill) => {
    const id = normalizeId(bill._id);
    if (bill.isTracked && session?.user) {
      router.push(`/user/tracker/bills/${id}`);
    } else {
      router.push(`/bills/${id}`);
    }
  };

  const handleResetFilters = () => {
    setFilters({ title: "", tag: "", status: "", sort: "none" });
    setMeta((m) => ({ ...m, page: 1 })); // reset to first page
  };

  const handlePageChange = (nextPage) => {
    // clamp between 1 and meta.pages
    const p = Math.max(1, Math.min(nextPage, meta.pages || 1));
    setMeta((m) => ({ ...m, page: p }));
    // keep filters as-is
  };

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold text-center mb-6">
        Browse Florida Bills
      </h1>

      <div className="bg-white border border-neutral-light rounded-xl shadow-sm p-6 mb-12">
        <FilterBar
          allBills={allBills}
          filters={filters}
          setFilters={(f) => {
            setMeta((m) => ({ ...m, page: 1 })); // whenever filters change, go back to page 1
            setFilters(f);
          }}
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
        <>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            {bills.length > 0 ? (
              bills.map((bill) => (
                <div
                  key={normalizeId(bill._id)}
                  onClick={() => handleBillClick(bill)}
                  className="cursor-pointer"
                >
                  <BillCard
                    bill={{
                      id: normalizeId(bill._id),
                      number: bill.number || bill.billNumber, // support either field
                      title: bill.title,
                      summary: bill.summary,
                      tags: Array.isArray(bill.tags)
                        ? bill.tags.map((t) => t.name ?? t)
                        : [],
                      current_stage: bill.status?.current_stage,
                      isTracked: bill.isTracked,
                      provisionCount: bill.provisionCount ?? 0,
                    }}
                  />
                </div>
              ))
            ) : (
              <p className="text-neutral-muted">No bills match your filters.</p>
            )}
          </div>

          {/* Basic pagination */}
          <div className="flex items-center justify-center gap-4 mt-10">
            <button
              onClick={() => handlePageChange((meta.page || 1) - 1)}
              disabled={(meta.page || 1) <= 1}
              className="px-3 py-2 border rounded disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-sm">
              Page {meta.page || 1} of {meta.pages || 1} • {meta.total || 0}{" "}
              total
            </span>
            <button
              onClick={() => handlePageChange((meta.page || 1) + 1)}
              disabled={(meta.page || 1) >= (meta.pages || 1)}
              className="px-3 py-2 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
