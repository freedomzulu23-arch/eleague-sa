'use client';

import { useState } from 'react';
import { saveFixtureResult } from '@/services/fixtureService';
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
      await saveFixtureResult(fixtureId, fixture.home_score, fixture.away_score);
      
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
              // Get team name (supports both 'name' and 'team_name')
              const homeName = fixture.home_team?.name || fixture.home_team?.team_name || 'TBD';
              const awayName = fixture.away_team?.name || fixture.away_team?.team_name || 'TBD';
              
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

                  {/* 📸 Screenshot Upload - Added here */}
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