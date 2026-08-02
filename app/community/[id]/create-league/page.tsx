"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabase";

export default function CreateLeaguePage() {
  const params = useParams();
  const router = useRouter();

  const [name, setName] = useState("");
  const [season, setSeason] = useState("");
  const [maxTeams, setMaxTeams] = useState(20);
  const [homeAway, setHomeAway] = useState(true);
  const [pointsForWin, setPointsForWin] = useState(3);

  const handleCreate = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please log in.");
      return;
    }

    const { error } = await supabase
      .from("leagues")
      .insert({
        community_id: params.id,
        owner_id: user.id,
        name,
        season,
        max_teams: maxTeams,
        home_away: homeAway,
        points_for_win: pointsForWin,
      });

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    alert("🏆 League created successfully!");

    router.push(`/community/${params.id}`);
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
      <div className="bg-zinc-900 rounded-2xl p-8 w-full max-w-lg">

        <h1 className="text-3xl font-bold text-green-500 mb-6">
          Create League
        </h1>

        <div className="space-y-4">

          <input
            type="text"
            placeholder="League Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 rounded bg-zinc-800"
          />

          <input
            type="text"
            placeholder="Season (e.g. 2026)"
            value={season}
            onChange={(e) => setSeason(e.target.value)}
            className="w-full p-3 rounded bg-zinc-800"
          />

          <input
            type="number"
            placeholder="Maximum Teams"
            value={maxTeams}
            onChange={(e) => setMaxTeams(Number(e.target.value))}
            className="w-full p-3 rounded bg-zinc-800"
          />

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={homeAway}
              onChange={(e) => setHomeAway(e.target.checked)}
            />
            Home & Away
          </label>

          <input
            type="number"
            placeholder="Points for a Win"
            value={pointsForWin}
            onChange={(e) => setPointsForWin(Number(e.target.value))}
            className="w-full p-3 rounded bg-zinc-800"
          />

          <button
            onClick={handleCreate}
            className="w-full bg-green-600 hover:bg-green-700 p-3 rounded-lg font-bold"
          >
            Create League
          </button>

        </div>
      </div>
    </main>
  );
}