'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function PlayerStatsPage() {
  const params = useParams();
  const router = useRouter();
  const leagueId = params.id as string;

  const [league, setLeague] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [topScorers, setTopScorers] = useState<any[]>([]);
  const [topAssists, setTopAssists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerPosition, setNewPlayerPosition] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [teams, setTeams] = useState<any[]>([]);
  const [adding, setAdding] = useState(false);
  const [activeTab, setActiveTab] = useState('scorers'); // 'scorers' | 'assists' | 'all'

  const loadData = async () => {
    try {
      setLoading(true);

      // Get league info
      const { data: leagueData } = await supabase
        .from('leagues')
        .select('id, name, season')
        .eq('id', leagueId)
        .single();
      setLeague(leagueData);

      // Get teams
      const { data: teamsData } = await supabase
        .from('league_teams')
        .select('id, team_name')
        .eq('league_id', leagueId);
      setTeams(teamsData || []);

      // Get players with their teams
      const { data: playersData } = await supabase
        .from('players')
        .select(`
          *,
          team:league_teams!team_id(team_name)
        `)
        .eq('team.league_id', leagueId)
        .order('name', { ascending: true });
      setPlayers(playersData || []);

      // Get top scorers (from player_stats)
      const season = leagueData?.season || '2026';
      const { data: statsData } = await supabase
        .from('player_stats')
        .select(`
          *,
          player:players(
            *,
            team:league_teams!team_id(team_name)
          )
        `)
        .eq('league_id', leagueId)
        .eq('season', season)
        .order('goals', { ascending: false })
        .limit(20);

      setTopScorers(statsData || []);

      // Get top assists
      const { data: assistsData } = await supabase
        .from('player_stats')
        .select(`
          *,
          player:players(
            *,
            team:league_teams!team_id(team_name)
          )
        `)
        .eq('league_id', leagueId)
        .eq('season', season)
        .order('assists', { ascending: false })
        .limit(20);

      setTopAssists(assistsData || []);

    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (leagueId) loadData();
  }, [leagueId]);

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim() || !selectedTeamId) {
      alert('Please enter a player name and select a team');
      return;
    }

    setAdding(true);
    try {
      const { data, error } = await supabase
        .from('players')
        .insert({
          team_id: selectedTeamId,
          name: newPlayerName.trim(),
          position: newPlayerPosition || null,
        })
        .select()
        .single();

      if (error) throw error;

      setNewPlayerName('');
      setNewPlayerPosition('');
      setSelectedTeamId('');
      setShowAddPlayer(false);
      loadData();
      alert('✅ Player added successfully!');
    } catch (error: any) {
      alert('Failed to add player: ' + error.message);
    } finally {
      setAdding(false);
    }
  };

  // Calculate total goals and assists for display
  const totalGoals = topScorers.reduce((sum, s) => sum + (s.goals || 0), 0);
  const totalAssists = topAssists.reduce((sum, s) => sum + (s.assists || 0), 0);

  if (loading) {
    return <div className="p-8 text-center text-white">Loading player stats...</div>;
  }

  // Get the current data based on active tab
  const currentData = activeTab === 'scorers' ? topScorers : 
                      activeTab === 'assists' ? topAssists : 
                      topScorers;

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">📊 Player Statistics</h1>
          <p className="text-gray-400 text-sm">{league?.name} - {league?.season || '2026'}</p>
        </div>
        <Link
          href={`/league/${leagueId}`}
          className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded text-sm"
        >
          ← Back to League
        </Link>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-white">{players.length}</div>
          <div className="text-xs text-gray-400">Total Players</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-yellow-400">{totalGoals}</div>
          <div className="text-xs text-gray-400">Total Goals</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-400">{totalAssists}</div>
          <div className="text-xs text-gray-400">Total Assists</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-400">{teams.length}</div>
          <div className="text-xs text-gray-400">Teams</div>
        </div>
      </div>

      {/* Top Scorers / Assists */}
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center mb-3">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('scorers')}
              className={`px-3 py-1 rounded text-sm ${
                activeTab === 'scorers' 
                  ? 'bg-yellow-600 text-white' 
                  : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700'
              }`}
            >
              ⚽ Top Scorers
            </button>
            <button
              onClick={() => setActiveTab('assists')}
              className={`px-3 py-1 rounded text-sm ${
                activeTab === 'assists' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700'
              }`}
            >
              🎯 Top Assists
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded text-sm ${
                activeTab === 'all' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700'
              }`}
            >
              📋 All Players
            </button>
          </div>
          <button
            onClick={() => setShowAddPlayer(!showAddPlayer)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
          >
            + Add Player
          </button>
        </div>

        {/* Add Player Form */}
        {showAddPlayer && (
          <form onSubmit={handleAddPlayer} className="bg-zinc-800 p-4 rounded-lg mb-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input
                type="text"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                placeholder="Player name..."
                className="p-2 bg-zinc-700 border border-zinc-600 rounded text-white"
                required
              />
              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="p-2 bg-zinc-700 border border-zinc-600 rounded text-white"
                required
              >
                <option value="">Select team...</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>{t.team_name}</option>
                ))}
              </select>
              <select
                value={newPlayerPosition}
                onChange={(e) => setNewPlayerPosition(e.target.value)}
                className="p-2 bg-zinc-700 border border-zinc-600 rounded text-white"
              >
                <option value="">Position (optional)</option>
                <option value="GK">GK</option>
                <option value="DEF">DEF</option>
                <option value="MID">MID</option>
                <option value="FWD">FWD</option>
              </select>
              <button
                type="submit"
                disabled={adding}
                className="bg-green-600 hover:bg-green-700 disabled:bg-zinc-600 text-white px-4 py-2 rounded"
              >
                {adding ? 'Adding...' : 'Add Player'}
              </button>
            </div>
          </form>
        )}

        {/* Stats Table */}
        {currentData.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>No stats recorded yet.</p>
            <p className="text-sm mt-1">Add players and enter match results to see stats.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-700">
                  <th className="text-left py-2 px-3 text-gray-400">#</th>
                  <th className="text-left py-2 px-3 text-gray-400">Player</th>
                  <th className="text-left py-2 px-3 text-gray-400">Team</th>
                  <th className="text-center py-2 px-3 text-gray-400">Position</th>
                  {activeTab === 'scorers' && (
                    <th className="text-center py-2 px-3 text-yellow-400 font-bold">⚽ Goals</th>
                  )}
                  {activeTab === 'assists' && (
                    <th className="text-center py-2 px-3 text-blue-400">🎯 Assists</th>
                  )}
                  {(activeTab === 'all') && (
                    <>
                      <th className="text-center py-2 px-3 text-yellow-400">⚽ Goals</th>
                      <th className="text-center py-2 px-3 text-blue-400">🎯 Assists</th>
                    </>
                  )}
                  <th className="text-center py-2 px-3 text-gray-400">Appearances</th>
                  <th className="text-center py-2 px-3 text-gray-400">Avg</th>
                </tr>
              </thead>
              <tbody>
                {currentData.map((stat, index) => (
                  <tr key={stat.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                    <td className="py-2 px-3 text-white">
                      {index + 1}
                      {index === 0 && activeTab !== 'all' && ' 🥇'}
                      {index === 1 && activeTab !== 'all' && ' 🥈'}
                      {index === 2 && activeTab !== 'all' && ' 🥉'}
                    </td>
                    <td className="py-2 px-3 text-white font-medium">
                      {stat.player?.name || 'Unknown'}
                    </td>
                    <td className="py-2 px-3 text-gray-300">
                      {stat.player?.team?.team_name || stat.team_name || 'Unknown'}
                    </td>
                    <td className="py-2 px-3 text-center text-gray-300">
                      {stat.player?.position || '-'}
                    </td>
                    {activeTab === 'scorers' && (
                      <td className="py-2 px-3 text-center text-yellow-400 font-bold text-lg">
                        {stat.goals}
                      </td>
                    )}
                    {activeTab === 'assists' && (
                      <td className="py-2 px-3 text-center text-blue-400 font-bold text-lg">
                        {stat.assists}
                      </td>
                    )}
                    {(activeTab === 'all') && (
                      <>
                        <td className="py-2 px-3 text-center text-yellow-400">
                          {stat.goals}
                        </td>
                        <td className="py-2 px-3 text-center text-blue-400">
                          {stat.assists}
                        </td>
                      </>
                    )}
                    <td className="py-2 px-3 text-center text-gray-300">
                      {stat.appearances || 0}
                    </td>
                    <td className="py-2 px-3 text-center text-gray-300">
                      {stat.appearances > 0 
                        ? (stat.goals / stat.appearances).toFixed(2) 
                        : '0.00'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* All Players List */}
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4">
        <h2 className="text-lg font-bold text-white mb-3">All Players ({players.length})</h2>
        <div className="flex flex-wrap gap-2">
          {players.map((player) => (
            <span key={player.id} className="bg-zinc-800 px-3 py-1 rounded text-gray-300 text-sm">
              {player.name} 
              {player.position && <span className="text-gray-500 ml-1">({player.position})</span>}
              <span className="text-gray-600 ml-1">- {player.team?.team_name}</span>
            </span>
          ))}
          {players.length === 0 && (
            <span className="text-gray-500">No players added yet.</span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-6 flex gap-2 flex-wrap">
        <Link
          href={`/league/${leagueId}`}
          className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded"
        >
          ← Back to League
        </Link>
        <Link
          href={`/league/${leagueId}/fixtures`}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          📋 Fixtures
        </Link>
      </div>
    </div>
  );
}