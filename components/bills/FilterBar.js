// components/bills/FilterBar.js
"use client";

export default function FilterBar({ allBills, filters, setFilters }) {
  const getOptions = (key) => {
    const values = new Set();
    allBills.forEach((b) => {
      if (key === "tag") {
        b.tags.forEach((tag) => values.add(tag));
      } else if (key === "title") {
        values.add(b.title);
      } else if (key === "status") {
        values.add(b.status.current_stage);
      }
    });
    return Array.from(values).sort();
  };

  return (
    <div className="flex flex-wrap gap-4 mb-6">
      {/* Title */}
      <div className="w-full sm:w-[48%] lg:flex-1 bg-white border rounded-lg shadow-sm p-3">
        <label
          htmlFor="title"
          className="text-sm font-semibold mb-1 block text-gray-700"
        >
          Bill Title
        </label>
        <select
          id="title"
          className="w-full border rounded-md p-2"
          value={filters.title}
          onChange={(e) => setFilters({ ...filters, title: e.target.value })}
        >
          <option value="">Select</option>
          {getOptions("title").map((val) => (
            <option key={val}>{val}</option>
          ))}
        </select>
      </div>

      {/* Tag */}
      <div className="w-full sm:w-[48%] lg:w-[25%] bg-white border rounded-lg shadow-sm p-3">
        <label
          htmlFor="tag"
          className="text-sm font-semibold mb-1 block text-gray-700"
        >
          Tag
        </label>
        <select
          id="tag"
          className="w-full border rounded-md p-2"
          value={filters.tag}
          onChange={(e) => setFilters({ ...filters, tag: e.target.value })}
        >
          <option value="">Select</option>
          {getOptions("tag").map((val) => (
            <option key={val}>{val}</option>
          ))}
        </select>
      </div>

      {/* Status */}
      <div className="w-full sm:w-[48%] lg:w-[25%] bg-white border rounded-lg shadow-sm p-3">
        <label
          htmlFor="status"
          className="text-sm font-semibold mb-1 block text-gray-700"
        >
          Current Status
        </label>
        <select
          id="status"
          className="w-full border rounded-md p-2"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">Select</option>
          {getOptions("status").map((val) => (
            <option key={val}>{val}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
