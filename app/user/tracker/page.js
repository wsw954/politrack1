//app/user/tracker/page.js
"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import axios from "@/lib/axiosInstance";
import Link from "next/link";

import SectionWrapper from "@/components/ui/SectionWrapper";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import ActivityCard from "@/components/user/ActivityCard";
import TrackerStatCard from "@/components/user/TrackerStatCard";

export default function TrackerDashboardPage() {
  const { data: session, status } = useSession();
  const [trackerData, setTrackerData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTracker = async () => {
      if (!session?.user?.id) return;

      try {
        const res = await axios.get(`/api/users/${session.user.id}/tracker`);
        setTrackerData(res.data);
      } catch (err) {
        console.error("Failed to fetch tracker data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTracker();
  }, [session]);

  if (status === "loading" || loading) return <Spinner />;
  if (!session) return <p className="text-red-600">You must be logged in.</p>;
  if (!trackerData) return <p>No tracker data available.</p>;

  const { politicians = [], bills = [], tags = [] } = trackerData;
  console.log(session);

  const recentThreshold = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const updatedBills = bills.filter(
    (b) => new Date(b.updatedAt) > recentThreshold
  );
  const updatedPoliticians = politicians.filter(
    (p) => new Date(p.updatedAt) > recentThreshold
  );

  return (
    <SectionWrapper>
      <h1 className="text-2xl font-bold mb-6">Your Tracker Dashboard</h1>
      {/* Tracker Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <TrackerStatCard
          title="Tracked Politicians"
          count={politicians.length}
          link="/user/tracker/politicians"
        />
        <TrackerStatCard
          title="Tracked Bills"
          count={bills.length}
          link="/user/tracker/bills"
        />
        <TrackerStatCard
          title="Tracked Tags"
          count={tags.length}
          link="/user/tracker/tags"
        />
      </div>

      {/* Activity Feed */}
      <div className="space-y-4 mb-10">
        <h2 className="text-lg font-semibold">Recent Tracker Activity</h2>
        {updatedBills.length > 0 && (
          <ActivityCard
            icon="📜"
            message={`${updatedBills.length} tracked bills were updated recently.`}
          />
        )}
        {updatedPoliticians.length > 0 && (
          <ActivityCard
            icon="👤"
            message={`${updatedPoliticians.length} tracked politicians had recent votes or updates.`}
          />
        )}
        {updatedBills.length === 0 && updatedPoliticians.length === 0 && (
          <ActivityCard
            icon="🔕"
            message="No recent updates in the past week."
          />
        )}
      </div>

      {/* Quick Navigation Buttons */}
      <div className="flex flex-wrap gap-4">
        <Link href="/user/tracker/politicians">
          <Button>View Politicians</Button>
        </Link>
        <Link href="/user/tracker/bills">
          <Button>View Bills</Button>
        </Link>
        <Link href="/user/tracker/tags">
          <Button>View Tags</Button>
        </Link>
      </div>
    </SectionWrapper>
  );
}
