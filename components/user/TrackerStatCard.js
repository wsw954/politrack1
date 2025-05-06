// components/user/TrackerStatCard.js
import Link from "next/link";

export default function TrackerStatCard({ title, count, link }) {
  return (
    <Link href={link}>
      <div className="p-4 border rounded-lg shadow hover:shadow-md transition bg-white">
        <h3 className="text-lg font-semibold mb-1">{title}</h3>
        <p className="text-3xl font-bold text-blue-600">{count}</p>
      </div>
    </Link>
  );
}
