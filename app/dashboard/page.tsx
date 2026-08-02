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
  } | null>(null);

  const [communities, setCommunities] = useState<
    {
      id: string;
      name: string;
      description: string;
    }[]
  >([]);

  useEffect(() => {
    const loadDashboard = async () => {
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
        .select("full_name, username")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error(profileError);
      } else {
        setProfile(profileData);
      }

      // Load communities
      const { data: communityData, error: communityError } = await supabase
        .from("communities")
        .select("id, name, description")
        .eq("owner_id", user.id);

      if (communityError) {
        console.error(communityError);
      } else {
        setCommunities(communityData || []);
      }
    };

    loadDashboard();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-5xl mx-auto">

        <h1 className="text-4xl font-bold text-green-500 mb-2">
          🏆 Welcome to eLeague SA
        </h1>

        <p className="text-xl">
          👋 Hello{" "}
          <span className="text-green-400 font-bold">
            {profile?.full_name}
          </span>
        </p>

        <p className="text-zinc-400 mb-8">
          @{profile?.username}
        </p>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-6 mb-10">

          <div className="bg-zinc-900 rounded-xl p-6 text-center">
            <h2 className="text-3xl font-bold">
              {communities.length}
            </h2>
            <p className="text-zinc-400">
              Communities
            </p>
          </div>

          <div className="bg-zinc-900 rounded-xl p-6 text-center">
            <h2 className="text-3xl font-bold">0</h2>
            <p className="text-zinc-400">
              Leagues
            </p>
          </div>

          <div className="bg-zinc-900 rounded-xl p-6 text-center">
            <h2 className="text-3xl font-bold">0</h2>
            <p className="text-zinc-400">
              Cups
            </p>
          </div>

        </div>

        {/* My Communities */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-4">
            My Communities
          </h2>

          {communities.length === 0 ? (
            <p className="text-zinc-400">
              You haven't created any communities yet.
            </p>
          ) : (
            <div className="space-y-4">
              {communities.map((community) => (
                <Link
                  key={community.id}
                  href={`/community/${community.id}`}
                  className="block bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-green-500 hover:bg-zinc-800 transition"
                >
                  <h3 className="text-xl font-bold text-green-400">
                    ⚽ {community.name}
                  </h3>

                  <p className="text-zinc-400 mt-2">
                    {community.description}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-4">

          <Link
            href="/create-community"
            className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-bold"
          >
            + Create Community
          </Link>

          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-bold"
          >
            Logout
          </button>

        </div>

      </div>
    </main>
  );
}