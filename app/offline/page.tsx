"use client";

import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="text-7xl mb-6">📡</div>

        <h1 className="text-3xl font-bold mb-3">
          You're Offline
        </h1>

        <p className="text-zinc-400 mb-6">
          It looks like you've lost your internet connection.
          Please check your network and try again.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition w-full"
          >
            🔄 Try Again
          </button>

          <Link
            href="/dashboard"
            className="block bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            ← Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}