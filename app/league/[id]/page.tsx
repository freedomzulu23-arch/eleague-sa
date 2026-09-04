'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../../lib/supabaseClient';
import DeleteModal from '@/app/components/DeleteModal';
import { exportLeagueTable, exportFixtures, exportPlayerStats } from '@/services/exportService';

// League Table Component
function LeagueTable({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-4 rounded shadow text-center text-gray-500">
        No matches played yet.
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded shadow overflow-x-auto">
      <h2 className="text-lg font-bold mb-3 text-black">📊 League Table</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2 px-2 text-gray-600">#</th>
            <th className="text-left py-2 px-2 text-gray-600">Team</th>
            <th className="text-center py-2 px-2 text-gray-600">P</th>
            <th className="text-center py-2 px-2 text-gray-600">W</th>
            <th className="text-center py-2 px-2 text-gray-600">D</th>
            <th className="text-center py-2 px-2 text-gray-600">L</th>
            <th className="text-center py-2 px-2 text-gray-600">GF</th>
            <th className="text-center py-2 px-2 text-gray-600">GA</th>
            <th className="text-center py-2 px-2 text-gray-600">GD</th>
            <th className="text-center py-2 px-2 font-bold text-gray-800">Pts</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={row.id} className="border-b hover:bg-gray-50">
              <td className="py-2 px-2 font-medium">{index + 1}</td>
              <td className="py-2 px-2 font-medium">{row.team_name}</td>
              <td className="py-2 px-2 text-center">{row.played}</td>
              <td className="py-2 px-2 text-center text-green-600">{row.won}</td>
              <td className="py-2 px-2 text-center text-yellow-600">{row.drawn}</td>
              <td className="py-2 px-2 text-center text-red-600">{row.lost}</td>
              <td className="py-2 px-2 text-center">{row.goals_for}</td>
              <td className="py-2 px-2 text-center">{row.goals_against}</td>
              <td className="py-2 px-2 text-center">{row.goal_difference}</td>
              <td className="py-2 px-2 text-center font-bold text-lg">{row.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function LeaguePage() {
  const params = useParams();
  const router = useRouter();
  const leagueId = params.id as string;
  
  const [league, setLeague] = useState<any>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [fixturesCount, setFixturesCount] = useState(0);
  const [playedCount, setPlayedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [leagueTable, setLeagueTable] = useState<any[]>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get league info
      const { data: leagueData, error: leagueError } = await supabase
        .from('leagues')
        .select('*')
        .eq('id', leagueId)
        .maybeSingle();

      if (leagueError) {
        console.error('Error fetching league:', leagueError);
        throw new Error('League not found: ' + leagueError.message);
      }

      if (!leagueData) {
        setError('League not found. It may have been deleted.');
        setLoading(false);
        return;
      }

      setLeague(leagueData);

      // Get teams
      const { data: teamsData, error: teamsError } = await supabase
        .from('league_teams')
        .select('*')
        .eq('league_id', leagueId);
      
      if (teamsError) throw new Error('Failed to load teams: ' + teamsError.message);
      setTeams(teamsData || []);

      // Get fixtures count
      const { count, error: countError } = await supabase
        .from('fixtures')
        .select('*', { count: 'exact', head: true })
        .eq('league_id', leagueId);
      
      if (countError) throw new Error('Failed to load fixtures count: ' + countError.message);
      setFixturesCount(count || 0);

      // Get played matches count
      const { count: playedCount, error: playedError } = await supabase
        .from('fixtures')
        .select('*', { count: 'exact', head: true })
        .eq('league_id', leagueId)
        .eq('played', true);
      
      if (playedError) throw new Error('Failed to load played count: ' + playedError.message);
      setPlayedCount(playedCount || 0);

      // Get league table
      const { data: tableData, error: tableError } = await supabase
        .from('league_table')
        .select('*')
        .eq('league_id', leagueId)
        .order('points', { ascending: false })
        .order('goal_difference', { ascending: false });

      if (!tableError) {
        setLeagueTable(tableData || []);
      }

    } catch (error: any) {
      console.error('Error:', error);
      setError(error.message || 'Failed to load league');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (leagueId) loadData();
  }, [leagueId]);

  const generateFixtures = async () => {
    const { data: teamsData } = await supabase
      .from('league_teams')
      .select('id')
      .eq('league_id', leagueId);
    
    if (!teamsData || teamsData.length < 2) {
      alert('Need at least 2 teams');
      return;
    }

    await supabase
      .from('fixtures')
      .delete()
      .eq('league_id', leagueId);

    const teamIds = teamsData.map((t: any) => t.id);
    const fixtures = [];
    const totalTeams = teamIds.length;
    const rounds = totalTeams - 1;

    for (let round = 0; round < rounds; round++) {
      for (let i = 0; i < totalTeams / 2; i++) {
        const home = i;
        const away = totalTeams - 1 - i;
        if (home !== away) {
          fixtures.push({
            league_id: leagueId,
            home_team_id: teamIds[home],
            away_team_id: teamIds[away],
            round: round + 1,
            played: false,
          });
        }
      }
      teamIds.splice(1, 0, teamIds.pop()!);
    }

    const { error } = await supabase
      .from('fixtures')
      .insert(fixtures);

    if (error) {
      alert('Failed to generate fixtures');
    } else {
      alert(`Generated ${fixtures.length} fixtures!`);
      loadData();
    }
  };

  const handleDeleteLeague = async () => {
    setDeleting(true);
    try {
      await supabase.from('fixtures').delete().eq('league_id', leagueId);
      await supabase.from('league_teams').delete().eq('league_id', leagueId);
      const { error } = await supabase
        .from('leagues')
        .delete()
        .eq('id', leagueId);

      if (error) throw error;

      router.push('/');
    } catch (error) {
      console.error('Error deleting league:', error);
      alert('Failed to delete league');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-black">Loading...</div>;
  
  if (error) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          ❌ {error}
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            ← Back to Dashboard
          </button>
          <button
            onClick={() => router.back()}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!league) return <div className="p-8 text-center text-black">League not found</div>;

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="bg-zinc-600 hover:bg-zinc-700 text-white px-3 py-1.5 rounded text-sm flex items-center gap-1 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-black">{league.name}</h1>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/public/league/${leagueId}`}
            target="_blank"
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm flex items-center gap-1 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Public View
          </Link>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-sm flex items-center gap-1 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete League
          </button>
        </div>
      </div>
      
      {/* Stats boxes */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-100 p-4 rounded text-center shadow">
          <div className="text-3xl font-bold text-black">{teams.length}</div>
          <div className="text-sm text-gray-700 font-medium">Teams</div>
        </div>
        <div className="bg-green-100 p-4 rounded text-center shadow">
          <div className="text-3xl font-bold text-black">{fixturesCount}</div>
          <div className="text-sm text-gray-700 font-medium">Fixtures</div>
        </div>
        <div className="bg-yellow-100 p-4 rounded text-center shadow">
          <div className="text-3xl font-bold text-black">{playedCount}</div>
          <div className="text-sm text-gray-700 font-medium">Matches Played</div>
        </div>
      </div>

      {/* Teams list */}
      {teams.length > 0 && (
        <div className="mb-6 bg-white p-4 rounded shadow">
          <h2 className="text-lg font-bold mb-3 text-black">Teams ({teams.length})</h2>
          <div className="flex flex-wrap gap-2">
            {teams.map((team) => (
              <span key={team.id} className="bg-gray-200 px-3 py-1 rounded text-black">
                {team.team_name || team.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* League Table */}
      {leagueTable && leagueTable.length > 0 && (
        <div className="mb-6">
          <LeagueTable data={leagueTable} />
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-4 flex-wrap">
        <Link 
          href={`/league/${leagueId}/add-team`}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          + Add Team
        </Link>
        
        <Link 
          href={`/league/${leagueId}/fixtures`}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          View Fixtures
        </Link>
        
        <button 
          onClick={generateFixtures}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
        >
          Generate Fixtures
        </button>

        <Link 
          href={`/league/${leagueId}/stats`}
          className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded"
        >
          📊 Player Stats
        </Link>

        {/* Export Buttons */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => exportLeagueTable(leagueId, league.name)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded"
          >
            📥 League Table
          </button>
          <button
            onClick={() => exportFixtures(leagueId, league.name)}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded"
          >
            📥 Fixtures
          </button>
          <button
            onClick={() => exportPlayerStats(leagueId, league.name)}
            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded"
          >
            📥 Player Stats
          </button>
        </div>
      </div>

      {/* Delete Modal */}
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteLeague}
        loading={deleting}
        title="Delete League?"
        message={`Are you sure you want to delete "${league.name}"? This will also delete all fixtures and team associations. This action cannot be undone.`}
      />
    </div>
  );
}