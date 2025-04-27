//components/politicians/VotingHistory.js
"use client";

export default function VotingHistory({ votingHistory }) {
  if (!votingHistory) return null;

  // Helper to decide badge color based on vote
  function getBadgeColor(vote) {
    switch (vote) {
      case "Yes":
        return "bg-green-500";
      case "No":
        return "bg-red-500";
      case "Abstain":
        return "bg-yellow-400";
      case "Absent":
        return "bg-gray-400";
      default:
        return "bg-gray-300";
    }
  }

  return (
    <section className="mb-8">
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-8">Voting History</h2>

        <div className="relative ml-4">
          {/* Timeline vertical line */}
          <div className="absolute top-0 left-2 w-0.5 h-full bg-gray-300"></div>

          {/* Timeline events */}
          {votingHistory.map((vote, index) => (
            <div key={index} className="mb-8 flex items-start">
              {/* Dot */}
              <div className="flex items-center justify-center w-4 h-4 bg-blue-500 rounded-full relative z-10 mt-1"></div>

              {/* Vote details */}
              <div className="ml-6">
                <p className="font-semibold">{vote.bill_id}</p>

                {/* Vote with Badge */}
                <div className="flex items-center mt-1">
                  <span
                    className={`inline-block px-2 py-0.5 text-xs font-semibold text-white rounded-full ${getBadgeColor(
                      vote.vote
                    )}`}
                  >
                    {vote.vote}
                  </span>
                  <span className="ml-2 text-sm text-gray-700">
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
