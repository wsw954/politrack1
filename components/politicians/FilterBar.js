//components/FilterBar.js
"use client";

export default function FilterBar({ allPoliticians, filters, setFilters }) {
  const getOptions = (key) => {
    const values = new Set();
    allPoliticians.forEach((p) => {
      if (key === "name") values.add(`${p.first_name} ${p.last_name}`);
      else values.add(p[key]);
    });
    return Array.from(values).sort();
  };

  return (
    <div className="flex flex-wrap gap-4 mb-6">
      {/* Office - narrower */}
      <div className="w-full sm:w-[48%] lg:w-[20%] bg-white border rounded-lg shadow-sm p-3">
        <label
          htmlFor="chamber"
          className="text-sm font-semibold mb-1 block text-gray-700"
        >
          Office
        </label>
        <select
          id="chamber"
          className="w-full border rounded-md p-2"
          value={filters.chamber}
          onChange={(e) => setFilters({ ...filters, chamber: e.target.value })}
        >
          <option value="">Select</option>
          {getOptions("chamber").map((val) => (
            <option key={val}>{val}</option>
          ))}
        </select>
      </div>

      {/* Name - wide */}
      <div className="w-full sm:w-[48%] lg:flex-1 bg-white border rounded-lg shadow-sm p-3">
        <label
          htmlFor="name"
          className="text-sm font-semibold mb-1 block text-gray-700"
        >
          Name
        </label>
        <select
          id="name"
          className="w-full border rounded-md p-2"
          value={filters.name}
          onChange={(e) => setFilters({ ...filters, name: e.target.value })}
        >
          <option value="">Select</option>
          {getOptions("name").map((val) => (
            <option key={val}>{val}</option>
          ))}
        </select>
      </div>

      {/* Party - medium */}
      <div className="w-full sm:w-[48%] lg:w-[20%] bg-white border rounded-lg shadow-sm p-3">
        <label
          htmlFor="party"
          className="text-sm font-semibold mb-1 block text-gray-700"
        >
          Party
        </label>
        <select
          id="party"
          className="w-full border rounded-md p-2"
          value={filters.party}
          onChange={(e) => setFilters({ ...filters, party: e.target.value })}
        >
          <option value="">Select</option>
          {getOptions("party").map((val) => (
            <option key={val}>{val}</option>
          ))}
        </select>
      </div>

      {/* District - narrower */}
      <div className="w-full sm:w-[48%] lg:w-[18%] bg-white border rounded-lg shadow-sm p-3">
        <label
          htmlFor="district"
          className="text-sm font-semibold mb-1 block text-gray-700"
        >
          District
        </label>
        <select
          id="district"
          className="w-full border rounded-md p-2"
          value={filters.district}
          onChange={(e) => setFilters({ ...filters, district: e.target.value })}
        >
          <option value="">Select</option>
          {getOptions("district").map((val) => (
            <option key={val}>{val}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
