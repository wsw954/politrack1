// components/user/tracker/politicians/FilterBar.js
"use client";

/**
 * Tracker-specific FilterBar for Politicians
 * Mirrors /components/politicians/FilterBar.js,
 * plus room for tracker-only filters (e.g., hasNote).
 */
export default function TrackedPoliticiansFilterBar({
  allPoliticians = [],
  filters,
  setFilters,
}) {
  const getOptions = (key) => {
    if (!Array.isArray(allPoliticians)) return [];

    if (key === "name") {
      const nameMap = new Map();
      allPoliticians.forEach((p) => {
        const uniqueName = p?.name || null; // your schema's unique "name"
        const label = `${p?.last_name ?? ""}, ${p?.first_name ?? ""}`.trim();
        if (uniqueName && label) nameMap.set(uniqueName, label);
      });
      return Array.from(nameMap.entries()).sort((a, b) =>
        a[1].localeCompare(b[1])
      );
    }

    const values = new Set();
    allPoliticians.forEach((p) => {
      if (key === "chamber" && p?.chamber) values.add(p.chamber);
      if (key === "party" && p?.party) values.add(p.party);
      if (key === "district" && p?.district) values.add(p.district);
    });
    return Array.from(values).sort((a, b) =>
      String(a).localeCompare(String(b))
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {/* Name */}
      <div className="col-span-2 sm:col-span-2 lg:col-span-5 bg-white border border-neutral-light rounded-lg shadow-sm p-3">
        <label
          htmlFor="name"
          className="text-sm font-semibold mb-1 block text-neutral-dark"
        >
          Name
        </label>
        <select
          id="name"
          className="w-full border border-neutral-light rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
          value={filters.name}
          onChange={(e) => setFilters({ ...filters, name: e.target.value })}
        >
          <option value="">Select</option>
          {getOptions("name").map(([val, label]) => (
            <option key={`name-${val}`} value={val}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Chamber */}
      <div className="col-span-2 sm:col-span-1 lg:col-span-1 bg-white border border-neutral-light rounded-lg shadow-sm p-3">
        <label
          htmlFor="chamber"
          className="text-sm font-semibold mb-1 block text-neutral-dark"
        >
          Chamber
        </label>
        <select
          id="chamber"
          className="w-full border border-neutral-light rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
          value={filters.chamber}
          onChange={(e) => setFilters({ ...filters, chamber: e.target.value })}
        >
          <option value="">Select</option>
          {getOptions("chamber").map((val) => (
            <option key={`chamber-${val}`} value={val}>
              {val}
            </option>
          ))}
        </select>
      </div>

      {/* Party */}
      <div className="col-span-2 sm:col-span-1 lg:col-span-1 bg-white border border-neutral-light rounded-lg shadow-sm p-3">
        <label
          htmlFor="party"
          className="text-sm font-semibold mb-1 block text-neutral-dark"
        >
          Party
        </label>
        <select
          id="party"
          className="w-full border border-neutral-light rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
          value={filters.party}
          onChange={(e) => setFilters({ ...filters, party: e.target.value })}
        >
          <option value="">Select</option>
          {getOptions("party").map((val) => (
            <option key={`party-${val}`} value={val}>
              {val}
            </option>
          ))}
        </select>
      </div>

      {/* District */}
      <div className="col-span-2 sm:col-span-1 lg:col-span-1 bg-white border border-neutral-light rounded-lg shadow-sm p-3">
        <label
          htmlFor="district"
          className="text-sm font-semibold mb-1 block text-neutral-dark"
        >
          District
        </label>
        <select
          id="district"
          className="w-full border border-neutral-light rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
          value={filters.district}
          onChange={(e) => setFilters({ ...filters, district: e.target.value })}
        >
          <option value="">Select</option>
          {getOptions("district").map((val) => (
            <option key={`district-${val}`} value={val}>
              {val}
            </option>
          ))}
        </select>
      </div>

      {/* Sort (mirrors public list) */}
      <div className="col-span-2 sm:col-span-1 lg:col-span-1 bg-white border border-neutral-light rounded-lg shadow-sm p-3">
        <label
          htmlFor="sort"
          className="text-sm font-semibold mb-1 block text-neutral-dark"
        >
          Sort By
        </label>
        <select
          id="sort"
          className="w-full border border-neutral-light rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
          value={filters.sort}
          onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
        >
          <option value="">Select</option>
          <option value="name-asc">Name (A–Z)</option>
          <option value="name-desc">Name (Z–A)</option>
          <option value="party">Party</option>
        </select>
      </div>

      {/* Tracker-only example (optional, future) */}
      {/* <div className="col-span-2 sm:col-span-1 lg:col-span-1 ...">
        <label htmlFor="hasNote">Has Note</label>
        <select id="hasNote" value={filters.hasNote} onChange={(e)=>setFilters({...filters, hasNote: e.target.value})}>
          <option value="any">Any</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </div> */}
    </div>
  );
}
