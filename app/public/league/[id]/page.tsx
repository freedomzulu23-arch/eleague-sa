import Link from 'next/link';

// This is a simple static page that doesn't need Supabase
export default async function PublicLeaguePage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">🏆</div>
        <h1 className="text-3xl font-bold text-green-500 mb-4">Public League Page</h1>
        <p className="text-zinc-400 mb-6">
          This feature is coming soon. Check back later!
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-semibold transition"
          >
            ← Back to Home
          </Link>
          <Link
            href="/dashboard"
            className="bg-zinc-800 hover:bg-zinc-700 px-6 py-3 rounded-lg font-semibold transition"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}