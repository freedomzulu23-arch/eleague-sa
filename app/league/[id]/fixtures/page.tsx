'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import FixturesList from '@/app/components/FixturesList';
import LeagueTable from '@/app/components/LeagueTable';

export default function FixturesPage() {
  const params = useParams();
  const leagueId = params.id as string;
  
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [tableData, setTableData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Fetch fixtures with team names
      const { data: fixturesData, error: fixturesError } = await supabase
        .from('fixtures')
        .select(`
          *,
          home_team:league_teams!home_team_id(team_name),
          away_team:league_teams!away_team_id(team_name)
        `)
        .eq('league_id', leagueId)
        .order('round', { ascending: true });

      if (fixturesError) throw fixturesError;
      setFixtures(fixturesData || []);

      // Fetch league table
      const { data: tableData, error: tableError } = await supabase
        .from('league_table')
        .select('*')
        .eq('league_id', leagueId)
        .order('points', { ascending: false })
        .order('goal_difference', { ascending: false });

      if (tableError) throw tableError;
      setTableData(tableData || []);

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (leagueId) loadData();
  }, [leagueId]);

  if (loading) return <div className="p-8 text-center text-white">Loading fixtures...</div>;

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <h1 className="text-2xl font-bold mb-6 text-white">Fixtures & Results</h1>
      
      <div className="mb-8">
        <FixturesList 
          leagueId={leagueId}
          fixtures={fixtures}
          onResultSaved={loadData}
        />
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-bold mb-4 text-white">League Table</h2>
        <LeagueTable data={tableData} />
      </div>
    </div>
  );
}