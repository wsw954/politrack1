//components/politicians/VotingHistory.js
"use client";

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

  return (
    <section>
      <div className="bg-white border border-neutral-light rounded-xl shadow-sm p-6">
        <h2 className="text-2xl font-semibold mb-8">Voting History</h2>

        <div className="relative ml-4">
          {/* Timeline vertical line */}
          <div className="absolute top-0 left-2 w-0.5 h-full bg-neutral-light"></div>

          {/* Timeline events */}
          {votingHistory.map((vote, index) => (
            <div key={index} className="mb-8 flex items-start">
              {/* Dot */}
              <div className="flex items-center justify-center w-4 h-4 bg-primary-light rounded-full relative z-10 mt-1 border border-neutral-light"></div>

              {/* Vote details */}
              <div className="ml-6">
                <p className="font-semibold text-neutral-dark">
                  {vote.bill_id}
                </p>

                <div className="flex items-center mt-1">
                  <span
                    className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${badgeFor(
                      vote.vote
                    )}`}
                  >
                    {vote.vote}
                  </span>
                  <span className="ml-2 text-sm text-neutral-dark">
                    {vote.topic} • {vote.session}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
