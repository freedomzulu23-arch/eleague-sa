
import Navbar from "./components/Navbar";
export default async function Home() {
  
 
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
<Navbar />
     
      {/* Hero */}
      <p className="text-green-400">
    
      </p>
      <section className="text-center py-24 px-6">

        <h2 className="text-6xl font-extrabold">
          South Africa's eFootball Tournament Platform
        </h2>

        <p className="mt-6 text-xl text-gray-400 max-w-3xl mx-auto">
          Create leagues, organize cups, manage communities and compete for glory.
        </p>
<section className="max-w-7xl mx-auto py-16 px-6">
  <h2 className="text-4xl font-bold mb-8 text-center">
    Tournament Dashboard
  </h2>

  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

    <div className="bg-zinc-900 rounded-xl p-6 hover:bg-zinc-800 cursor-pointer">
      <h3 className="text-2xl font-bold text-green-400">
        Communities
      </h3>
      <p>Create and manage eFootball communities.</p>
    </div>

    <div className="bg-zinc-900 rounded-xl p-6 hover:bg-zinc-800 cursor-pointer">
      <h3 className="text-2xl font-bold text-blue-400">
        Leagues
      </h3>
      <p>Create league competitions.</p>
    </div>

    <div className="bg-zinc-900 rounded-xl p-6 hover:bg-zinc-800 cursor-pointer">
      <h3 className="text-2xl font-bold text-yellow-400">
        Cups
      </h3>
      <p>Create knockout tournaments.</p>
    </div>

    <div className="bg-zinc-900 rounded-xl p-6 hover:bg-zinc-800 cursor-pointer">
      <h3 className="text-2xl font-bold text-red-400">
        Rankings
      </h3>
      <p>View player rankings.</p>
    </div>

  </div>
</section>
      </section>

      {/* Stats */}
      <section className="grid md:grid-cols-4 gap-6 px-8">

        <div className="bg-zinc-900 rounded-xl p-6 text-center">
          <h3 className="text-4xl font-bold text-green-500">250+</h3>
          <p>Players</p>
        </div>

        <div className="bg-zinc-900 rounded-xl p-6 text-center">
          <h3 className="text-4xl font-bold text-green-500">35</h3>
          <p>Communities</p>
        </div>

        <div className="bg-zinc-900 rounded-xl p-6 text-center">
          <h3 className="text-4xl font-bold text-green-500">120</h3>
          <p>Tournaments</p>
        </div>

        <div className="bg-zinc-900 rounded-xl p-6 text-center">
          <h3 className="text-4xl font-bold text-green-500">850</h3>
          <p>Matches Played</p>
        </div>

      </section>

      {/* Featured Competitions */}
      <section className="px-8 py-16">

        <h2 className="text-3xl font-bold mb-6">
          🏆 Featured Competitions
        </h2>

        <div className="grid md:grid-cols-3 gap-6">

          <div className="bg-zinc-900 rounded-xl p-6">
            <h3 className="text-xl font-bold text-green-500">
              Premier League
            </h3>

            <p className="text-gray-400 mt-2">
              20 Teams • Matchday 8
            </p>
          </div>

          <div className="bg-zinc-900 rounded-xl p-6">
            <h3 className="text-xl font-bold text-green-500">
              Champions Cup
            </h3>

            <p className="text-gray-400 mt-2">
              Quarter Finals
            </p>
          </div>

          <div className="bg-zinc-900 rounded-xl p-6">
            <h3 className="text-xl font-bold text-green-500">
              KZN League
            </h3>

            <p className="text-gray-400 mt-2">
              48 Players
            </p>
          </div>

        </div>

      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-8 text-center text-gray-500">
        © 2026 eLeague SA • The Home of eFootball Tournaments
      </footer>

    </main>
  );
}