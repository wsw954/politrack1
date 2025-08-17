// components/bills/FilterBar.js
"use client";

export default function FilterBar({ allBills, filters, setFilters }) {
  const getOptions = (key) => {
    if (key === "tag") {
      const tagMap = new Map();

      allBills.forEach((b) => {
        if (Array.isArray(b.tags)) {
          b.tags.forEach((tag) => {
            if (tag && tag._id && tag.name) {
              tagMap.set(tag._id.toString(), tag.name);
            }
          });
        }
      });

      return Array.from(tagMap.entries()).sort((a, b) =>
        a[1].localeCompare(b[1])
      );
    }

    const values = new Set();
    allBills.forEach((b) => {
      if (key === "title") values.add(b.title);
      if (key === "status") values.add(b.status.current_stage);
    });
    return Array.from(values).sort((a, b) => a.localeCompare(b));
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Bill Title */}
      <div className="col-span-2 sm:col-span-2 lg:col-span-4 bg-white border border-neutral-light rounded-lg shadow-sm p-3">
        <label
          htmlFor="title"
          className="text-sm font-semibold mb-1 block text-neutral-dark"
        >
          Bill Title
        </label>
        <select
          id="title"
          className="w-full border border-neutral-light rounded-md p-2"
          value={filters.title}
          onChange={(e) => setFilters({ ...filters, title: e.target.value })}
        >
          <option value="">Select</option>
          {getOptions("title").map((val) => (
            <option key={`title-${val}`} value={val}>
              {val}
            </option>
          ))}
        </select>
      </div>

      {/* Tags */}
      <div className="col-span-2 sm:col-span-2 lg:col-span-1 bg-white border border-neutral-light rounded-lg shadow-sm p-3">
        <label
          htmlFor="tag"
          className="text-sm font-semibold mb-1 block text-neutral-dark"
        >
          Tags
        </label>
        <select
          id="tag"
          className="w-full border border-neutral-light rounded-md p-2"
          value={filters.tag}
          onChange={(e) => {
            const newTag = e.target.value || "";
            if (filters.tag !== newTag) {
              setFilters((prev) => ({ ...prev, tag: newTag }));
            }
          }}
        >
          <option value="">Select</option>
          {getOptions("tag").map(([id, name]) => (
            <option key={`tag-${id}`} value={id.toString()}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {/* Status */}
      <div className="col-span-2 sm:col-span-2 lg:col-span-1 bg-white border border-neutral-light rounded-lg shadow-sm p-3">
        <label
          htmlFor="status"
          className="text-sm font-semibold mb-1 block text-neutral-dark"
        >
          Status
        </label>
        <select
          id="status"
          className="w-full border border-neutral-light rounded-md p-2"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">Select</option>
          {getOptions("status").map((val) => (
            <option key={`status-${val}`} value={val}>
              {val}
            </option>
          ))}
        </select>
      </div>

      {/* Sort */}
      <div className="col-span-2 sm:col-span-2 lg:col-span-1 bg-white border border-neutral-light rounded-lg shadow-sm p-3">
        <label
          htmlFor="sort"
          className="text-sm font-semibold mb-1 block text-neutral-dark"
        >
          Sort By
        </label>
        <select
          id="sort"
          className="w-full border border-neutral-light rounded-md p-2"
          value={filters.sort}
          onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
        >
          <option value="none">Sort (None)</option>
          <option value="title-asc">Title (A–Z)</option>
          <option value="title-desc">Title (Z–A)</option>
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
        </select>
      </div>
    </div>
  );
}
