'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import ScreenshotUpload from '@/app/components/ScreenshotUpload';

export default function CupMatchesPage() {
  const params = useParams();
  const router = useRouter();
  const cupId = params.id as string;

  const [matches, setMatches] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get cup teams
      const { data: teamsData, error: teamsError } = await supabase
        .from('cup_teams')
        .select('*')
        .eq('cup_id', cupId);

      if (teamsError) throw new Error('Failed to load teams');
      setTeams(teamsData || []);

      // Get cup matches
      const { data: matchesData, error: matchesError } = await supabase
        .from('cup_matches')
        .select('*')
        .eq('cup_id', cupId)
        .order('round', { ascending: true });

      if (matchesError) throw new Error('Failed to load matches');
      setMatches(matchesData || []);

    } catch (error: any) {
      console.error('Error loading matches:', error);
      setError(error.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cupId) loadData();
  }, [cupId]);

  const handleSaveResult = async (matchId: string, homeScore: number, awayScore: number) => {
    if (homeScore < 0 || awayScore < 0) {
      alert('Scores cannot be negative');
      return;
    }

    setSaving(matchId);
    try {
      // Save the result
      const { error } = await supabase
        .from('cup_matches')
        .update({
          home_score: homeScore,
          away_score: awayScore,
          played: true,
          played_at: new Date().toISOString(),
        })
        .eq('id', matchId);

      if (error) throw error;

      // Update local state
      const updatedMatches = matches.map(m =>
        m.id === matchId
          ? { ...m, home_score: homeScore, away_score: awayScore, played: true }
          : m
      );
      setMatches(updatedMatches);

      // Check if this round is complete and generate next round
      await checkAndGenerateNextRound(updatedMatches);

      alert('✅ Result saved!');

    } catch (error: any) {
      console.error('Error saving result:', error);
      alert('Failed to save result: ' + (error.message || 'Unknown error'));
    } finally {
      setSaving(null);
    }
  };

  const checkAndGenerateNextRound = async (currentMatches: any[]) => {
    const playedMatches = currentMatches.filter(m => m.played);
    const unplayedMatches = currentMatches.filter(m => !m.played);

    if (unplayedMatches.length > 0) return;
    if (playedMatches.length === 0) return;

    const rounds = ['first-round', 'quarter-final', 'semi-final', 'final'];
    const currentRound = playedMatches[0]?.round;
    const currentIndex = rounds.indexOf(currentRound);

    if (currentRound === 'final') {
      await supabase
        .from('cups')
        .update({ status: 'completed' })
        .eq('id', cupId);
      return;
    }

    const nextRound = rounds[currentIndex + 1];
    if (!nextRound) return;

    const winners = playedMatches.map(m => {
      return m.home_score > m.away_score ? m.home_team_id : m.away_team_id;
    });

    const validWinners = winners.filter(w => w !== null && w !== undefined);

    if (validWinners.length < 2) {
      console.log('Not enough winners to generate next round');
      return;
    }

    const nextMatches = [];
    for (let i = 0; i < validWinners.length; i += 2) {
      if (i + 1 < validWinners.length) {
        nextMatches.push({
          cup_id: cupId,
          round: nextRound,
          home_team_id: validWinners[i],
          away_team_id: validWinners[i + 1],
          home_score: 0,
          away_score: 0,
          played: false,
        });
      }
    }

    if (nextMatches.length > 0) {
      const { error } = await supabase
        .from('cup_matches')
        .insert(nextMatches);

      if (error) throw error;
      alert(`🎯 Next round (${nextRound}) generated with ${nextMatches.length} matches!`);
      await loadData();
    }
  };

  const [tempScores, setTempScores] = useState<Record<string, { home: number; away: number }>>({});

  if (loading) {
    return <div className="p-8 text-center text-white">Loading matches...</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded mb-4">
          ❌ {error}
        </div>
        <Link href={`/cups/${cupId}`} className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded">
          ← Back to Cup
        </Link>
      </div>
    );
  }

  const allPlayed = matches.length > 0 && matches.every((m: any) => m.played);
  const pendingMatches = matches.filter((m: any) => !m.played);

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">🏆 Cup Match Results</h1>
        <Link href={`/cups/${cupId}`} className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded text-sm">
          ← Back
        </Link>
      </div>

      {matches.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p>No matches yet. Generate bracket first.</p>
          <Link href={`/cups/${cupId}`} className="text-blue-400 hover:text-blue-300 mt-2 inline-block">
            ← Back to Cup
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-gray-400">
            {allPlayed ? (
              <span className="text-green-400">✅ All matches completed!</span>
            ) : (
              <span>⏳ {pendingMatches.length} match(es) remaining</span>
            )}
          </div>

          <div className="space-y-4">
            {matches.map((match) => {
              const homeTeam = teams.find(t => t.id === match.home_team_id);
              const awayTeam = teams.find(t => t.id === match.away_team_id);
              const scores = tempScores[match.id] || { home: 0, away: 0 };

              return (
                <div key={match.id} className="bg-zinc-900 border border-zinc-700 rounded-lg p-4">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-wrap justify-center">
                      <span className="text-white font-medium">{homeTeam?.team_name || 'TBD'}</span>
                      
                      {match.played ? (
                        <span className="font-bold text-xl text-green-400">
                          {match.home_score} - {match.away_score}
                        </span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={scores.home}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 0;
                              setTempScores({
                                ...tempScores,
                                [match.id]: { ...scores, home: value }
                              });
                            }}
                            className="w-14 p-2 bg-zinc-800 border border-zinc-700 rounded text-white text-center"
                            disabled={saving === match.id}
                          />
                          <span className="text-gray-500 font-bold">VS</span>
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={scores.away}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 0;
                              setTempScores({
                                ...tempScores,
                                [match.id]: { ...scores, away: value }
                              });
                            }}
                            className="w-14 p-2 bg-zinc-800 border border-zinc-700 rounded text-white text-center"
                            disabled={saving === match.id}
                          />
                        </div>
                      )}
                      
                      <span className="text-white font-medium">{awayTeam?.team_name || 'TBD'}</span>
                      <span className="text-sm text-gray-500">({match.round})</span>
                    </div>

                    {!match.played && (
                      <button
                        onClick={() => handleSaveResult(match.id, scores.home, scores.away)}
                        disabled={saving === match.id}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-zinc-700 text-white px-4 py-2 rounded w-full md:w-auto"
                      >
                        {saving === match.id ? 'Saving...' : '✅ Save Result'}
                      </button>
                    )}

                    {match.played && (
                      <span className="text-green-400 text-sm bg-green-900/30 px-3 py-1 rounded-full">
                        ✅ Played
                      </span>
                    )}
                  </div>

                  {/* 📸 Screenshot Upload - Added here */}
                  <div className="mt-3 pt-3 border-t border-zinc-800">
                    <ScreenshotUpload 
                      matchId={match.id}
                      type="cup"
                      onUploadComplete={loadData}
                    />
                    {match.screenshot_url && (
                      <div className="mt-1">
                        <a 
                          href={match.screenshot_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-400 hover:underline"
                        >
                          📸 View Screenshot
                        </a>
                        <span className="text-xs text-gray-500 ml-2">
                          ({match.status || 'pending'})
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex gap-2 flex-wrap">
            <Link href={`/cups/${cupId}`} className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded">
              ← Back to Cup
            </Link>
            <button
              onClick={() => loadData()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              🔄 Refresh
            </button>
          </div>
        </>
      )}
    </div>
  );
}