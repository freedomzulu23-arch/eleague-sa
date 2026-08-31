import { supabase } from '@/lib/supabaseClient';

// Helper to convert data to CSV
function convertToCSV(data: any[], headers: string[]): string {
  const rows = data.map(row => {
    return headers.map(header => {
      const value = row[header] || '';
      // Handle commas and quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',');
  });
  
  const headerRow = headers.join(',');
  return [headerRow, ...rows].join('\n');
}

// Download CSV file
function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Export League Table
export async function exportLeagueTable(leagueId: string, leagueName: string) {
  try {
    const { data: table, error } = await supabase
      .from('league_table')
      .select('*')
      .eq('league_id', leagueId)
      .order('points', { ascending: false })
      .order('goal_difference', { ascending: false });

    if (error) throw error;

    if (!table || table.length === 0) {
      alert('No data to export. League table is empty.');
      return;
    }

    const headers = ['Team', 'Played', 'Won', 'Drawn', 'Lost', 'Goals For', 'Goals Against', 'Goal Difference', 'Points'];
    const data = table.map(row => ({
      Team: row.team_name,
      Played: row.played,
      Won: row.won,
      Drawn: row.drawn,
      Lost: row.lost,
      'Goals For': row.goals_for,
      'Goals Against': row.goals_against,
      'Goal Difference': row.goal_difference,
      Points: row.points,
    }));

    const csv = convertToCSV(data, headers);
    downloadCSV(csv, `${leagueName}-League-Table.csv`);
  } catch (error) {
    console.error('Export error:', error);
    alert('Failed to export league table');
  }
}

// Export Fixtures
export async function exportFixtures(leagueId: string, leagueName: string) {
  try {
    const { data: fixtures, error } = await supabase
      .from('fixtures')
      .select(`
        *,
        home_team:league_teams!home_team_id(team_name),
        away_team:league_teams!away_team_id(team_name)
      `)
      .eq('league_id', leagueId)
      .order('round', { ascending: true });

    if (error) throw error;

    if (!fixtures || fixtures.length === 0) {
      alert('No fixtures to export.');
      return;
    }

    const headers = ['Round', 'Home Team', 'Away Team', 'Home Score', 'Away Score', 'Played', 'Date'];
    const data = fixtures.map(f => ({
      Round: f.round,
      'Home Team': f.home_team?.team_name || 'TBD',
      'Away Team': f.away_team?.team_name || 'TBD',
      'Home Score': f.played ? f.home_score : '',
      'Away Score': f.played ? f.away_score : '',
      Played: f.played ? 'Yes' : 'No',
      Date: f.played_at ? new Date(f.played_at).toLocaleDateString() : '',
    }));

    const csv = convertToCSV(data, headers);
    downloadCSV(csv, `${leagueName}-Fixtures.csv`);
  } catch (error) {
    console.error('Export error:', error);
    alert('Failed to export fixtures');
  }
}

// Export Player Stats
export async function exportPlayerStats(leagueId: string, leagueName: string) {
  try {
    const { data: stats, error } = await supabase
      .from('player_stats')
      .select(`
        *,
        player:players(
          name,
          position,
          team:league_teams!team_id(team_name)
        )
      `)
      .eq('league_id', leagueId)
      .order('goals', { ascending: false });

    if (error) throw error;

    if (!stats || stats.length === 0) {
      alert('No player stats to export.');
      return;
    }

    const headers = ['Player', 'Team', 'Position', 'Appearances', 'Goals', 'Assists', 'Yellow Cards', 'Red Cards', 'Man of Match'];
    const data = stats.map(s => ({
      Player: s.player?.name || 'Unknown',
      Team: s.player?.team?.team_name || 'Unknown',
      Position: s.player?.position || '-',
      Appearances: s.appearances || 0,
      Goals: s.goals || 0,
      Assists: s.assists || 0,
      'Yellow Cards': s.yellow_cards || 0,
      'Red Cards': s.red_cards || 0,
      'Man of Match': s.man_of_match || 0,
    }));

    const csv = convertToCSV(data, headers);
    downloadCSV(csv, `${leagueName}-Player-Stats.csv`);
  } catch (error) {
    console.error('Export error:', error);
    alert('Failed to export player stats');
  }
}

// Export Cup Matches
export async function exportCupMatches(cupId: string, cupName: string) {
  try {
    const { data: matches, error } = await supabase
      .from('cup_matches')
      .select(`
        *,
        home_team:cup_teams!home_team_id(team_name),
        away_team:cup_teams!away_team_id(team_name)
      `)
      .eq('cup_id', cupId)
      .order('round', { ascending: true });

    if (error) throw error;

    if (!matches || matches.length === 0) {
      alert('No cup matches to export.');
      return;
    }

    const headers = ['Round', 'Home Team', 'Away Team', 'Home Score', 'Away Score', 'Played'];
    const data = matches.map(m => ({
      Round: m.round || 'Unknown',
      'Home Team': m.home_team?.team_name || 'TBD',
      'Away Team': m.away_team?.team_name || 'TBD',
      'Home Score': m.played ? m.home_score : '',
      'Away Score': m.played ? m.away_score : '',
      Played: m.played ? 'Yes' : 'No',
    }));

    const csv = convertToCSV(data, headers);
    downloadCSV(csv, `${cupName}-Cup-Matches.csv`);
  } catch (error) {
    console.error('Export error:', error);
    alert('Failed to export cup matches');
  }
}