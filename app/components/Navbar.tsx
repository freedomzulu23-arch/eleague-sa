import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between bg-zinc-900 px-8 py-5 border-b border-zinc-800">
      {/* Logo */}
      <Link href="/" className="text-3xl font-bold text-green-500">
        ⚽ eLeague SA
      </Link>

      {/* Navigation Links */}
      <div className="flex gap-6">
        <Link href="/" className="hover:text-green-400">
          Home
        </Link>

        <Link href="/communities" className="hover:text-green-400">
          Communities
        </Link>

        <Link href="/leagues" className="hover:text-green-400">
          Leagues
        </Link>

        <Link href="/cups" className="hover:text-green-400">
          Cups
        </Link>

        <Link href="/rankings" className="hover:text-green-400">
          Rankings
        </Link>
      </div>

      {/* Authentication Buttons */}
      <div className="flex gap-3">
        <Link
          href="/login"
          className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg font-semibold transition"
        >
          Login
        </Link>

        <Link
          href="/register"
          className="bg-green-600 hover:bg-green-700 px-5 py-2 rounded-lg font-semibold transition"
        >
          Register
        </Link>
      </div>
    </nav>
  );
}