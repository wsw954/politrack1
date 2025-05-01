// /components/bills/StatusTimeline.js
export default function StatusTimeline({ timeline = [], current = "" }) {
  if (!timeline.length)
    return <p className="text-gray-500">No timeline available.</p>;

  return (
    <ol className="relative border-l border-gray-300 pl-4 mt-2">
      {timeline.map((event, index) => {
        const isCurrent = event.stage === current;
        return (
          <li key={index} className="mb-6 ml-2">
            <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-1.5 border border-white"></div>
            <time className="block text-sm text-gray-500">{event.date}</time>
            <p
              className={`font-medium ${
                isCurrent ? "text-blue-700" : "text-gray-800"
              }`}
            >
              {event.stage}{" "}
              {isCurrent && (
                <span className="text-xs font-normal">(Current)</span>
              )}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
