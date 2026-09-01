import Link from 'next/link';

export default async function PublicLeaguePage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-green-500 mb-4">⚽ Public League</h1>
        <p className="text-zinc-400 mb-6">This page is temporarily under construction.</p>
        <Link
          href="/"
          className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-semibold transition inline-block"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}