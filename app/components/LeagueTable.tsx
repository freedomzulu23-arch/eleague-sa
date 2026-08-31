interface LeagueTableProps {
  data: Array<{
    team_name: string;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goals_for: number;
    goals_against: number;
    goal_difference: number;
    points: number;
  }>;
}

export default function LeagueTable({ data }: LeagueTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No matches played yet. League table will appear once results are entered.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-zinc-700 rounded-lg">
      <table className="w-full text-sm">
        <thead className="bg-zinc-800">
          <tr>
            <th className="p-3 text-left text-white">#</th>
            <th className="p-3 text-left text-white">Team</th>
            <th className="p-3 text-center text-white">P</th>
            <th className="p-3 text-center text-white">W</th>
            <th className="p-3 text-center text-white">D</th>
            <th className="p-3 text-center text-white">L</th>
            <th className="p-3 text-center text-white">GF</th>
            <th className="p-3 text-center text-white">GA</th>
            <th className="p-3 text-center text-white">GD</th>
            <th className="p-3 text-center font-bold text-white">Pts</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={row.team_name} className="border-t border-zinc-700 hover:bg-zinc-800/50">
              <td className="p-3 font-medium text-white">{index + 1}</td>
              <td className="p-3 font-medium text-white">{row.team_name}</td>
              <td className="p-3 text-center text-white">{row.played}</td>
              <td className="p-3 text-center text-green-400">{row.won}</td>
              <td className="p-3 text-center text-yellow-400">{row.drawn}</td>
              <td className="p-3 text-center text-red-400">{row.lost}</td>
              <td className="p-3 text-center text-white">{row.goals_for}</td>
              <td className="p-3 text-center text-white">{row.goals_against}</td>
              <td className="p-3 text-center font-medium text-white">{row.goal_difference}</td>
              <td className="p-3 text-center font-bold text-lg text-white">{row.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}