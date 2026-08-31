import React from 'react';
import Link from "next/link";
import Navbar from "./components/Navbar";

export default async function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="text-center py-24 px-6">
        <h1 className="text-6xl font-extrabold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
          South Africa's eFootball Tournament Platform
        </h1>

        <p className="mt-6 text-xl text-gray-400 max-w-3xl mx-auto">
          Create leagues, organize cups, manage communities and compete for glory.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/dashboard"
            className="bg-green-600 hover:bg-green-700 px-8 py-3 rounded-xl font-bold text-white transition"
          >
            🚀 Get Started
          </Link>
          <Link
            href="/login"
            className="bg-zinc-800 hover:bg-zinc-700 px-8 py-3 rounded-xl font-bold text-white transition"
          >
            🔐 Login
          </Link>
        </div>
      </section>

      {/* Dashboard Cards */}
      <section className="max-w-7xl mx-auto py-16 px-6">
        <h2 className="text-4xl font-bold mb-8 text-center">
          Tournament Dashboard
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            href="/communities"
            className="group bg-zinc-900 hover:bg-zinc-800 rounded-xl p-6 text-center transition border border-zinc-800 hover:border-green-500/50"
          >
            <div className="text-5xl mb-3 group-hover:scale-110 transition">👥</div>
            <h3 className="text-2xl font-bold text-green-400">Communities</h3>
            <p className="text-gray-400 text-sm mt-2">Create and manage eFootball communities.</p>
          </Link>

          <Link
            href="/create-league"
            className="group bg-zinc-900 hover:bg-zinc-800 rounded-xl p-6 text-center transition border border-zinc-800 hover:border-blue-500/50"
          >
            <div className="text-5xl mb-3 group-hover:scale-110 transition">⚽</div>
            <h3 className="text-2xl font-bold text-blue-400">Leagues</h3>
            <p className="text-gray-400 text-sm mt-2">Create league competitions.</p>
          </Link>

          <Link
            href="/cups"
            className="group bg-zinc-900 hover:bg-zinc-800 rounded-xl p-6 text-center transition border border-zinc-800 hover:border-yellow-500/50"
          >
            <div className="text-5xl mb-3 group-hover:scale-110 transition">🏆</div>
            <h3 className="text-2xl font-bold text-yellow-400">Cups</h3>
            <p className="text-gray-400 text-sm mt-2">Create knockout tournaments.</p>
          </Link>

          <Link
            href="/admin"
            className="group bg-zinc-900 hover:bg-zinc-800 rounded-xl p-6 text-center transition border border-zinc-800 hover:border-red-500/50"
          >
            <div className="text-5xl mb-3 group-hover:scale-110 transition">👑</div>
            <h3 className="text-2xl font-bold text-red-400">Admin</h3>
            <p className="text-gray-400 text-sm mt-2">Manage and approve results.</p>
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-zinc-900 rounded-xl p-6 text-center border border-zinc-800 hover:border-green-500/30 transition">
            <h3 className="text-4xl font-bold text-green-500">250+</h3>
            <p className="text-gray-400">Players</p>
          </div>

          <div className="bg-zinc-900 rounded-xl p-6 text-center border border-zinc-800 hover:border-green-500/30 transition">
            <h3 className="text-4xl font-bold text-green-500">35</h3>
            <p className="text-gray-400">Communities</p>
          </div>

          <div className="bg-zinc-900 rounded-xl p-6 text-center border border-zinc-800 hover:border-green-500/30 transition">
            <h3 className="text-4xl font-bold text-green-500">120</h3>
            <p className="text-gray-400">Tournaments</p>
          </div>

          <div className="bg-zinc-900 rounded-xl p-6 text-center border border-zinc-800 hover:border-green-500/30 transition">
            <h3 className="text-4xl font-bold text-green-500">850</h3>
            <p className="text-gray-400">Matches Played</p>
          </div>
        </div>
      </section>

      {/* Featured Competitions */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <h2 className="text-3xl font-bold mb-6">🏆 Featured Competitions</h2>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 hover:border-green-500/50 transition group">
            <h3 className="text-xl font-bold text-green-500 group-hover:text-green-400 transition">Premier League</h3>
            <p className="text-gray-400 mt-2">20 Teams • Matchday 8</p>
          </div>

          <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 hover:border-yellow-500/50 transition group">
            <h3 className="text-xl font-bold text-yellow-400 group-hover:text-yellow-300 transition">Champions Cup</h3>
            <p className="text-gray-400 mt-2">Quarter Finals</p>
          </div>

          <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 hover:border-blue-500/50 transition group">
            <h3 className="text-xl font-bold text-blue-400 group-hover:text-blue-300 transition">KZN League</h3>
            <p className="text-gray-400 mt-2">48 Players</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-6 pb-16 text-center">
        <div className="bg-gradient-to-r from-green-900/30 to-blue-900/30 rounded-2xl p-10 border border-zinc-800">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Tournament?</h2>
          <p className="text-gray-400 mb-6">Join hundreds of players and start competing today.</p>
          <Link
            href="/dashboard"
            className="bg-green-600 hover:bg-green-700 px-8 py-3 rounded-xl font-bold text-white transition inline-block"
          >
            🚀 Go to Dashboard
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-8 text-center text-gray-500">
        © 2026 eLeague SA • The Home of eFootball Tournaments
      </footer>
    </main>
  );
}