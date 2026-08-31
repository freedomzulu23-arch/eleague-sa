"use client";

import { useState } from "react";
import { saveFixtureResult } from "../../../../services/fixtureService";

type Fixture = {
  id: string;
  round: number;
  home_team_id: string;
  away_team_id: string;
  home_score: number;
  away_score: number;
  played: boolean;
  played_at?: string;
  home_team?: { team_name: string };
  away_team?: { team_name: string };
};

type Props = {
  fixtures: Fixture[];
  teams: any[];
  leagueId: string;
  onResultSaved?: () => void;
};

export default function FixturesList({ 
  fixtures, 
  teams, 
  leagueId, 
  onResultSaved 
}: Props) {
  const [saving, setSaving] = useState<string | null>(null);
  const [localFixtures, setLocalFixtures] = useState(fixtures);
  const [error, setError] = useState<string | null>(null);

  // Update local fixtures when prop changes
  useState(() => {
    setLocalFixtures(fixtures);
  }, [fixtures]);

  const handleScoreChange = (
    fixtureId: string, 
    side: 'home' | 'away', 
    value: string
  ) => {
    const numValue = value === '' ? undefined : parseInt(value, 10);
    if (numValue !== undefined && (isNaN(numValue) || numValue < 0)) return;

    setLocalFixtures(prev =>
      prev.map(f =>
        f.id === fixtureId
          ? {
              ...f,
              home_score: side === 'home' ? numValue ?? 0 : f.home_score ?? 0,
              away_score: side === 'away' ? numValue ?? 0 : f.away_score ?? 0,
            }
          : f
      )
    );
  };

  const handleSaveResult = async (fixtureId: string) => {
    const fixture = localFixtures.find(f => f.id === fixtureId);
    if (!fixture) return;
    
    if (fixture.home_score === undefined || fixture.away_score === undefined) {
      setError('Please enter both scores');
      return;
    }

    setSaving(fixtureId);
    setError(null);

    try {
      await saveFixtureResult(
        fixtureId, 
        fixture.home_score, 
        fixture.away_score
      );
      
      setLocalFixtures(prev =>
        prev.map(f =>
          f.id === fixtureId
            ? { 
                ...f, 
                played: true, 
                played_at: new Date().toISOString() 
              }
            : f
        )
      );
      
      if (onResultSaved) {
        onResultSaved();
      }
    } catch (err) {
      setError('Failed to save result. Please try again.');
      console.error(err);
    } finally {
      setSaving(null);
    }
  };

  const groupedFixtures = localFixtures.reduce((acc, fixture) => {
    const round = fixture.round || 'Unplayed';
    if (!acc[round]) acc[round] = [];
    acc[round].push(fixture);
    return acc;
  }, {} as Record<string, Fixture[]>);

  if (localFixtures.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-500">
        <p className="text-xl">No fixtures found</p>
        <p className="text-sm mt-2">Generate fixtures using the button above</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {Object.entries(groupedFixtures).map(([round, roundFixtures]) => (
        <div key={round} className="bg-zinc-900 rounded-xl overflow-hidden">
          <div className="bg-zinc-800 px-4 py-2 font-semibold text-zinc-300">
            Round {round}
          </div>
          <div className="divide-y divide-zinc-800">
            {roundFixtures.map((fixture) => {
              const homeTeam = teams.find(t => t.id === fixture.home_team_id);
              const awayTeam = teams.find(t => t.id === fixture.away_team_id);
              
              return (
                <div key={fixture.id} className="p-4 hover:bg-zinc-800/50 transition">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                      <span className="font-medium text-right w-28 truncate text-white">
                        {homeTeam?.team_name || 'TBD'}
                      </span>
                      
                      {fixture.played ? (
                        <span className="font-bold text-lg min-w-[60px] text-center text-green-400">
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
                            className="w-14 p-1.5 bg-zinc-800 border border-zinc-700 rounded text-center text-white focus:border-green-500 focus:outline-none"
                            disabled={saving === fixture.id}
                          />
                          <span className="font-bold text-zinc-500">VS</span>
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={fixture.away_score ?? ''}
                            onChange={(e) => handleScoreChange(fixture.id, 'away', e.target.value)}
                            className="w-14 p-1.5 bg-zinc-800 border border-zinc-700 rounded text-center text-white focus:border-green-500 focus:outline-none"
                            disabled={saving === fixture.id}
                          />
                        </div>
                      )}
                      
                      <span className="font-medium w-28 truncate text-white">
                        {awayTeam?.team_name || 'TBD'}
                      </span>
                    </div>

                    {!fixture.played && (
                      <button
                        onClick={() => handleSaveResult(fixture.id)}
                        disabled={
                          saving === fixture.id ||
                          fixture.home_score === undefined ||
                          fixture.away_score === undefined ||
                          fixture.home_score === null ||
                          fixture.away_score === null
                        }
                        className="bg-green-600 hover:bg-green-700 disabled:bg-zinc-700 disabled:text-zinc-500 text-white px-4 py-1.5 rounded-lg text-sm transition font-medium"
                      >
                        {saving === fixture.id ? 'Saving...' : 'Save Result'}
                      </button>
                    )}
                    
                    {fixture.played && (
                      <span className="text-sm text-green-400 bg-green-900/30 px-3 py-1 rounded-full">
                        ✓ Played
                      </span>
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