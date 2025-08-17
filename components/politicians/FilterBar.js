//components/politicians/FilterBar.js
"use client";

export default function FilterBar({ allPoliticians, filters, setFilters }) {
  const getOptions = (key) => {
    if (key === "name") {
      const nameMap = new Map();

      allPoliticians.forEach((p) => {
        // ✅ Create user-friendly label: Last, First
        const displayName = `${p.last_name}, ${p.first_name}`;

        // ✅ Use unique `p.name` as the filter value
        nameMap.set(p.name, displayName);
      });

      // ✅ Sort by label (last name)
      return Array.from(nameMap.entries()).sort((a, b) =>
        a[1].localeCompare(b[1])
      );
    }

    const values = new Set();
    allPoliticians.forEach((p) => {
      if (key === "chamber") values.add(p.chamber);
      if (key === "party") values.add(p.party);
    });

    return Array.from(values).sort((a, b) => a.localeCompare(b));
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Politician Name Filter */}
      <div className="col-span-2 sm:col-span-2 lg:col-span-4 bg-white border border-neutral-light rounded-lg shadow-sm p-3">
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

          {/* ✅ Render dropdown: value = unique name, label = Last, First */}
          {getOptions("name").map(([uniqueName, label]) => (
            <option key={`name-${uniqueName}`} value={uniqueName}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Chamber Filter */}
      <div className="col-span-2 sm:col-span-2 lg:col-span-1 bg-white border border-neutral-light rounded-lg shadow-sm p-3">
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

      {/* Party Filter */}
      <div className="col-span-2 sm:col-span-2 lg:col-span-1 bg-white border border-neutral-light rounded-lg shadow-sm p-3">
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
      {/*Sort By dropdown */}
      <div className="col-span-2 sm:col-span-2 lg:col-span-1 bg-white border border-neutral-light rounded-lg shadow-sm p-3">
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
    </div>
  );
}
