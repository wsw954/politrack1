//app/user/tracker/bills/page.js
"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "@/lib/axiosInstance";

import SectionWrapper from "@/components/ui/SectionWrapper";
import Spinner from "@/components/ui/Spinner";
import Card from "@/components/ui/Card";
import BillCard from "@/components/bills/BillCard";
import Link from "next/link";
import { normalizeId } from "@/utils/normalizeId";

export default function TrackedBillsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [tracked, setTracked] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchTrackedBills = async () => {
      try {
        const res = await axios.get(
          `/api/users/${session.user.id}/tracker/bills`
        );
        setTracked(res.data || []);
      } catch (err) {
        console.error("Error fetching tracked bills:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrackedBills();
  }, [session]);

  if (status === "loading" || loading) return <Spinner />;
  if (!session) return <p className="text-red-600">You must be logged in.</p>;

  return (
    <SectionWrapper>
      <h1 className="text-2xl font-bold mb-6">Tracked Bills</h1>

      {tracked.length === 0 ? (
        <p className="text-neutral-muted">You aren’t tracking any bills yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tracked.map(({ itemId, note }, index) => {
            const bill = itemId;
            const id = normalizeId(bill?._id || index);

            return (
              <Link key={id} href={`/user/tracker/bills/${id}`}>
                <Card className="space-y-4 p-4">
                  <BillCard
                    bill={{
                      id,
                      number: bill.number,
                      title: bill.title,
                      summary: bill.summary,
                      tags: bill.tags?.map((tag) => tag.name),
                      current_stage: bill.status?.current_stage,
                    }}
                  />
                  {note && (
                    <p className="italic text-sm text-gray-700 border-l-4 border-blue-400 pl-4">
                      {note}
                    </p>
                  )}
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </SectionWrapper>
  );
}
