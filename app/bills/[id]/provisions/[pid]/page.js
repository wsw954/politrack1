// app/bills/[id]/provisions/[pid]/page.js
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import LegalTextItem from "@/components/provisions/LegalTextItem";

export default function ProvisionDetailPage() {
  const { id: id, pid } = useParams();

  const [prov, setProv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLegalText, setShowLegalText] = useState(false);

  useEffect(() => {
    if (!id || !pid) return;
    const load = async () => {
      try {
        const res = await fetch(`/api/bills/${id}/provisions/${pid}`);
        if (!res.ok) throw new Error("Failed to fetch provision");
        const data = await res.json();
        setProv(data);
      } catch (e) {
        console.error(e);
        setError(e.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, pid]);

  return (
    <section className="w-full py-6 space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Provision Detail</h1>
        <div className="flex gap-2">
          <Link
            href={`/bills/${id}/provisions`}
            className="inline-block px-3 py-2 rounded border border-neutral-light hover:bg-neutral-light"
          >
            ← Back to Provisions
          </Link>
          <Link
            href={`/bills/${id}`}
            className="inline-block px-3 py-2 rounded border border-neutral-light hover:bg-neutral-light"
          >
            Bill Overview
          </Link>
        </div>
      </div>

      {loading && <p className="text-neutral-muted">Loading…</p>}
      {error && <p className="text-danger">{error}</p>}

      {!loading && !error && prov && (
        <div className="border border-neutral-light rounded-lg p-6 shadow-sm">
          {/* Section + Heading */}
          <div className="mb-4">
            <h2 className="text-xl font-bold text-primary">
              Section {prov.section_number}
            </h2>
            {prov.heading && (
              <p className="text-sm text-neutral-dark">{prov.heading}</p>
            )}
          </div>

          {/* Summary */}
          {prov.summary && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-neutral-muted">
                Summary
              </p>
              <p className="text-sm text-neutral-dark">{prov.summary}</p>
            </div>
          )}

          {/* Why it matters */}
          {prov.why_it_matters && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-neutral-muted">
                Why It Matters
              </p>
              <p className="text-sm text-neutral-dark">{prov.why_it_matters}</p>
            </div>
          )}

          {/* Tags */}
          {Array.isArray(prov.tags) && prov.tags.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-neutral-muted">Tags</p>
              <p className="text-sm text-neutral-dark">
                {prov.tags.map((t) => t.name ?? t).join(", ")}
              </p>
            </div>
          )}

          {/* Type */}
          {prov.type && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-neutral-muted">Type</p>
              <p className="text-sm text-neutral-dark">{prov.type}</p>
            </div>
          )}

          {/* Legal text expandable */}
          <div className="mt-6">
            <button
              onClick={() => setShowLegalText(!showLegalText)}
              className="w-full flex items-center justify-between px-4 py-2 bg-neutral-light rounded hover:bg-neutral-dark/10"
            >
              <span className="text-sm font-semibold text-neutral-dark">
                Legal Text Items ({prov.legal_text?.length ?? 0})
              </span>
              <span className="text-sm text-primary">
                {showLegalText ? "▲ Hide" : "▼ Show"}
              </span>
            </button>

            {showLegalText && (
              <div className="mt-4 space-y-4">
                {(prov.legal_text ?? []).map((item) => (
                  <LegalTextItem key={item._id} item={item} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
