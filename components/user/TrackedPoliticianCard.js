//components/user/TrackedPoliticianCard.js
"use client";

import PoliticianCard from "@/components/politicians/PoliticianCard";
import Card from "@/components/ui/Card";

export default function TrackedPoliticianCard({ politician, note }) {
  return (
    <Card className="space-y-4 p-4">
      {/* Politician Summary */}
      <PoliticianCard politician={politician} />

      {/* Tracker Note */}
      {note && (
        <div className="border-l-4 border-blue-400 pl-4 text-sm text-neutral-dark italic">
          {note}
        </div>
      )}
    </Card>
  );
}
