export type Team = {
  id: string;
  team_name: string;
};

export type Fixture = {
  round: number;
  home_team_id: string;
  away_team_id: string;
};

export function generateFixtures(
  teams: Team[],
  homeAway: boolean
): Fixture[] {
  if (teams.length < 2) return [];

  let teamList = [...teams];

  // Add a BYE team if odd number of teams
  if (teamList.length % 2 !== 0) {
    teamList.push({
      id: "BYE",
      team_name: "BYE",
    });
  }

  const totalTeams = teamList.length;
  const rounds = totalTeams - 1;
  const fixtures: Fixture[] = [];

  let rotation = [...teamList];

  for (let round = 1; round <= rounds; round++) {
    for (let i = 0; i < totalTeams / 2; i++) {
      const home = rotation[i];
      const away = rotation[totalTeams - 1 - i];

      if (home.id !== "BYE" && away.id !== "BYE") {
        fixtures.push({
          round,
          home_team_id: home.id,
          away_team_id: away.id,
        });
      }
    }

    const fixed = rotation[0];
    const rest = rotation.slice(1);

    rest.unshift(rest.pop()!);

    rotation = [fixed, ...rest];
  }

  if (homeAway) {
    const secondHalf = fixtures.map((fixture) => ({
      round: fixture.round + rounds,
      home_team_id: fixture.away_team_id,
      away_team_id: fixture.home_team_id,
    }));

    fixtures.push(...secondHalf);
  }

  return fixtures;
}