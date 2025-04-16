//app/page.js
"use client";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50 p-6 flex flex-col items-center justify-center">
      <Card className="max-w-xl text-center p-8">
        <h1 className="text-4xl font-bold mb-4 text-blue-800">
          Welcome to Politrack
        </h1>
        <p className="text-lg mb-6 text-gray-700">
          A clear, actionable, and user-friendly platform that helps Floridians
          track how their elected officials vote, understand what legislation
          really means, and take meaningful action to support or oppose
          bills—all in one place.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/auth/register">
            <Button>Register</Button>
          </Link>
          <Link href="/auth/login">
            <Button>Login</Button>
          </Link>
        </div>
      </Card>
    </main>
  );
}
