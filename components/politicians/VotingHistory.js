//components/politicians/VotingHistory.js
"use client";

import Link from "next/link";

export default function VotingHistory({ votingHistory }) {
  if (!Array.isArray(votingHistory)) return null;

  // Helper to decide badge color based on vote
  const badgeFor = (vote) => {
    switch (vote) {
      case "Yes":
        return "bg-success-dark text-white";
      case "No":
        return "bg-danger-dark text-white";
      case "Abstain":
        return "bg-warning-dark text-white";
      case "Absent":
        return "bg-neutral-dark text-white";
      default:
        return "bg-neutral-dark text-white";
    }
  };

  const getBillMeta = (billRef) => {
    // billRef will be either an ObjectId (string) or a populated object
    if (!billRef) return { id: null, label: "Unknown bill", session: null };

    if (typeof billRef === "string") {
      return { id: billRef, label: billRef, session: null };
    }

    const id = billRef._id?.toString?.() ?? billRef.id?.toString?.() ?? null;

    const title = billRef.title || "";
    const number = billRef.number || "";
    const label = [number, title].filter(Boolean).join(" — ") || (id ?? "Bill");

    return { id, label, session: billRef.session ?? null };
  };

  return (
    <section>
      <div className="bg-white border border-neutral-light rounded-xl shadow-sm p-6">
        <h2 className="text-2xl font-semibold mb-8">Voting History</h2>

        <div className="relative ml-4">
          <div className="absolute top-0 left-2 w-0.5 h-full bg-neutral-light" />

          {votingHistory.map((item, idx) => {
            const { id: billId, label, session } = getBillMeta(item.bill_id);

            return (
              <div key={idx} className="mb-8 flex items-start">
                <div className="flex items-center justify-center w-4 h-4 bg-primary-light rounded-full relative z-10 mt-1 border border-neutral-light" />

                <div className="ml-6">
                  {/* Bill label + link */}
                  <p className="font-semibold text-neutral-dark">
                    {billId ? (
                      <Link
                        href={`/bills/${billId}`}
                        className="hover:underline text-primary-dark"
                      >
                        {label}
                      </Link>
                    ) : (
                      label
                    )}
                  </p>

                  <div className="flex items-center mt-1">
                    <span
                      className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${badgeFor(
                        item.vote
                      )}`}
                    >
                      {item.vote}
                    </span>

                    {/* Show session from the populated bill if present */}
                    {(session || item.session) && (
                      <span className="ml-2 text-sm text-neutral-dark">
                        {session || item.session}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
