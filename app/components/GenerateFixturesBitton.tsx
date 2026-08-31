'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface GenerateFixturesButtonProps {
  leagueId: string;
  onFixturesGenerated?: () => void;
}

export default function GenerateFixturesButton({ 
  leagueId, 
  onFixturesGenerated 
}: GenerateFixturesButtonProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const generateFixtures = async () => {
    setLoading(true);
    setMessage('');

    try {
      // 1. Get all teams in this league
      const { data: teams, error: teamsError } = await supabase
        .from('league_teams')
        .select('id, name')
        .eq('league_id', leagueId);

      if (teamsError) throw teamsError;
      
      if (!teams || teams.length < 2) {
        setMessage('⚠️ Need at least 2 teams to generate fixtures');
        setLoading(false);
        return;
      }

      // 2. Delete existing fixtures for this league
      const { error: deleteError } = await supabase
        .from('fixtures')
        .delete()
        .eq('league_id', leagueId);

      if (deleteError) throw deleteError;

      // 3. Generate round-robin fixtures
      const teamIds = teams.map(t => t.id);
      const totalTeams = teamIds.length;
      const fixtures = [];

      // If odd number of teams, add a "bye" team
      let teamsWithBye = [...teamIds];
      if (totalTeams % 2 !== 0) {
        teamsWithBye.push('bye');
      }

      const numRounds = teamsWithBye.length - 1;
      const halfSize = teamsWithBye.length / 2;

      for (let round = 0; round < numRounds; round++) {
        for (let i = 0; i < halfSize; i++) {
          const home = i;
          const away = teamsWithBye.length - 1 - i;
          
          // Skip if either team is "bye"
          if (teamsWithBye[home] !== 'bye' && teamsWithBye[away] !== 'bye') {
            fixtures.push({
              league_id: leagueId,
              home_team_id: teamsWithBye[home],
              away_team_id: teamsWithBye[away],
              round: round + 1,
              played: false,
              home_score: null,
              away_score: null,
            });
          }
        }
        // Rotate teams (keep first fixed)
        const last = teamsWithBye.pop()!;
        teamsWithBye.splice(1, 0, last);
      }

      // 4. Insert fixtures
      const { error: insertError } = await supabase
        .from('fixtures')
        .insert(fixtures);

      if (insertError) throw insertError;

      setMessage(`✅ Generated ${fixtures.length} fixtures across ${numRounds} rounds!`);
      
      // Refresh the page data
      if (onFixturesGenerated) {
        onFixturesGenerated();
      } else {
        window.location.reload();
      }

    } catch (error: any) {
      console.error('Error generating fixtures:', error);
      setMessage(`❌ Failed to generate fixtures: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-4">
      <button
        onClick={generateFixtures}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold transition"
      >
        {loading ? '⏳ Generating...' : '⚽ Generate Fixtures'}
      </button>
      {message && (
        <p className={`mt-2 ${message.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </p>
      )}
    </div>
  );
}