import { supabase } from "../lib/supabase";
import { generateFixtures } from "../lib/fixtures";

export interface Fixture {
  id: string;
  league_id: string;
  home_team_id: string;
  away_team_id: string;
  home_score?: number;
  away_score?: number;
  round: number;
  played: boolean;
  played_at?: string;
  home_team?: { team_name: string };
  away_team?: { team_name: string };
}

// === GENERATE FIXTURES (KEPT) ===
export async function generateLeagueFixtures(leagueId: string) {
  const { data: league, error: leagueError } = await supabase
    .from("leagues")
    .select("*")
    .eq("id", leagueId)
    .single();

  if (leagueError) throw leagueError;

  if (league.fixtures_generated) {
    throw new Error("Fixtures have already been generated.");
  }

  const { data: teams, error: teamError } = await supabase
    .from("league_teams")
    .select("id, team_name")
    .eq("league_id", leagueId);

  if (teamError) throw teamError;

  if (!teams || teams.length < 2) {
    throw new Error("At least two teams are required.");
  }

  const fixtures = generateFixtures(teams, league.home_away === true);

  const rows = fixtures.map((fixture) => ({
    league_id: leagueId,
    round: fixture.round,
    home_team_id: fixture.home_team_id,
    away_team_id: fixture.away_team_id,
    home_score: 0,
    away_score: 0,
    played: false,
    match_date: null,
    match_time: null,
  }));

  const { error: insertError } = await supabase
    .from("fixtures")
    .insert(rows);

  if (insertError) throw insertError;

  const { error: updateError } = await supabase
    .from("leagues")
    .update({ fixtures_generated: true })
    .eq("id", leagueId);

  if (updateError) throw updateError;

  return true;
}

// === SAVE MATCH RESULT + UPDATE LEAGUE TABLE ===
export async function saveFixtureResult(
  fixtureId: string,
  homeScore: number,
  awayScore: number
) {
  // 1. Save the fixture result
  const { data: fixture, error: fixtureError } = await supabase
    .from('fixtures')
    .update({
      home_score: homeScore,
      away_score: awayScore,
      played: true,
      played_at: new Date().toISOString(),
    })
    .eq('id', fixtureId)
    .select()
    .single();

  if (fixtureError) throw new Error(`Failed to save fixture: ${fixtureError.message}`);

  // 2. Update the league table
  await updateLeagueTable(fixture.league_id);

  return fixture;
}

// === UPDATE LEAGUE TABLE ===
async function updateLeagueTable(leagueId: string) {
  try {
    // Get all played fixtures
    const { data: fixtures, error: fixturesError } = await supabase
      .from('fixtures')
      .select('home_team_id, away_team_id, home_score, away_score')
      .eq('league_id', leagueId)
      .eq('played', true);

    if (fixturesError) throw fixturesError;

    // Get all teams
    const { data: teams, error: teamsError } = await supabase
      .from('league_teams')
      .select('id, team_name')
      .eq('league_id', leagueId);

    if (teamsError) throw teamsError;

    // Calculate stats
    const stats: any = {};
    
    teams?.forEach((team: any) => {
      stats[team.id] = {
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
      };
    });

    fixtures?.forEach((f: any) => {
      const home = stats[f.home_team_id];
      const away = stats[f.away_team_id];
      
      if (!home || !away) return;

      const hg = f.home_score || 0;
      const ag = f.away_score || 0;

      home.goals_for += hg;
      home.goals_against += ag;
      away.goals_for += ag;
      away.goals_against += hg;

      if (hg > ag) {
        home.won += 1;
        home.points += 3;
        away.lost += 1;
      } else if (hg < ag) {
        away.won += 1;
        away.points += 3;
        home.lost += 1;
      } else {
        home.drawn += 1;
        home.points += 1;
        away.drawn += 1;
        away.points += 1;
      }

      home.played += 1;
      away.played += 1;
    });

    // Calculate goal difference
    Object.values(stats).forEach((s: any) => {
      s.goal_difference = s.goals_for - s.goals_against;
    });

    // Save to league_table
    for (const [teamId, stat] of Object.entries(stats)) {
      const { error: upsertError } = await supabase
        .from('league_table')
        .upsert({
          league_id: leagueId,
          team_id: (stat as any).team_id,
          team_name: (stat as any).team_name,
          played: (stat as any).played,
          won: (stat as any).won,
          drawn: (stat as any).drawn,
          lost: (stat as any).lost,
          goals_for: (stat as any).goals_for,
          goals_against: (stat as any).goals_against,
          goal_difference: (stat as any).goal_difference,
          points: (stat as any).points,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'league_id, team_id'
        });

      if (upsertError) throw upsertError;
    }

  } catch (error) {
    console.error('Error updating league table:', error);
    throw error;
  }
}

// === GET FIXTURES ===
export async function getFixturesByLeague(leagueId: string): Promise<Fixture[]> {
  const { data, error } = await supabase
    .from('fixtures')
    .select(`
      *,
      home_team:league_teams!home_team_id(team_name),
      away_team:league_teams!away_team_id(team_name)
    `)
    .eq('league_id', leagueId)
    .order('round', { ascending: true });

  if (error) throw new Error(`Failed to fetch fixtures: ${error.message}`);
  return data || [];
}