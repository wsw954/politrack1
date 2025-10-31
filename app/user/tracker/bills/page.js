// app/user/tracker/bills/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUserId } from "@/lib/useUserId";
import { getTrackedBills } from "@/lib/trackerClient";
import { normalizeId } from "@/utils/normalizeId";
import BillCard from "@/components/bills/BillCard";
import InlineCountBadges from "@/components/annotation/InlineCountBadges";

export default function TrackedBillsIndexPage() {
  const { userId, status } = useUserId();
  const [items, setItems] = useState([]);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const handleBillClick = (idLike) => {
    const id = normalizeId(idLike);
    if (id) router.push(`/user/tracker/bills/${id}`);
  };

  useEffect(() => {
    if (status === "loading") return;
    if (!userId) {
      setLoading(false);
      return;
    }

    let abort = false;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const data = await getTrackedBills(userId); // returns tracker.bills array
        if (!abort) setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!abort) setErr(e.message || "Failed to load tracked bills");
      } finally {
        if (!abort) setLoading(false);
      }
    })();

    return () => {
      abort = true;
    };
  }, [userId, status]);

  if (status === "loading")
    return (
      <div className="p-4 text-sm text-gray-600">Checking your session…</div>
    );
  if (!userId)
    return (
      <div className="p-4 text-sm text-gray-600">
        Please sign in to view your tracked bills.
      </div>
    );

  return (
    <section className="py-8 space-y-6">
      {/* match /app/bills/layout.js spacing */}
      {/* :contentReference[oaicite:3]{index=3} */}
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-neutral-dark">Tracked Bills</h1>
        <p className="text-base text-neutral-muted">
          Your saved legislation and notes.
        </p>
      </header>

      <hr className="border-t border-neutral-light" />
      {/* visual rhythm like untracked list */}
      {/* :contentReference[oaicite:4]{index=4} */}

      {loading ? (
        <p className="text-neutral-muted">Loading...</p>
      ) : err ? (
        <p className="text-danger">{err}</p>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border p-6 bg-white text-sm text-gray-600">
          You haven’t tracked any bills yet.
        </div>
      ) : (
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* same grid as untracked */}
          {/* :contentReference[oaicite:5]{index=5} */}
          {items.map((it) => {
            const bill = typeof it.itemId === "object" ? it.itemId : null;
            const billId = normalizeId(bill?._id || it.itemId);
            const notes = it.generalNotes || "";
            const linksCount = (it.links || []).length;
            const attachmentsCount = (it.attachments || []).length;
            const labelsCount = (it.labels || []).length;

            return (
              <div
                key={billId}
                className="cursor-pointer"
                onClick={() => handleBillClick(billId)}
              >
                {/* Reuse your BillCard visual language */}
                <BillCard
                  bill={{
                    id: billId,
                    number: bill?.number,
                    title: bill?.title || "Untitled Bill",
                    summary: bill?.summary,
                    tags: Array.isArray(bill?.tags)
                      ? bill.tags.map((t) => t.name || t)
                      : [],
                    current_stage: bill?.status?.current_stage,
                    isTracked: true, // these are tracked by definition
                    provisionCount: bill?.provisionCount ?? 0,
                  }}
                />

                {/* Annotations footer: counts + snippet + actions */}
                <div className="mt-3 flex flex-col gap-2">
                  <InlineCountBadges
                    links={linksCount}
                    attachments={attachmentsCount}
                    labels={labelsCount}
                  />
                  {notes ? (
                    <p className="text-sm text-neutral-dark">
                      <span className="font-semibold text-neutral-muted">
                        Note:
                      </span>{" "}
                      {notes.slice(0, 160)}
                      {notes.length > 160 ? "…" : ""}
                    </p>
                  ) : null}
                  <div className="flex gap-2">
                    <Link
                      className="rounded-lg border px-3 py-1 text-sm"
                      href={`/user/tracker/bills/${billId}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      View
                    </Link>
                    <Link
                      className="rounded-lg border px-3 py-1 text-sm"
                      href={`/user/tracker/bills/${billId}/edit`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
