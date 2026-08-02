"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function LeaguePage() {
  const params = useParams();

  const [league, setLeague] = useState<any>(null);
  const [teams, setTeams] = useState<any[]>([]);

  useEffect(() => {
    const loadLeague = async () => {
      const { data: leagueData, error: leagueError } = await supabase
        .from("leagues")
        .select("*")
        .eq("id", params.id)
        .single();

      if (leagueError) {
        console.error(leagueError);
        return;
      }

      setLeague(leagueData);

      const { data: teamData, error: teamError } = await supabase
        .from("league_teams")
        .select("*")
        .eq("league_id", params.id);

      if (teamError) {
        console.error(teamError);
      } else {
        setTeams(teamData || []);
      }
    };

    loadLeague();
  }, [params]);

  if (!league) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        Loading...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-6xl mx-auto">

        <Link
          href={`/community/${league.community_id}`}
          className="text-green-400 hover:text-green-300"
        >
          ← Back to Community
        </Link>

        <h1 className="text-4xl font-bold text-green-500 mt-4">
          🏆 {league.name}
        </h1>

        <p className="text-zinc-400 mt-2">
          Season: {league.season}
        </p>

        <div className="grid grid-cols-3 gap-6 mt-10">

          <div className="bg-zinc-900 rounded-xl p-6 text-center">
            <h2 className="text-3xl font-bold">
              {teams.length}
            </h2>
            <p>Teams</p>
          </div>

          <div className="bg-zinc-900 rounded-xl p-6 text-center">
            <h2 className="text-3xl font-bold">
              0
            </h2>
            <p>Fixtures</p>
          </div>

          <div className="bg-zinc-900 rounded-xl p-6 text-center">
            <h2 className="text-3xl font-bold">
              0
            </h2>
            <p>Matches Played</p>
          </div>

        </div>

        <div className="mt-8">

          <Link
            href={`/league/${league.id}/add-team`}
            className="inline-block bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-bold"
          >
            ➕ Add Team
          </Link>

        </div>

        <div className="mt-12">

          <h2 className="text-2xl font-bold mb-5">
            League Teams
          </h2>

          {teams.length === 0 ? (
            <p className="text-zinc-400">
              No teams have been added yet.
            </p>
          ) : (
            <div className="space-y-4">

              {teams.map((team) => (
                <div
                  key={team.id}
                  className="bg-zinc-900 rounded-xl p-5 border border-zinc-800"
                >
                  <h3 className="text-xl font-bold text-green-400">
                    ⚽ {team.team_name}
                  </h3>

                  <p className="text-zinc-400 mt-2">
                    Manager: {team.manager_name}
                  </p>

                </div>
              ))}

            </div>
          )}

        </div>

      </div>
    </main>
  );
}