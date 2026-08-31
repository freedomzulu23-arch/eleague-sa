'use client';

import { useState, useEffect } from "react";
import { supabase } from '@/lib/supabaseClient';
import ScreenshotUpload from './ScreenshotUpload';

interface Fixture {
  id: string;
  round: number;
  home_team_id: string;
  away_team_id: string;
  home_score?: number;
  away_score?: number;
  played: boolean;
  played_at?: string;
  screenshot_url?: string;
  status?: string;
  home_team?: { name: string; team_name?: string };
  away_team?: { name: string; team_name?: string };
}

interface FixturesListProps {
  leagueId: string;
  fixtures: Fixture[];
  onResultSaved?: () => void;
}

export default function FixturesList({ leagueId, fixtures: initialFixtures, onResultSaved }: FixturesListProps) {
  const [fixtures, setFixtures] = useState(initialFixtures);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [goalScorers, setGoalScorers] = useState<Record<string, { home: string[]; away: string[] }>>({});

  // Load players for this league
  useEffect(() => {
    const loadPlayers = async () => {
      const { data } = await supabase
        .from('players')
        .select(`
          *,
          team:league_teams!team_id(id, team_name)
        `)
        .eq('team.league_id', leagueId);
      setPlayers(data || []);
    };
    loadPlayers();
  }, [leagueId]);

  const handleScoreChange = (fixtureId: string, side: 'home' | 'away', value: string) => {
    const numValue = value === '' ? undefined : parseInt(value, 10);
    if (numValue !== undefined && (isNaN(numValue) || numValue < 0)) return;

    setFixtures(prev =>
      prev.map(f =>
        f.id === fixtureId
          ? {
              ...f,
              home_score: side === 'home' ? numValue : f.home_score,
              away_score: side === 'away' ? numValue : f.away_score,
            }
          : f
      )
    );
  };

  const handleSaveResult = async (fixtureId: string) => {
    const fixture = fixtures.find(f => f.id === fixtureId);
    if (!fixture) return;
    
    if (fixture.home_score === undefined || fixture.away_score === undefined) {
      setError('Please enter both scores');
      return;
    }

    setSaving(fixtureId);
    setError(null);

    try {
      // Save the fixture result
      const { error: updateError } = await supabase
        .from('fixtures')
        .update({
          home_score: fixture.home_score,
          away_score: fixture.away_score,
          played: true,
          played_at: new Date().toISOString(),
        })
        .eq('id', fixtureId);

      if (updateError) throw updateError;

      // Save goal scorers
      const scorers = goalScorers[fixtureId] || { home: [], away: [] };
      const allScorers = [...scorers.home, ...scorers.away];
      
      for (const playerId of allScorers) {
        const { data: existingStat } = await supabase
          .from('player_stats')
          .select('*')
          .eq('player_id', playerId)
          .eq('league_id', leagueId)
          .single();

        if (existingStat) {
          await supabase
            .from('player_stats')
            .update({
              goals: existingStat.goals + 1,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingStat.id);
        } else {
          await supabase
            .from('player_stats')
            .insert({
              player_id: playerId,
              league_id: leagueId,
              season: '2026',
              goals: 1,
              appearances: 1
            });
        }
      }

      // Update appearances for all players in both teams
      const homeTeamPlayers = players.filter(p => p.team_id === fixture.home_team_id);
      const awayTeamPlayers = players.filter(p => p.team_id === fixture.away_team_id);
      
      for (const player of [...homeTeamPlayers, ...awayTeamPlayers]) {
        const { data: existingStat } = await supabase
          .from('player_stats')
          .select('*')
          .eq('player_id', player.id)
          .eq('league_id', leagueId)
          .single();

        if (existingStat) {
          await supabase
            .from('player_stats')
            .update({
              appearances: existingStat.appearances + 1,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingStat.id);
        } else {
          await supabase
            .from('player_stats')
            .insert({
              player_id: player.id,
              league_id: leagueId,
              season: '2026',
              appearances: 1
            });
        }
      }

      // Update local state
      setFixtures(prev =>
        prev.map(f =>
          f.id === fixtureId
            ? { ...f, played: true, played_at: new Date().toISOString() }
            : f
        )
      );
      
      onResultSaved?.();
    } catch (err) {
      setError('Failed to save result. Please try again.');
      console.error(err);
    } finally {
      setSaving(null);
    }
  };

  const groupedFixtures = fixtures.reduce((acc, fixture) => {
    const round = fixture.round || 'Unplayed';
    if (!acc[round]) acc[round] = [];
    acc[round].push(fixture);
    return acc;
  }, {} as Record<string, Fixture[]>);

  const getPlayersByTeam = (teamId: string) => {
    return players.filter(p => p.team_id === teamId);
  };

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {Object.entries(groupedFixtures).map(([round, roundFixtures]) => (
        <div key={round} className="border rounded-lg overflow-hidden">
          <div className="bg-gray-100 px-4 py-2 font-semibold">
            Round {round}
          </div>
          <div className="divide-y">
            {roundFixtures.map((fixture) => {
              const homeName = fixture.home_team?.name || fixture.home_team?.team_name || 'TBD';
              const awayName = fixture.away_team?.name || fixture.away_team?.team_name || 'TBD';
              const homeTeamPlayers = getPlayersByTeam(fixture.home_team_id);
              const awayTeamPlayers = getPlayersByTeam(fixture.away_team_id);
              const scorers = goalScorers[fixture.id] || { home: [], away: [] };

              return (
                <div key={fixture.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                      <span className="font-medium text-right w-28 truncate">
                        {homeName}
                      </span>
                      
                      {fixture.played ? (
                        <span className="font-bold text-lg min-w-[60px] text-center">
                          {fixture.home_score} - {fixture.away_score}
                        </span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={fixture.home_score ?? ''}
                            onChange={(e) => handleScoreChange(fixture.id, 'home', e.target.value)}
                            className="w-14 p-1 border rounded text-center"
                            disabled={saving === fixture.id}
                          />
                          <span className="font-bold">VS</span>
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={fixture.away_score ?? ''}
                            onChange={(e) => handleScoreChange(fixture.id, 'away', e.target.value)}
                            className="w-14 p-1 border rounded text-center"
                            disabled={saving === fixture.id}
                          />
                        </div>
                      )}
                      
                      <span className="font-medium w-28 truncate">
                        {awayName}
                      </span>
                    </div>

                    {!fixture.played && (
                      <button
                        onClick={() => handleSaveResult(fixture.id)}
                        disabled={
                          saving === fixture.id ||
                          fixture.home_score === undefined ||
                          fixture.away_score === undefined
                        }
                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-1.5 rounded text-sm transition"
                      >
                        {saving === fixture.id ? 'Saving...' : 'Save Result'}
                      </button>
                    )}
                    
                    {fixture.played && (
                      <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        ✓ Played
                      </span>
                    )}
                  </div>

                  {/* Goal Scorers */}
                  {!fixture.played && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">⚽ Home Scorers</p>
                          <div className="flex flex-wrap gap-1">
                            {homeTeamPlayers.map((player) => (
                              <label key={player.id} className="text-xs flex items-center gap-1 bg-gray-100 px-2 py-1 rounded cursor-pointer hover:bg-gray-200">
                                <input
                                  type="checkbox"
                                  checked={scorers.home.includes(player.id)}
                                  onChange={() => {
                                    setGoalScorers(prev => {
                                      const current = prev[fixture.id] || { home: [], away: [] };
                                      const updated = current.home.includes(player.id)
                                        ? current.home.filter(id => id !== player.id)
                                        : [...current.home, player.id];
                                      return {
                                        ...prev,
                                        [fixture.id]: { ...current, home: updated }
                                      };
                                    });
                                  }}
                                  disabled={saving === fixture.id}
                                  className="w-3 h-3"
                                />
                                {player.name}
                              </label>
                            ))}
                            {homeTeamPlayers.length === 0 && (
                              <span className="text-xs text-gray-400">No players added</span>
                            )}
                          </div>
                        </div>

                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">⚽ Away Scorers</p>
                          <div className="flex flex-wrap gap-1">
                            {awayTeamPlayers.map((player) => (
                              <label key={player.id} className="text-xs flex items-center gap-1 bg-gray-100 px-2 py-1 rounded cursor-pointer hover:bg-gray-200">
                                <input
                                  type="checkbox"
                                  checked={scorers.away.includes(player.id)}
                                  onChange={() => {
                                    setGoalScorers(prev => {
                                      const current = prev[fixture.id] || { home: [], away: [] };
                                      const updated = current.away.includes(player.id)
                                        ? current.away.filter(id => id !== player.id)
                                        : [...current.away, player.id];
                                      return {
                                        ...prev,
                                        [fixture.id]: { ...current, away: updated }
                                      };
                                    });
                                  }}
                                  disabled={saving === fixture.id}
                                  className="w-3 h-3"
                                />
                                {player.name}
                              </label>
                            ))}
                            {awayTeamPlayers.length === 0 && (
                              <span className="text-xs text-gray-400">No players added</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Select players who scored</p>
                    </div>
                  )}

                  {/* Screenshot Upload */}
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <ScreenshotUpload 
                      matchId={fixture.id}
                      type="league"
                      onUploadComplete={onResultSaved}
                    />
                    {fixture.screenshot_url && (
                      <div className="mt-1">
                        <a 
                          href={fixture.screenshot_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          📸 View Screenshot
                        </a>
                        <span className="text-xs text-gray-500 ml-2">
                          ({fixture.status || 'pending'})
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}