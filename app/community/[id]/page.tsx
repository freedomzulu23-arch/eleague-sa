"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function CommunityPage() {
  const params = useParams();

  const [community, setCommunity] = useState<any>(null);
  const [memberCount, setMemberCount] = useState(0);
  const [members, setMembers] = useState<any[]>([]);
  const [leagues, setLeagues] = useState<any[]>([]);

  useEffect(() => {
    const loadCommunity = async () => {
      const { data, error } = await supabase
        .from("communities")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error) {
        console.error(error);
        return;
      }

      setCommunity(data);

      const { data: memberData, error: memberError } = await supabase
        .from("community_members")
        .select(
          `
          role,
          profiles (
            full_name,
            username
          )
        `
        )
        .eq("community_id", params.id);

      if (memberError) {
        console.error(memberError);
      } else {
        setMembers(memberData || []);
        setMemberCount(memberData?.length || 0);
      }

      const { data: leagueData, error: leagueError } = await supabase
        .from("leagues")
        .select("*")
        .eq("community_id", params.id);

      if (leagueError) {
        console.error(leagueError);
      } else {
        setLeagues(leagueData || []);
      }
    };

    loadCommunity();
  }, [params]);

  if (!community) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        Loading...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-5xl mx-auto">

        <h1 className="text-4xl font-bold text-green-500">
          {community.name}
        </h1>

        <p className="text-zinc-400 mt-3">
          {community.description}
        </p>

        <div className="mt-6 mb-8">
          <Link
            href={`/community/${community.id}/create-league`}
            className="inline-block bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-bold"
          >
            🏆 Create League
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-6 mt-10">

          <div className="bg-zinc-900 p-6 rounded-xl text-center">
            <h2 className="text-3xl font-bold">{memberCount}</h2>
            <p>Members</p>
          </div>

          <div className="bg-zinc-900 p-6 rounded-xl text-center">
            <h2 className="text-3xl font-bold">{leagues.length}</h2>
            <p>Leagues</p>
          </div>

          <div className="bg-zinc-900 p-6 rounded-xl text-center">
            <h2 className="text-3xl font-bold">0</h2>
            <p>Cups</p>
          </div>

        </div>

        <div className="mt-12">

          <h2 className="text-2xl font-bold mb-5">
            Community Members
          </h2>

          {members.length === 0 ? (
            <p className="text-zinc-400">
              No members yet.
            </p>
          ) : (
            <div className="space-y-4">

              {members.map((member: any, index) => (
                <div
                  key={index}
                  className="bg-zinc-900 rounded-xl p-5 flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-bold text-lg">
                      👤 {member.profiles?.full_name}
                    </h3>

                    <p className="text-zinc-400">
                      @{member.profiles?.username}
                    </p>
                  </div>

                  <span className="bg-green-600 px-4 py-2 rounded-lg font-bold">
                    {member.role}
                  </span>
                </div>
              ))}

            </div>
          )}

        </div>

        <div className="mt-12">

          <h2 className="text-2xl font-bold mb-5">
            Community Leagues
          </h2>

          {leagues.length === 0 ? (
            <p className="text-zinc-400">
              No leagues created yet.
            </p>
          ) : (
            <div className="space-y-4">

              {leagues.map((league: any) => (
                <Link
                  key={league.id}
                  href={`/league/${league.id}`}
                  className="block bg-zinc-900 rounded-xl p-5 border border-zinc-800 hover:border-green-500 hover:bg-zinc-800 transition"
                >
                  <h3 className="text-xl font-bold text-green-400">
                    🏆 {league.name}
                  </h3>

                  <p className="text-zinc-400 mt-2">
                    Season: {league.season}
                  </p>

                  <p className="text-zinc-500">
                    Maximum Teams: {league.max_teams}
                  </p>

                  <p className="text-zinc-500">
                    Home & Away: {league.home_away ? "Yes" : "No"}
                  </p>

                  <p className="text-zinc-500">
                    Points for Win: {league.points_for_win}
                  </p>
                </Link>
              ))}

            </div>
          )}

        </div>

      </div>
    </main>
  );
}