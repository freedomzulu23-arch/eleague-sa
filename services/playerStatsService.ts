import { supabase } from '@/lib/supabaseClient';

export interface Player {
  id: string;
  team_id: string;
  name: string;
  position?: string;
  jersey_number?: number;
  team_name?: string;
}

export interface PlayerStats {
  id: string;
  player_id: string;
  league_id: string;
  season: string;
  appearances: number;
  goals: number;
  assists: number;
  yellow_cards: number;
  red_cards: number;
  man_of_match: number;
  player?: Player;
}

export async function getPlayersByLeague(leagueId: string): Promise<Player[]> {
  const { data, error } = await supabase
    .from('players')
    .select(`
      *,
      team:league_teams!team_id(team_name)
    `)
    .eq('team.league_id', leagueId)
    .order('name', { ascending: true });

  if (error) throw new Error(`Failed to load players: ${error.message}`);
  return data || [];
}

export async function getPlayerStats(leagueId: string, season: string = '2026'): Promise<PlayerStats[]> {
  const { data, error } = await supabase
    .from('player_stats')
    .select(`
      *,
      player:players(
        *,
        team:league_teams!team_id(team_name)
      )
    `)
    .eq('league_id', leagueId)
    .eq('season', season)
    .order('goals', { ascending: false });

  if (error) throw new Error(`Failed to load player stats: ${error.message}`);
  return data || [];
}

export async function getTopScorers(leagueId: string, season: string = '2026', limit: number = 10) {
  const stats = await getPlayerStats(leagueId, season);
  return stats
    .filter(s => s.goals > 0)
    .slice(0, limit)
    .map(s => ({
      ...s,
      player: s.player,
      goals: s.goals,
      team_name: s.player?.team?.team_name || 'Unknown'
    }));
}

export async function addPlayer(teamId: string, name: string, position?: string, jerseyNumber?: number) {
  const { data, error } = await supabase
    .from('players')
    .insert({
      team_id: teamId,
      name: name.trim(),
      position: position || null,
      jersey_number: jerseyNumber || null,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to add player: ${error.message}`);
  return data;
}

export async function updatePlayerStats(
  playerId: string,
  leagueId: string,
  season: string,
  stats: Partial<PlayerStats>
) {
  const { data, error } = await supabase
    .from('player_stats')
    .upsert({
      player_id: playerId,
      league_id: leagueId,
      season: season,
      ...stats,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'player_id, league_id, season'
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to update player stats: ${error.message}`);
  return data;
}

export async function recordMatchEvent(
  matchId: string,
  playerId: string,
  eventType: string,
  minute?: number
) {
  const { data, error } = await supabase
    .from('match_events')
    .insert({
      match_id: matchId,
      player_id: playerId,
      event_type: eventType,
      minute: minute || null,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to record match event: ${error.message}`);
  return data;
}