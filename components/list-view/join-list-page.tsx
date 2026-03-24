"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface JoinListPageProps {
  hash: string;
  listTitle: string;
}

export function JoinListPage({ hash, listTitle }: JoinListPageProps) {
  const router = useRouter();
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleJoin() {
    setJoining(true);
    setError(null);

    try {
      const res = await fetch(`/api/lists/${hash}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to join list");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setJoining(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Join this list?
        </h1>
        <p className="text-gray-500 mb-6">
          You&apos;ve been invited to collaborate on{" "}
          <span className="font-semibold text-gray-700">{listTitle}</span>
        </p>
        <button
          onClick={handleJoin}
          disabled={joining}
          className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {joining ? "Joining..." : "Join this list"}
        </button>
        {error && (
          <p className="mt-3 text-sm text-red-600">{error}</p>
        )}
        <p className="mt-4">
          <a href="/dashboard" className="text-sm text-blue-600 hover:underline">
            Back to dashboard
          </a>
        </p>
      </div>
    </main>
  );
}
