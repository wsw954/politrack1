// app/user/tracker/bills/[id]/provisions/page.js
"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useUserId } from "@/lib/useUserId";
import ProvisionCard from "@/components/provisions/ProvisionCard";
import InlineCountBadges from "@/components/annotation/InlineCountBadges";
import { getTrackedProvisionsForBill } from "@/lib/trackerClient";

export default function TrackedProvisionsListPage() {
  const { id: billId } = useParams();
  const { userId, status } = useUserId();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [sort, setSort] = useState("section_number");

  const [provisions, setProvisions] = useState([]);
  const [annotationsByProvision, setAnnotationsByProvision] = useState({});
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0, limit: 50 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!billId || status === "loading") return;
    if (!userId) {
      setError("Please sign in to view tracked provisions.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const { list, meta, annotationsByProvisionId } =
          await getTrackedProvisionsForBill({
            userId,
            billId,
            page,
            limit,
            sort,
          });

        if (cancelled) return;

        setProvisions(Array.isArray(list) ? list : []);
        setMeta(meta || { page: 1, pages: 1, total: 0, limit });
        setAnnotationsByProvision(annotationsByProvisionId || {});
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load provisions.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, status, billId, page, limit, sort]);

  const canPrev = useMemo(() => meta.page > 1, [meta.page]);
  const canNext = useMemo(
    () => meta.page < meta.pages,
    [meta.page, meta.pages]
  );

  return (
    <section className="py-8 space-y-6">
      {/* Match Tracked Bills visual rhythm */}
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-neutral-dark">
          Tracked Provisions
        </h1>
        <p className="text-base text-neutral-muted">
          Sections from this bill, plus your notes.
        </p>
      </header>

      <hr className="border-t border-neutral-light" />

      <div className="flex items-center justify-between text-sm mt-2">
        <Link
          href={`/user/tracker/bills/${billId}`}
          className="text-primary hover:underline"
        >
          ← Back to Tracked Bill
        </Link>

        {/* Simple pagination controls (optional to flesh out later) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="px-2 py-1 border rounded disabled:opacity-40"
            disabled={!canPrev}
            onClick={() => canPrev && setPage((p) => p - 1)}
          >
            Prev
          </button>
          <span className="text-neutral-muted">
            Page {meta.page} of {meta.pages}
          </span>
          <button
            type="button"
            className="px-2 py-1 border rounded disabled:opacity-40"
            disabled={!canNext}
            onClick={() => canNext && setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {loading && <p className="mt-6 text-neutral-muted">Loading…</p>}
      {error && <p className="mt-6 text-danger">{error}</p>}

      {!loading && !error && (
        <>
          {provisions.length === 0 ? (
            <div className="rounded-2xl border p-6 bg-white text-sm text-gray-600">
              No provisions found for this bill.
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {provisions.map((prov) => {
                const pid = prov.pid || prov._id;
                const ann = annotationsByProvision[String(pid)] || {};
                const notes = ann.generalNotes || "";
                const linksCount = (ann.links || []).length;
                const attachmentsCount = (ann.attachments || []).length;
                const labelsCount = (ann.labels || []).length;

                const hasAnyAnnotations =
                  !!(notes && notes.trim()) ||
                  linksCount > 0 ||
                  attachmentsCount > 0 ||
                  labelsCount > 0;

                return (
                  <div key={pid} className="cursor-pointer">
                    {/* Card itself is clickable, like Tracked Bills list */}
                    <Link
                      href={`/user/tracker/bills/${billId}/provisions/${pid}`}
                      className="block"
                    >
                      <ProvisionCard
                        provision={prov}
                        annotationSummary={{
                          hasNotes: !!(notes && notes.trim()),
                          linksCount,
                          attachmentsCount,
                          labelsCount,
                        }}
                      />
                    </Link>

                    {/* Annotations footer – mirrors Tracked Bills pattern */}
                    <div className="mt-3 flex flex-col gap-2">
                      {hasAnyAnnotations ? (
                        <>
                          <InlineCountBadges
                            links={linksCount}
                            attachments={attachmentsCount}
                            labels={labelsCount}
                          />
                          {notes && notes.trim() && (
                            <p className="text-sm text-neutral-dark">
                              <span className="font-semibold text-neutral-muted">
                                Note:
                              </span>{" "}
                              {notes.slice(0, 160)}
                              {notes.length > 160 ? "…" : ""}
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="text-xs text-neutral-muted">
                          No annotations yet for this provision.
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </section>
  );
}
