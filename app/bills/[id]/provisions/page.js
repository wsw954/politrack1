// app/bills/[id]/provisions/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import ProvisionCard from "@/components/provisions/ProvisionCard";

export default function ProvisionsListPage() {
  const { id } = useParams();
  const [provisions, setProvisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const router = useRouter();

  useEffect(() => {
    const fetchProvisions = async () => {
      try {
        const res = await fetch(`/api/bills/${id}/provisions`);
        if (!res.ok) throw new Error("Failed to fetch provisions");
        const data = await res.json();
        setProvisions(data);
      } catch (err) {
        console.error(err);
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchProvisions();
  }, [id]);

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold text-center mb-6">
        Provisions for Bill
      </h1>

      {loading && <p className="text-neutral-muted">Loading...</p>}
      {error && <p className="text-danger">{error}</p>}

      {!loading && !error && (
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          {provisions.length > 0 ? (
            provisions.map((prov) => (
              <div key={prov._id} className="cursor-pointer">
                <ProvisionCard provision={prov} />
              </div>
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
