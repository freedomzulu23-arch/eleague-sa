import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { notFound } from 'next/navigation';

// This is a Server Component (no 'use client')
export default async function PublicLeaguePage({
  params,
}: {
  params: { id: string };
}) {
  const leagueId = params.id;

  // Fetch league data
  const { data: league, error: leagueError } = await supabase
    .from('leagues')
    .select('*')
    .eq('id', leagueId)
    .maybeSingle();

  if (!league || leagueError) {
    notFound();
  }

  // Fetch teams
  const { data: teams } = await supabase
    .from('league_teams')
    .select('*')
    .eq('league_id', leagueId)
    .order('team_name', { ascending: true });

  // Fetch fixtures with team names
  const { data: fixtures } = await supabase
    .from('fixtures')
    .select(`
      *,
      home_team:league_teams!home_team_id(team_name),
      away_team:league_teams!away_team_id(team_name)
    `)
    .eq('league_id', leagueId)
    .order('round', { ascending: true });

  // Fetch league table
  const { data: leagueTable } = await supabase
    .from('league_table')
    .select('*')
    .eq('league_id', leagueId)
    .order('points', { ascending: false })
    .order('goal_difference', { ascending: false });

  // Group fixtures by round
  const groupedFixtures = fixtures?.reduce((acc, fixture) => {
    const round = fixture.round || 0;
    if (!acc[round]) acc[round] = [];
    acc[round].push(fixture);
    return acc;
  }, {} as Record<number, any[]>) || {};

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">⚽</span>
            <h1 className="text-3xl font-bold">{league.name}</h1>
          </div>
          <p className="text-zinc-400">
            Season: {league.season || 'N/A'} • {teams?.length || 0} Teams
          </p>
          <div className="mt-2 flex gap-3 flex-wrap">
            <span className="text-xs bg-green-900/30 text-green-400 px-3 py-1 rounded-full">
              {fixtures?.filter((f) => f.played).length || 0} Matches Played
            </span>
            <span className="text-xs bg-blue-900/30 text-blue-400 px-3 py-1 rounded-full">
              {fixtures?.length || 0} Total Fixtures
            </span>
          </div>
        </div>

        {/* League Table */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">📊 League Table</h2>
          {!leagueTable || leagueTable.length === 0 ? (
            <p className="text-zinc-400 text-center py-4">No matches played yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-700">
                    <th className="text-left py-2 px-3 text-zinc-400">#</th>
                    <th className="text-left py-2 px-3 text-zinc-400">Team</th>
                    <th className="text-center py-2 px-3 text-zinc-400">P</th>
                    <th className="text-center py-2 px-3 text-zinc-400">W</th>
                    <th className="text-center py-2 px-3 text-zinc-400">D</th>
                    <th className="text-center py-2 px-3 text-zinc-400">L</th>
                    <th className="text-center py-2 px-3 text-zinc-400">GF</th>
                    <th className="text-center py-2 px-3 text-zinc-400">GA</th>
                    <th className="text-center py-2 px-3 text-zinc-400">GD</th>
                    <th className="text-center py-2 px-3 font-bold text-yellow-400">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {leagueTable.map((row, index) => (
                    <tr key={row.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                      <td className="py-2 px-3 text-white font-medium">{index + 1}</td>
                      <td className="py-2 px-3 text-white">{row.team_name}</td>
                      <td className="py-2 px-3 text-center text-zinc-300">{row.played}</td>
                      <td className="py-2 px-3 text-center text-green-400">{row.won}</td>
                      <td className="py-2 px-3 text-center text-yellow-400">{row.drawn}</td>
                      <td className="py-2 px-3 text-center text-red-400">{row.lost}</td>
                      <td className="py-2 px-3 text-center text-zinc-300">{row.goals_for}</td>
                      <td className="py-2 px-3 text-center text-zinc-300">{row.goals_against}</td>
                      <td className="py-2 px-3 text-center text-zinc-300">{row.goal_difference}</td>
                      <td className="py-2 px-3 text-center font-bold text-yellow-400 text-lg">
                        {row.points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Fixtures */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">📋 Fixtures</h2>
          {fixtures?.length === 0 ? (
            <p className="text-zinc-400 text-center py-4">No fixtures generated yet.</p>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedFixtures)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([round, roundFixtures]) => (
                  <div key={round}>
                    <h3 className="font-semibold text-zinc-400 text-sm mb-2">
                      Round {round}
                    </h3>
                    <div className="space-y-2">
                      {roundFixtures.map((fixture) => (
                        <div
                          key={fixture.id}
                          className="bg-zinc-800 rounded-lg p-3 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-white font-medium">
                              {fixture.home_team?.team_name || 'TBD'}
                            </span>
                            {fixture.played ? (
                              <span className="font-bold text-yellow-400">
                                {fixture.home_score} - {fixture.away_score}
                              </span>
                            ) : (
                              <span className="text-zinc-500 text-sm">vs</span>
                            )}
                            <span className="text-white font-medium">
                              {fixture.away_team?.team_name || 'TBD'}
                            </span>
                          </div>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              fixture.played
                                ? 'bg-green-900/30 text-green-400'
                                : 'bg-zinc-700 text-zinc-400'
                            }`}
                          >
                            {fixture.played ? '✅ Played' : '⏳ Pending'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </section>

        {/* Teams */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">🏃 Teams ({teams?.length || 0})</h2>
          <div className="flex flex-wrap gap-2">
            {teams?.map((team) => (
              <span
                key={team.id}
                className="bg-zinc-800 px-3 py-1.5 rounded-full text-sm text-zinc-300"
              >
                {team.team_name}
              </span>
            ))}
            {teams?.length === 0 && (
              <p className="text-zinc-400">No teams added yet.</p>
            )}
          </div>
        </section>

        {/* Footer */}
        <div className="mt-8 text-center text-zinc-600 text-sm border-t border-zinc-800 pt-6">
          eLeague SA • {league.name} • Season {league.season || 'N/A'}
        </div>
      </div>
    </div>
  );
}