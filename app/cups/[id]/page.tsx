'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import DeleteModal from '@/app/components/DeleteModal';

export default function CupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const cupId = params.id as string;

  const [cup, setCup] = useState<any>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [availableTeams, setAvailableTeams] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingTeam, setAddingTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [showCustomTeam, setShowCustomTeam] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔵 Loading cup data for:', cupId);

      // Get cup details - using maybeSingle() instead of single()
      const { data: cupData, error: cupError } = await supabase
        .from('cups')
        .select('*')
        .eq('id', cupId)
        .maybeSingle();

      if (cupError) {
        console.error('Error fetching cup:', cupError);
        throw new Error('Cup not found: ' + cupError.message);
      }

      if (!cupData) {
        setError('Cup not found. It may have been deleted.');
        setLoading(false);
        return;
      }

      setCup(cupData);

      // Get cup teams
      const { data: teamsData, error: teamsError } = await supabase
        .from('cup_teams')
        .select('*')
        .eq('cup_id', cupId);

      if (teamsError) throw new Error('Failed to load teams: ' + teamsError.message);
      setTeams(teamsData || []);

      // Get cup matches with proper ordering
      const { data: matchesData, error: matchesError } = await supabase
        .from('cup_matches')
        .select('*')
        .eq('cup_id', cupId)
        .order('round', { ascending: true });

      if (matchesError) throw new Error('Failed to load matches: ' + matchesError.message);
      setMatches(matchesData || []);
      console.log('✅ Matches loaded:', matchesData);

      // If season cup, load league teams
      if (cupData.cup_mode === 'season' && cupData.league_id) {
        const { data: leagueTeams, error: leagueTeamsError } = await supabase
          .from('league_teams')
          .select('id, team_name')
          .eq('league_id', cupData.league_id);

        if (!leagueTeamsError) {
          const existingIds = new Set(teamsData?.map((t: any) => t.id) || []);
          const available = leagueTeams?.filter((t: any) => !existingIds.has(t.id)) || [];
          setAvailableTeams(available);
        }
      } else {
        setAvailableTeams([]);
      }

    } catch (error: any) {
      console.error('Error loading cup:', error);
      setError(error.message || 'Failed to load cup');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cupId) loadData();
  }, [cupId, refreshKey]);

  const addCustomTeam = async () => {
    if (!newTeamName.trim()) {
      alert('Please enter a team name');
      return;
    }

    setAddingTeam(true);
    try {
      const { data, error } = await supabase
        .from('cup_teams')
        .insert({
          cup_id: cupId,
          team_name: newTeamName.trim(),
        })
        .select()
        .single();

      if (error) throw error;

      setTeams([...teams, { id: data.id, team_name: newTeamName.trim() }]);
      setNewTeamName('');
      setShowCustomTeam(false);
      setRefreshKey(prev => prev + 1);

    } catch (error: any) {
      console.error('Error adding team:', error);
      alert('Failed to add team: ' + error.message);
    } finally {
      setAddingTeam(false);
    }
  };

  const addTeamFromLeague = async (teamId: string) => {
    if (!teamId) return;
    setAddingTeam(true);
    try {
      const team = availableTeams.find(t => t.id === teamId);
      if (!team) throw new Error('Team not found');

      const { data, error } = await supabase
        .from('cup_teams')
        .insert({
          cup_id: cupId,
          team_name: team.team_name,
        })
        .select()
        .single();

      if (error) throw error;

      setTeams([...teams, { id: data.id, team_name: team.team_name }]);
      setAvailableTeams(availableTeams.filter(t => t.id !== teamId));
      setRefreshKey(prev => prev + 1);

    } catch (error: any) {
      console.error('Error adding team:', error);
      alert('Failed to add team: ' + error.message);
    } finally {
      setAddingTeam(false);
    }
  };

  const generateBracket = async () => {
    if (teams.length < 2) {
      alert('Need at least 2 teams');
      return;
    }

    try {
      const matchesToInsert = [];
      let teamIds = teams.map(t => t.id);
      
      // Shuffle teams
      for (let i = teamIds.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [teamIds[i], teamIds[j]] = [teamIds[j], teamIds[i]];
      }

      let roundName = '';
      if (teamIds.length === 2) roundName = 'final';
      else if (teamIds.length === 4) roundName = 'semi-final';
      else if (teamIds.length >= 8) roundName = 'quarter-final';
      else roundName = 'first-round';

      for (let i = 0; i < teamIds.length; i += 2) {
        if (i + 1 < teamIds.length) {
          matchesToInsert.push({
            cup_id: cupId,
            round: roundName,
            home_team_id: teamIds[i],
            away_team_id: teamIds[i + 1],
            home_score: 0,
            away_score: 0,
            played: false,
          });
        }
      }

      if (matchesToInsert.length === 0) {
        alert('Not enough teams to create matches');
        return;
      }

      const { error } = await supabase
        .from('cup_matches')
        .insert(matchesToInsert);

      if (error) throw error;

      alert(`✅ Generated ${matchesToInsert.length} matches!`);
      setRefreshKey(prev => prev + 1);

    } catch (error: any) {
      console.error('Error generating bracket:', error);
      alert('Failed to generate bracket: ' + error.message);
    }
  };

  const handleDeleteCup = async () => {
    setDeleting(true);
    try {
      // Delete cup matches
      await supabase.from('cup_matches').delete().eq('cup_id', cupId);
      
      // Delete cup teams
      await supabase.from('cup_teams').delete().eq('cup_id', cupId);
      
      // Delete cup
      const { error } = await supabase
        .from('cups')
        .delete()
        .eq('id', cupId);

      if (error) throw error;

      router.push('/cups');
    } catch (error) {
      console.error('Error deleting cup:', error);
      alert('Failed to delete cup');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-white">Loading cup data...</div>;
  
  if (error) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded mb-4">
          ❌ {error}
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/cups')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            ← Back to Cups
          </button>
          <button
            onClick={() => router.back()}
            className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!cup) return <div className="p-8 text-center text-white">Cup not found</div>;

  // Check if all matches are played
  const allPlayed = matches.length > 0 && matches.every((m: any) => m.played);
  const pendingMatches = matches.filter((m: any) => !m.played);

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">🏆 {cup.name}</h1>
        <div className="flex gap-2 items-center">
          <span className="text-sm bg-zinc-800 px-3 py-1 rounded text-gray-300">
            {allPlayed ? '✅ Completed' : cup.status || 'draft'}
          </span>
          {cup.cup_mode === 'season' && (
            <span className="text-sm bg-blue-900/50 px-3 py-1 rounded text-blue-300">
              Season Cup
            </span>
          )}
          <button
            onClick={() => setShowDeleteModal(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-sm flex items-center gap-1 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Cup
          </button>
        </div>
      </div>

      {/* Cup Info */}
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-white">{teams.length}</div>
            <div className="text-sm text-gray-400">Teams</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{matches.length}</div>
            <div className="text-sm text-gray-400">Matches</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">
              {matches.filter((m: any) => m.played).length}
            </div>
            <div className="text-sm text-gray-400">Played</div>
          </div>
        </div>
        {allPlayed && (
          <div className="text-center mt-2 text-green-400 font-bold">
            🏆 Cup Complete!
          </div>
        )}
        {pendingMatches.length > 0 && (
          <div className="text-center mt-2 text-yellow-400 text-sm">
            {pendingMatches.length} match(es) remaining
          </div>
        )}
      </div>

      {/* Teams Section */}
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-bold text-white mb-3">Teams ({teams.length})</h2>
        
        <div className="flex flex-wrap gap-2 mb-3">
          {teams.map((team) => (
            <span key={team.id} className="bg-zinc-800 px-3 py-1 rounded text-gray-300">
              {team.team_name}
            </span>
          ))}
          {teams.length === 0 && (
            <span className="text-gray-500">No teams added yet</span>
          )}
        </div>

        {/* Add Teams - only if no matches yet */}
        {matches.length === 0 && (
          <div className="mt-3 space-y-3">
            {/* Add from league */}
            {cup.cup_mode === 'season' && availableTeams.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                <select
                  onChange={(e) => addTeamFromLeague(e.target.value)}
                  className="p-2 bg-zinc-800 border border-zinc-700 rounded text-white"
                  defaultValue=""
                  disabled={addingTeam}
                >
                  <option value="">Add from league...</option>
                  {availableTeams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.team_name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Add custom team */}
            {!showCustomTeam ? (
              <button
                onClick={() => setShowCustomTeam(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
              >
                + Add Custom Team
              </button>
            ) : (
              <div className="flex gap-2 flex-wrap">
                <input
                  type="text"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="Enter team name..."
                  className="p-2 bg-zinc-800 border border-zinc-700 rounded text-white"
                  disabled={addingTeam}
                />
                <button
                  onClick={addCustomTeam}
                  disabled={addingTeam || !newTeamName.trim()}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-zinc-700 text-white px-4 py-2 rounded"
                >
                  {addingTeam ? 'Adding...' : 'Add Team'}
                </button>
                <button
                  onClick={() => setShowCustomTeam(false)}
                  className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Generate Bracket */}
            <div className="mt-3">
              <button
                onClick={generateBracket}
                disabled={teams.length < 2}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-zinc-700 text-white px-4 py-2 rounded"
              >
                Generate Bracket ({teams.length} teams)
              </button>
              {teams.length < 2 && (
                <p className="text-sm text-gray-500 mt-1">Need at least 2 teams to generate bracket.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Matches Section */}
      {matches.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4">
          <h2 className="text-lg font-bold text-white mb-3">Matches</h2>
          
          <div className="space-y-2">
            {matches.map((match: any) => {
              const homeTeam = teams.find(t => t.id === match.home_team_id);
              const awayTeam = teams.find(t => t.id === match.away_team_id);
              
              return (
                <div key={match.id} className="bg-zinc-800 p-3 rounded flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="text-white font-medium">{homeTeam?.team_name || 'TBD'}</span>
                    <span className="text-gray-500">vs</span>
                    <span className="text-white font-medium">{awayTeam?.team_name || 'TBD'}</span>
                    <span className="text-sm text-gray-500 ml-2">({match.round})</span>
                  </div>
                  {match.played ? (
                    <span className="text-green-400 text-sm font-bold">
                      {match.home_score} - {match.away_score} ✅
                    </span>
                  ) : (
                    <span className="text-yellow-400 text-sm">⏳ Pending</span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex gap-2 flex-wrap">
            {pendingMatches.length > 0 && (
              <Link
                href={`/cups/${cupId}/matches`}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded inline-block"
              >
                Enter Match Results ({pendingMatches.length} pending)
              </Link>
            )}
            {allPlayed && (
              <div className="bg-green-900/30 text-green-400 px-4 py-2 rounded">
                🏆 All matches completed!
              </div>
            )}
            <Link
              href="/cups"
              className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded inline-block"
            >
              ← Back to Cups
            </Link>
            <button
              onClick={() => setRefreshKey(prev => prev + 1)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded inline-block"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteCup}
        loading={deleting}
        title="Delete Cup?"
        message={`Are you sure you want to delete "${cup.name}"? This will also delete all matches and team associations. This action cannot be undone.`}
      />
    </div>
  );
}