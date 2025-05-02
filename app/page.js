//app/page.js
// "use client";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import SectionWrapper from "@/components/ui/SectionWrapper";
import FlexRow from "@/components/ui/FlexRow";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session?.user?.role) {
    const dashboardPath =
      session.user.role === "admin"
        ? "/admin/dashboard"
        : session.user.role === "user"
        ? "/user/dashboard"
        : "/";
    redirect(dashboardPath);
  }

  return (
    <SectionWrapper>
      <div className="text-center space-y-4 mb-10">
        <h1 className="text-4xl font-bold text-gray-900">
          Welcome to Politrack
        </h1>
        <p className="text-lg text-gray-600">
          Track how politicians vote, understand what legislation really means,
          and take action.
        </p>
      </div>

      <FlexRow>
        <Card>
          <h2 className="text-xl font-semibold mb-2 text-center">
            View Politicians
          </h2>
          <p className="text-sm text-gray-600 mb-4 text-center">
            Explore voting records, profiles, and political affiliations.
          </p>
          <Link href="/politicians">
            <Button>Explore Politicians</Button>
          </Link>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold mb-2 text-center">View Bills</h2>
          <p className="text-sm text-gray-600 mb-4 text-center">
            See summaries of key legislation and follow their progress.
          </p>
          <Link href="/bills">
            <Button>Browse Bills</Button>
          </Link>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold mb-2 text-center">
            Take Action
          </h2>
          <p className="text-sm text-gray-600 mb-4 text-center">
            Contact your representatives or sign petitions on current issues.
          </p>
          <Link href="/engagement">
            <Button>Engage Now</Button>
          </Link>
        </Card>
      </FlexRow>
    </SectionWrapper>
  );
}
