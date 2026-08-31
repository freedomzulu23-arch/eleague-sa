"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function DashboardPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<{
    full_name: string;
    username: string;
    avatar_url?: string;
  } | null>(null);

  const [communities, setCommunities] = useState<
    {
      id: string;
      name: string;
      description: string;
      created_at: string;
    }[]
  >([]);

  const [leaguesCount, setLeaguesCount] = useState(0);
  const [cupsCount, setCupsCount] = useState(0);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/login");
          return;
        }

        // Load profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("full_name, username, avatar_url")
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.log("Profile error (may not exist yet):", profileError.message);
        } else {
          setProfile(profileData);
        }

        // Load communities
        const { data: communityData, error: communityError } = await supabase
          .from("communities")
          .select("id, name, description, created_at")
          .eq("owner_id", user.id)
          .order("created_at", { ascending: false });

        if (communityError) {
          console.log("Communities error:", communityError.message);
        } else {
          setCommunities(communityData || []);
        }

        // Load leagues count
        const { count: leaguesCount, error: leaguesError } = await supabase
          .from("leagues")
          .select("*", { count: "exact", head: true })
          .eq("created_by", user.id);

        if (!leaguesError) {
          setLeaguesCount(leaguesCount || 0);
        }

        // Load cups count
        const { count: cupsCount, error: cupsError } = await supabase
          .from("cups")
          .select("*", { count: "exact", head: true })
          .eq("created_by", user.id);

        if (!cupsError) {
          setCupsCount(cupsCount || 0);
        }

        // Load recent activity
        const { data: recentFixtures, error: recentError } = await supabase
          .from("fixtures")
          .select(`
            *,
            home_team:league_teams!home_team_id(team_name),
            away_team:league_teams!away_team_id(team_name),
            leagues!inner(name)
          `)
          .eq("played", true)
          .order("played_at", { ascending: false })
          .limit(5);

        if (!recentError && recentFixtures) {
          setRecentActivity(recentFixtures);
        }

      } catch (error) {
        console.error("Dashboard load error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // Get initials for avatar fallback
  const getInitials = () => {
    if (!profile?.full_name) return "?";
    return profile.full_name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-4xl mb-4">🏆</div>
          <p className="text-zinc-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header with gradient */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-900/40 to-blue-900/40 p-8 mb-8 border border-zinc-800">
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -ml-32 -mb-32" />
          
          <div className="relative flex items-center gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
              ) : (
                getInitials()
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                Welcome back,{" "}
                <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                  {profile?.full_name || "Player"}
                </span>
              </h1>
              <p className="text-zinc-400 mt-1">
                @{profile?.username || "user"} • eFootball Tournament Manager
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-green-500/50 transition">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 text-sm">Communities</span>
              <span className="text-2xl">👥</span>
            </div>
            <div className="text-3xl font-bold mt-2">{communities.length}</div>
            <div className="text-xs text-zinc-500 mt-1">Total communities</div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-blue-500/50 transition">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 text-sm">Leagues</span>
              <span className="text-2xl">⚽</span>
            </div>
            <div className="text-3xl font-bold mt-2 text-blue-400">{leaguesCount}</div>
            <div className="text-xs text-zinc-500 mt-1">Total leagues</div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-purple-500/50 transition">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 text-sm">Cups</span>
              <span className="text-2xl">🏆</span>
            </div>
            <div className="text-3xl font-bold mt-2 text-purple-400">{cupsCount}</div>
            <div className="text-xs text-zinc-500 mt-1">Total cups</div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-yellow-500/50 transition">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 text-sm">Recent</span>
              <span className="text-2xl">📊</span>
            </div>
            <div className="text-3xl font-bold mt-2 text-yellow-400">{recentActivity.length}</div>
            <div className="text-xs text-zinc-500 mt-1">Recent matches</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="text-xl">⚡</span> Quick Actions
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/create-community"
              className="bg-green-600 hover:bg-green-700 px-5 py-2.5 rounded-lg font-medium transition flex items-center gap-2"
            >
              <span className="text-lg">➕</span> Community
            </Link>
            <Link
              href="/create-league"
              className="bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-lg font-medium transition flex items-center gap-2"
            >
              <span className="text-lg">⚽</span> League
            </Link>
            <Link
              href="/cups/create"
              className="bg-purple-600 hover:bg-purple-700 px-5 py-2.5 rounded-lg font-medium transition flex items-center gap-2"
            >
              <span className="text-lg">🏆</span> Cup
            </Link>
            <Link
              href="/cups"
              className="bg-purple-800 hover:bg-purple-900 px-5 py-2.5 rounded-lg font-medium transition flex items-center gap-2"
            >
              <span className="text-lg">📋</span> View Cups
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-5 py-2.5 rounded-lg font-medium transition flex items-center gap-2 ml-auto"
            >
              <span className="text-lg">🚪</span> Logout
            </button>
          </div>
        </div>

        {/* Two Column Layout: Communities + Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Communities */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <span className="text-xl">👥</span> My Communities
                <span className="text-xs bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-400">
                  {communities.length}
                </span>
              </h2>
              <Link href="/create-community" className="text-sm text-green-400 hover:text-green-300 transition">
                + New
              </Link>
            </div>

            {communities.length === 0 ? (
              <div className="text-center py-8 text-zinc-500">
                <p className="text-4xl mb-2">🏗️</p>
                <p>No communities yet</p>
                <p className="text-sm">Create your first community to get started</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {communities.map((community) => (
                  <Link
                    key={community.id}
                    href={`/community/${community.id}`}
                    className="block bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 rounded-lg p-4 transition group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-green-400 group-hover:text-green-300 transition">
                          ⚽ {community.name}
                        </h3>
                        {community.description && (
                          <p className="text-sm text-zinc-400 mt-0.5 line-clamp-1">
                            {community.description}
                          </p>
                        )}
                      </div>
                      <span className="text-zinc-600 group-hover:text-zinc-400 transition text-xl">→</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="text-xl">📊</span> Recent Activity
            </h2>

            {recentActivity.length === 0 ? (
              <div className="text-center py-8 text-zinc-500">
                <p className="text-4xl mb-2">📭</p>
                <p>No recent activity</p>
                <p className="text-sm">Start playing matches to see activity here</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {recentActivity.map((match) => (
                  <div
                    key={match.id}
                    className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-white">{match.home_team?.team_name}</span>
                          <span className="text-yellow-400 font-bold">
                            {match.home_score} - {match.away_score}
                          </span>
                          <span className="font-medium text-white">{match.away_team?.team_name}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                          <span>📋 {match.leagues?.name || 'League'}</span>
                          <span>•</span>
                          <span>✅ Played</span>
                          {match.played_at && (
                            <>
                              <span>•</span>
                              <span>{new Date(match.played_at).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-zinc-600 border-t border-zinc-800 pt-6">
          eLeague SA • eFootball Tournament Manager • Built with ❤️
        </div>
      </div>

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #3f3f46;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #52525b;
        }
      `}</style>
    </main>
  );
}