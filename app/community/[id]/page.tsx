"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import DeleteModal from "@/app/components/DeleteModal";

export default function CommunityPage() {
  const params = useParams();
  const router = useRouter();
  const communityId = params.id as string;

  const [community, setCommunity] = useState<any>(null);
  const [memberCount, setMemberCount] = useState(0);
  const [members, setMembers] = useState<any[]>([]);
  const [leagues, setLeagues] = useState<any[]>([]);
  const [cupsCount, setCupsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadCommunity = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get community - using maybeSingle() instead of single()
        const { data, error } = await supabase
          .from("communities")
          .select("*")
          .eq("id", communityId)
          .maybeSingle();

        if (error) {
          console.error("Error fetching community:", error);
          throw new Error("Community not found: " + error.message);
        }

        if (!data) {
          setError("Community not found. It may have been deleted.");
          setLoading(false);
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
          .eq("community_id", communityId);

        if (memberError) {
          console.error(memberError);
        } else {
          setMembers(memberData || []);
          setMemberCount(memberData?.length || 0);
        }

        const { data: leagueData, error: leagueError } = await supabase
          .from("leagues")
          .select("*")
          .eq("community_id", communityId);

        if (leagueError) {
          console.error(leagueError);
        } else {
          setLeagues(leagueData || []);
        }

        // Get cups count for this community
        const { count, error: cupsError } = await supabase
          .from("cups")
          .select("*", { count: "exact", head: true })
          .eq("community_id", communityId);

        if (!cupsError) {
          setCupsCount(count || 0);
        }

      } catch (error: any) {
        console.error("Error loading community:", error);
        setError(error.message || "Failed to load community");
      } finally {
        setLoading(false);
      }
    };

    loadCommunity();
  }, [communityId]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      // Delete all leagues in this community first
      for (const league of leagues) {
        await supabase.from("fixtures").delete().eq("league_id", league.id);
        await supabase.from("league_teams").delete().eq("league_id", league.id);
        await supabase.from("leagues").delete().eq("id", league.id);
      }

      // Delete community members
      await supabase
        .from("community_members")
        .delete()
        .eq("community_id", communityId);

      // Delete the community
      const { error } = await supabase
        .from("communities")
        .delete()
        .eq("id", communityId);

      if (error) throw error;

      router.push("/");
    } catch (error) {
      console.error("Error deleting community:", error);
      alert("Failed to delete community");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-zinc-400">Loading community...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">❌</div>
          <p className="text-xl text-red-400">{error}</p>
          <div className="mt-4 flex gap-3 justify-center">
            <button
              onClick={() => router.push("/")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
            >
              ← Back to Dashboard
            </button>
            <button
              onClick={() => router.back()}
              className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-lg transition"
            >
              Go Back
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!community) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <p className="text-zinc-400">Community not found</p>
          <Link href="/" className="text-green-400 hover:text-green-300 mt-2 inline-block">
            ← Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header with Back and Delete buttons */}
        <div className="flex items-center justify-between mb-2">
          <Link
            href="/"
            className="text-zinc-400 hover:text-white transition flex items-center gap-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Community
          </button>
        </div>

        <h1 className="text-4xl font-bold text-green-500 mt-2">
          {community.name}
        </h1>

        <p className="text-zinc-400 mt-3">
          {community.description || "No description provided."}
        </p>

        <div className="mt-6 mb-8 flex gap-3 flex-wrap">
          <Link
            href={`/community/${community.id}/create-league`}
            className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-bold transition"
          >
            🏆 Create League
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-6 mt-10">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center hover:border-green-500/50 transition">
            <h2 className="text-3xl font-bold text-white">{memberCount}</h2>
            <p className="text-zinc-400">Members</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center hover:border-blue-500/50 transition">
            <h2 className="text-3xl font-bold text-blue-400">{leagues.length}</h2>
            <p className="text-zinc-400">Leagues</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center hover:border-purple-500/50 transition">
            <h2 className="text-3xl font-bold text-purple-400">{cupsCount}</h2>
            <p className="text-zinc-400">Cups</p>
          </div>
        </div>

        {/* Members Section */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-bold text-white">
              👥 Community Members
            </h2>
            <span className="text-sm bg-zinc-800 px-3 py-1 rounded-full text-zinc-400">
              {memberCount} total
            </span>
          </div>

          {members.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
              <p className="text-4xl mb-2">👤</p>
              <p className="text-zinc-400">No members yet.</p>
              <p className="text-sm text-zinc-500 mt-1">Invite users to join this community.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {members.map((member: any, index) => (
                <div
                  key={index}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex justify-between items-center hover:border-green-500/30 transition"
                >
                  <div>
                    <h3 className="font-bold text-lg text-white">
                      👤 {member.profiles?.full_name || "Unknown User"}
                    </h3>
                    <p className="text-zinc-400 text-sm">
                      @{member.profiles?.username || "no-username"}
                    </p>
                  </div>
                  <span className={`px-4 py-1.5 rounded-lg font-bold text-sm ${
                    member.role === "admin" 
                      ? "bg-green-600/30 text-green-400 border border-green-600" 
                      : "bg-zinc-800 text-zinc-300 border border-zinc-700"
                  }`}>
                    {member.role || "member"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Leagues Section */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-bold text-white">
              🏆 Community Leagues
            </h2>
            <span className="text-sm bg-zinc-800 px-3 py-1 rounded-full text-zinc-400">
              {leagues.length} total
            </span>
          </div>

          {leagues.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
              <p className="text-4xl mb-2">🏗️</p>
              <p className="text-zinc-400">No leagues created yet.</p>
              <Link
                href={`/community/${community.id}/create-league`}
                className="text-green-400 hover:text-green-300 mt-2 inline-block"
              >
                Create your first league →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {leagues.map((league: any) => (
                <Link
                  key={league.id}
                  href={`/league/${league.id}`}
                  className="block bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-green-500 hover:bg-zinc-800/50 transition group"
                >
                  <h3 className="text-xl font-bold text-green-400 group-hover:text-green-300 transition">
                    🏆 {league.name}
                  </h3>
                  <div className="mt-2 space-y-1 text-sm">
                    <p className="text-zinc-400">
                      Season: <span className="text-white">{league.season || "N/A"}</span>
                    </p>
                    <p className="text-zinc-400">
                      Max Teams: <span className="text-white">{league.max_teams || "N/A"}</span>
                    </p>
                    <p className="text-zinc-400">
                      Home & Away: <span className="text-white">{league.home_away ? "✅ Yes" : "❌ No"}</span>
                    </p>
                  </div>
                  <div className="mt-3 text-right text-zinc-600 group-hover:text-green-400 transition">
                    View League →
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Community?"
        message={`Are you sure you want to delete "${community.name}"? This will also delete all leagues, teams, and fixtures inside it. This action cannot be undone.`}
      />
    </main>
  );
}