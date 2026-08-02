"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabase";

export default function AddTeamPage() {
  const params = useParams();
  const router = useRouter();

  const [teamName, setTeamName] = useState("");
  const [managerName, setManagerName] = useState("");
  const [logo, setLogo] = useState("");

  const handleCreate = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please login first.");
      return;
    }

    if (!teamName || !managerName) {
      alert("Please complete all required fields.");
      return;
    }

    const { error } = await supabase
      .from("league_teams")
      .insert({
        league_id: params.id,
        owner_id: user.id,
        team_name: teamName,
        manager_name: managerName,
        logo,
      });

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    alert("✅ Team added successfully!");

    router.push(`/league/${params.id}`);
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white flex justify-center items-center p-6">
      <div className="bg-zinc-900 rounded-2xl p-8 w-full max-w-lg">

        <h1 className="text-3xl font-bold text-green-500 mb-6">
          ➕ Add Team
        </h1>

        <div className="space-y-4">

          <input
            type="text"
            placeholder="Team Name"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            className="w-full p-3 rounded bg-zinc-800"
          />

          <input
            type="text"
            placeholder="Manager Name"
            value={managerName}
            onChange={(e) => setManagerName(e.target.value)}
            className="w-full p-3 rounded bg-zinc-800"
          />

          <input
            type="text"
            placeholder="Logo URL (optional)"
            value={logo}
            onChange={(e) => setLogo(e.target.value)}
            className="w-full p-3 rounded bg-zinc-800"
          />

          <button
            onClick={handleCreate}
            className="w-full bg-green-600 hover:bg-green-700 p-3 rounded-lg font-bold"
          >
            Create Team
          </button>

        </div>

      </div>
    </main>
  );
}