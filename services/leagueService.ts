import { supabase } from "../lib/supabase";

interface TeamStats {
  team_id: string;
  team_name: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
}

export async function updateLeagueTable(leagueId: string) {
  try {
    // 1. Fetch all played fixtures for this league
    const { data: fixtures, error: fixturesError } = await supabase
      .from('fixtures')
      .select(`
        home_team_id,
        away_team_id,
        home_score,
        away_score,
        played
      `)
      .eq('league_id', leagueId)
      .eq('played', true);

    if (fixturesError) throw fixturesError;

    // 2. Fetch all teams in this league
    const { data: teams, error: teamsError } = await supabase
      .from('league_teams')
      .select('id, team_name')
      .eq('league_id', leagueId);

    if (teamsError) throw teamsError;

    // 3. Calculate stats for each team
    const statsMap = new Map<string, TeamStats>();

    teams?.forEach(team => {
      statsMap.set(team.id, {
        team_id: team.id,
        team_name: team.team_name,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goals_for: 0,
        goals_against: 0,
        goal_difference: 0,
        points: 0,
      });
    });

    fixtures?.forEach((fixture: any) => {
      const homeStats = statsMap.get(fixture.home_team_id);
      const awayStats = statsMap.get(fixture.away_team_id);
      
      if (!homeStats || !awayStats) return;

      const homeGoals = fixture.home_score || 0;
      const awayGoals = fixture.away_score || 0;

      // Update goals
      homeStats.goals_for += homeGoals;
      homeStats.goals_against += awayGoals;
      awayStats.goals_for += awayGoals;
      awayStats.goals_against += homeGoals;

      // Update results
      if (homeGoals > awayGoals) {
        homeStats.won += 1;
        homeStats.points += 3;
        awayStats.lost += 1;
      } else if (homeGoals < awayGoals) {
        awayStats.won += 1;
        awayStats.points += 3;
        homeStats.lost += 1;
      } else {
        homeStats.drawn += 1;
        homeStats.points += 1;
        awayStats.drawn += 1;
        awayStats.points += 1;
      }

      homeStats.played += 1;
      awayStats.played += 1;
    });

    // Calculate goal difference
    statsMap.forEach(stats => {
      stats.goal_difference = stats.goals_for - stats.goals_against;
    });

    // 4. Convert to array and sort
    const sortedStats = Array.from(statsMap.values()).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goal_difference !== a.goal_difference) return b.goal_difference - a.goal_difference;
      return b.goals_for - a.goals_for;
    });

    // 5. Upsert to league_table
    for (const stat of sortedStats) {
      const { error: upsertError } = await supabase
        .from('league_table')
        .upsert({
          league_id: leagueId,
          team_id: stat.team_id,
          team_name: stat.team_name,
          played: stat.played,
          won: stat.won,
          drawn: stat.drawn,
          lost: stat.lost,
          goals_for: stat.goals_for,
          goals_against: stat.goals_against,
          goal_difference: stat.goal_difference,
          points: stat.points,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'league_id, team_id'
        });

      if (upsertError) throw upsertError;
    }

    return sortedStats;
  } catch (error) {
    console.error('Error updating league table:', error);
    throw error;
  }
}

export async function getLeagueTable(leagueId: string) {
  const { data, error } = await supabase
    .from('league_table')
    .select('*')
    .eq('league_id', leagueId)
    .order('points', { ascending: false })
    .order('goal_difference', { ascending: false })
    .order('goals_for', { ascending: false });

  if (error) throw new Error(`Failed to fetch league table: ${error.message}`);
  return data || [];
}